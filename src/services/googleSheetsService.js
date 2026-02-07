import { getAccessToken } from './googleAuth';
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * List all monthly budget sheets from Google Drive
 * Sorting: 
 * 1. By year (latest first)
 * 2. If year unavailable, sort by last modified date (latest first)
 * 3. Within each year, also sort by last modified (latest first)
 */
export const listMonthlySheets = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  const params = new URLSearchParams({
    q: "name contains 'Monthly budget' and mimeType='application/vnd.google-apps.spreadsheet'",
    spaces: 'drive',
    pageSize: '50',
    fields: 'files(id, name, modifiedTime)',
  });
  const res = await fetch(`${DRIVE_API}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to list sheets');
  const data = await res.json();
  const files = data.files || [];

  // Extract year from filename and prepare for sorting
  const filesWithYear = files.map(file => {
    // Try to extract year from filename (e.g., "Monthly budget 2025", "Monthly budget January 2024")
    const yearMatch = file.name.match(/\b(202[0-9]|201[0-9]|19[0-9]{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 0;
    const modifiedTime = file.modifiedTime ? new Date(file.modifiedTime).getTime() : 0;
    
    return {
      ...file,
      year,
      modifiedTime,
    };
  });

  // Sort by: 
  // 1. Year descending (latest year first)
  // 2. ModifiedTime descending within the same year (latest modified first)
  // 3. For files with no year, sort by modifiedTime only
  return filesWithYear.sort((a, b) => {
    // If both have years, sort by year first
    if (a.year !== 0 && b.year !== 0) {
      if (a.year !== b.year) {
        return b.year - a.year; // Descending year
      }
      // Same year, sort by modified time
      return b.modifiedTime - a.modifiedTime;
    }
    
    // If only one has a year, it comes first
    if (a.year !== 0) return -1;
    if (b.year !== 0) return 1;
    
    // Neither has a year, sort by modified time
    return b.modifiedTime - a.modifiedTime;
  });
};

/**
 * Helper to convert Google Sheets Serial Date to YYYY-MM-DD
 */
const serialDateToISO = (serial) => {
  if (!serial || isNaN(serial)) return '';
  // Excel/Sheets base date is Dec 30, 1899. 25569 is the offset to Unix Epoch.
  const date = new Date((serial - 25569) * 86400 * 1000);
  // Add 12 hours to avoid timezone shifting issues (dates are usually midnight)
  date.setHours(date.getHours() + 12);
  return date.toISOString().split('T')[0];
};

/**
 * Get EXPENSE transactions from a specific sheet (Columns B-E)
 * Uses UNFORMATTED_VALUE to get raw numbers for amounts and serial dates
 */
export const getTransactions = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  
  // Use UNFORMATTED_VALUE to get raw numbers and dates
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!B:E?valueRenderOption=UNFORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) throw new Error('Failed to get transactions');
  const data = await res.json();
  const values = data.values || [];
  
  // Skip rows 1-4 (metadata and headers), start from row 5
  return values.slice(4).map((row, index) => {
    // row[0] = Date (Serial Number), row[1] = Amount (Number), row[2] = Desc, row[3] = Cat
    
    // Parse Date
    let dateStr = '';
    if (typeof row[0] === 'number') {
      dateStr = serialDateToISO(row[0]);
    } else {
      dateStr = row[0] || ''; // Fallback if it's already a string
    }

    // Parse Amount (It's already a number or raw string)
    const amount = Number(row[1]) || 0;

    return {
      id: index + 5, 
      date: dateStr,
      amount: amount,
      description: (row[2] || '').toString(),
      category: (row[3] || '').toString(),
      type: 'expense'
    };
  });
};

/**
 * Get INCOME transactions from a specific sheet (Columns G-J)
 * Uses UNFORMATTED_VALUE to get raw numbers for amounts and serial dates
 */
export const getIncomeTransactions = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!G:J?valueRenderOption=UNFORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) throw new Error('Failed to get income transactions');
  const data = await res.json();
  const values = data.values || [];
  
  // Skip rows 1-4 (metadata and headers), start from row 5
  return values.slice(4).map((row, index) => {
    // Filter out empty rows
    if (!row[0] && !row[1] && !row[2]) return null;

    // Parse Date
    let dateStr = '';
    if (typeof row[0] === 'number') {
      dateStr = serialDateToISO(row[0]);
    } else {
      dateStr = row[0] || '';
    }

    // Parse Amount
    const amount = Number(row[1]) || 0;

    return {
      id: index + 5,
      date: dateStr,
      amount: amount,
      description: (row[2] || '').toString(),
      category: (row[3] || '').toString(),
      type: 'income'
    };
  }).filter(item => item !== null);
};

/**
 * Add a new EXPENSE transaction to the sheet (Columns B-E)
 */
export const addTransaction = async (spreadsheetId, transaction) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  // 1. Check for the first empty row in column B (Date) starting from row 5
  const checkRes = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!B:B`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!checkRes.ok) throw new Error('Failed to check existing transactions');
  const checkData = await checkRes.json();
  const rows = checkData.values || [];
  
  // Start searching from row 5 (index 4)
  let nextRow = rows.length + 1;
  
  for (let i = 4; i < rows.length; i++) {
    if (!rows[i] || rows[i].length === 0 || !rows[i][0]) {
      nextRow = i + 1;
      break;
    }
  }
  
  if (nextRow < 5) nextRow = 5;

  const values = [
    transaction.date,
    transaction.amount,
    transaction.description,
    transaction.category,
  ];

  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!B${nextRow}:E${nextRow}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `Transactions!B${nextRow}:E${nextRow}`,
      majorDimension: 'ROWS',
      values: [values],
    }),
  });

  if (!res.ok) throw new Error('Failed to add transaction');
  return await res.json();
};

/**
 * Add a new INCOME transaction to the sheet (Columns G-J)
 */
export const addIncomeTransaction = async (spreadsheetId, transaction) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  // 1. Check for the first empty row in column G (Date) starting from row 5
  const checkRes = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!G:G`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!checkRes.ok) throw new Error('Failed to check existing income transactions');
  const checkData = await checkRes.json();
  const rows = checkData.values || [];
  
  // Start searching from row 5 (index 4)
  let nextRow = rows.length + 1;
  
  for (let i = 4; i < rows.length; i++) {
    if (!rows[i] || rows[i].length === 0 || !rows[i][0]) {
      nextRow = i + 1;
      break;
    }
  }
  
  if (nextRow < 5) nextRow = 5;

  // Column order: G=date, H=amount, I=description, J=category
  const values = [
    transaction.date,
    transaction.amount,
    transaction.description,
    transaction.category,
  ];

  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!G${nextRow}:J${nextRow}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `Transactions!G${nextRow}:J${nextRow}`,
      majorDimension: 'ROWS',
      values: [values],
    }),
  });

  if (!res.ok) throw new Error('Failed to add income transaction');
  return await res.json();
};

/**
 * Update an existing EXPENSE transaction in the sheet
 */
export const updateTransaction = async (spreadsheetId, rowNumber, transaction) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  const values = [
    transaction.date,
    transaction.amount,
    transaction.description,
    transaction.category,
  ];
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!B${rowNumber}:E${rowNumber}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `Transactions!B${rowNumber}:E${rowNumber}`,
      majorDimension: 'ROWS',
      values: [values],
    }),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  return await res.json();
};

/**
 * Update an existing INCOME transaction in the sheet
 */
export const updateIncomeTransaction = async (spreadsheetId, rowNumber, transaction) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  const values = [
    transaction.date,
    transaction.amount,
    transaction.description,
    transaction.category,
  ];
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!G${rowNumber}:J${rowNumber}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `Transactions!G${rowNumber}:J${rowNumber}`,
      majorDimension: 'ROWS',
      values: [values],
    }),
  });
  if (!res.ok) throw new Error('Failed to update income transaction');
  return await res.json();
};

/**
 * Delete an EXPENSE transaction from the sheet (Shifts cells B:E up)
 */
export const deleteTransaction = async (spreadsheetId, rowNumber) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  
  // Use deleteRange to only affect columns B:E (indexes 1-4)
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteRange: {
            range: {
              sheetId: 0,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 1, // B
              endColumnIndex: 5,   // E (exclusive, so B, C, D, E)
            },
            shiftDimension: 'ROWS', // Shift UP
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return await res.json();
};

/**
 * Delete an INCOME transaction from the sheet (Shifts cells G:J up)
 */
export const deleteIncomeTransaction = async (spreadsheetId, rowNumber) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  
  // Use deleteRange to only affect columns G:J (indexes 6-9)
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteRange: {
            range: {
              sheetId: 0,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 6, // G
              endColumnIndex: 10,  // J (exclusive, so G, H, I, J)
            },
            shiftDimension: 'ROWS', // Shift UP
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error('Failed to delete income transaction');
  return await res.json();
};

/**
 * Get summary data from the sheet
 */
export const getSummary = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  
  // Helper to parse currency values
  const parseCurrency = (val) => {
    if (!val) return 0;
    const str = String(val).replace(/[£,₹+\-\s]/g, '').trim();
    return parseFloat(str) || 0;
  };

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    endBalance: 0,
    categoryBreakdown: {},
    expenseCategories: [],
    incomeCategories: [],
  };

  try {
    // Read the sheet to get totals and categories
    const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Summary!A:K`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to get summary');
    const data = await res.json();
    const values = data.values || [];
    
    // Row 26 (index 25) contains totals: E26 = expenses, K26 or I22 = income
    // Note: User's sheet might have changed, but sticking to existing logic unless told otherwise.
    if (values[25]) {
      const row26 = values[25];
      const row22 = values[21];
      summary.totalExpenses = parseCurrency(row26[4]); // Column E (index 4)
      summary.totalIncome = parseCurrency(row26[10]) || parseCurrency(row22[8]); // Column K (index 10) or I22 (index 8)
    }

    // Get End Balance from E17-D17 (index 16, column 4 - column 3)
    if (values[16]) {
        const actual = parseCurrency(values[16][4]);
        const planned = parseCurrency(values[16][3]);
        summary.endBalance = actual - planned;
    }
    
    // Parse categories starting from row 28 (index 27)
    for (let i = 27; i < values.length; i++) {
      const row = values[i];
      if (!row) continue;
      
      // 1. Expense Categories: B28+C28 (combined), E28 = actual amount
      const expColB = (row[1] || '').toString().trim();
      const expColC = (row[2] || '').toString().trim();
      const expCategoryName = (expColB + (expColC ? ' ' + expColC : '')).trim();
      
      // 2. Income Categories: H28+I28 (combined) - Column H=7, I=8
      const incColH = (row[7] || '').toString().trim();
      const incColI = (row[8] || '').toString().trim();
      const incCategoryName = (incColH + (incColI ? ' ' + incColI : '')).trim();

      // Skip common headers and metadata
      const isHeader = (name) => !name || 
        name === 'Expenses' || name === 'Income' || 
        name.includes('Planned') || name.includes('Actual') || 
        name.includes('Diff') || name.includes('Totals');

      // Add Expense Category
      if (!isHeader(expCategoryName)) {
        if (!summary.expenseCategories.includes(expCategoryName)) {
          summary.expenseCategories.push(expCategoryName);
        }
        const amount = parseCurrency(row[4]); // Column E
        if (amount > 0 || expCategoryName) {
          summary.categoryBreakdown[expCategoryName] = amount;
        }
      }

      // Add Income Category
      if (!isHeader(incCategoryName)) {
        if (!summary.incomeCategories.includes(incCategoryName)) {
          summary.incomeCategories.push(incCategoryName);
        }
      }
    }
    
    // Sort categories
    summary.expenseCategories.sort();
    summary.incomeCategories.sort();
    
  } catch (error) {
    console.error('Error getting summary:', error);
  }

  summary.savings = summary.totalIncome - summary.totalExpenses;
  return summary;
};

/**
 * Find the Net Worth Tracker spreadsheet
 */
export const findNetWorthFile = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const params = new URLSearchParams({
    q: "name = 'Net Worth Tracker' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    spaces: 'drive',
    fields: 'files(id, name, modifiedTime)',
  });

  const res = await fetch(`${DRIVE_API}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to find Net Worth Tracker');
  const data = await res.json();
  // Return the first match, or null
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

/**
 * Get data from the "Net Worth" tab
 * Columns:
 * A: Month
 * B: Savings A/C
 * C: Stocks
 * D: Mutual Funds
 * E: PPF
 * F: Total Assets
 * G: Total Liabilities
 * H: Net Worth
 * I: Comment
 */
export const getNetWorthData = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/'Net Worth'!A2:I?valueRenderOption=UNFORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to get Net Worth data');
  const data = await res.json();
  const values = data.values || [];

  const allEntries = values.map((row) => {
    // Parse Date
    let dateStr = '';
    if (typeof row[0] === 'number') {
      dateStr = serialDateToISO(row[0]);
    } else {
      dateStr = row[0] || '';
    }

    // Helper to safely parse numbers
    const getNum = (val) => Number(val) || 0;

    return {
      date: dateStr,
      savings: getNum(row[1]),
      stocks: getNum(row[2]),
      mutualFunds: getNum(row[3]),
      ppf: getNum(row[4]),
      totalAssets: getNum(row[5]),
      totalLiabilities: getNum(row[6]),
      netWorth: getNum(row[7]),
      comment: (row[8] || '').toString(),
    };
  });

  // Find the index of the last row where Savings A/C (column B / index 1) is not empty/zero
  // This "locks in" the current month and ignores future placeholder rows
  let lastValidIndex = -1;
  for (let i = allEntries.length - 1; i >= 0; i--) {
    if (allEntries[i].savings !== 0 && allEntries[i].date) {
      lastValidIndex = i;
      break;
    }
  }

  // If no valid entries found, return empty
  if (lastValidIndex === -1) return [];

  // Return only data up to that row
  return allEntries.slice(0, lastValidIndex + 1);
};

/**
 * Add (Update) the next available loan entry
 * Scans for the first row where 'Paid' and 'Interest' are empty,
 * and updates it with the provided values.
 */
export const addLoanEntry = async (spreadsheetId, transaction) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  // 1. Find the next empty row in columns C (Paid) and D (Interest)
  // Fetching C2:D to skip header
  const checkRes = await fetch(`${SHEETS_API}/${spreadsheetId}/values/'Loan'!C2:D`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!checkRes.ok) throw new Error('Failed to find next loan slot');
  const checkData = await checkRes.json();
  const rows = checkData.values || [];
  
  // Find first row where Paid (0) and Interest (1) are empty/undefined/0
  let nextRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const paid = rows[i][0];
    const interest = rows[i][1];
    // Check if empty or explicitly 0 (assuming pre-filled 0s means filled, but usually blank means empty)
    // In our previous logic, we considered 0 as valid data.
    // So we look for "falsy" or empty string. 
    // Actually, if the sheet is a template, it might be blank.
    if (!paid && !interest) {
      nextRowIndex = i;
      break;
    }
  }
  
  // If no empty row found in the fetched range, assume it's the next one after the last fetched row
  if (nextRowIndex === -1) {
    nextRowIndex = rows.length;
  }

  // Calculate actual sheet row number (Index + 2 because we started at C2)
  const sheetRow = nextRowIndex + 2;

  const values = [
    transaction.paid,
    transaction.interest,
    transaction.balance
  ];

  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/'Loan'!C${sheetRow}:E${sheetRow}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `'Loan'!C${sheetRow}:E${sheetRow}`,
      majorDimension: 'ROWS',
      values: [values],
    }),
  });

  if (!res.ok) throw new Error('Failed to add loan entry');
  return await res.json();
};

/**
 * Update an existing loan entry
 */
export const updateLoanEntry = async (spreadsheetId, rowIndex, transaction) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  // Calculate actual sheet row number (rowIndex is 0-based from the data array which starts at row 2)
  const sheetRow = rowIndex + 2;

  const values = [
    transaction.paid,
    transaction.interest,
    transaction.balance
  ];

  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/'Loan'!C${sheetRow}:E${sheetRow}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `'Loan'!C${sheetRow}:E${sheetRow}`,
      majorDimension: 'ROWS',
      values: [values],
    }),
  });

  if (!res.ok) throw new Error('Failed to update loan entry');
  return await res.json();
};

/**
 * Get data from the "Loan" tab
 * Columns:
 * A: Year
 * B: Month
 * C: Paid
 * D: Interest
 * E: Balance
 */
export const getLoanData = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/'Loan'!A2:E?valueRenderOption=UNFORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to get Loan data');
  const data = await res.json();
  const values = data.values || [];

  const allEntries = values.map((row) => {
    const year = row[0];
    const month = row[1];
    
    // Construct date from Year + Month (e.g., 2025 + "April")
    let dateStr = '';
    if (year && month) {
       const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Parse month name
       if (!isNaN(monthIndex)) {
          // Create date using local time to avoid timezone shifts
          const d = new Date(year, monthIndex, 1);
          // Format as YYYY-MM-DD
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateStr = `${y}-${m}-${day}`;
       }
    }

    const getNum = (val) => Number(val) || 0;

    return {
      date: dateStr,
      year,
      month,
      paid: getNum(row[2]),
      interest: getNum(row[3]),
      balance: getNum(row[4]),
    };
  });

  // Filter out entries with no paid amount AND no interest (future empty rows)
  let lastValidIndex = -1;
  for (let i = allEntries.length - 1; i >= 0; i--) {
    if (allEntries[i].paid !== 0 || allEntries[i].interest !== 0) {
      lastValidIndex = i;
      break;
    }
  }

  if (lastValidIndex === -1) return [];
  return allEntries.slice(0, lastValidIndex + 1);
};