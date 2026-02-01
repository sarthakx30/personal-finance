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
 * Get EXPENSE transactions from a specific sheet (Columns B-E)
 */
export const getTransactions = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!B:E`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to get transactions');
  const data = await res.json();
  const values = data.values || [];
  // Skip rows 1-4 (metadata and headers), start from row 5
  // Column order: B=date, C=amount, D=description, E=category
  return values.slice(4).map((row, index) => {
    // Parse amount: remove currency symbol and commas
    const amountStr = (row[1] || '').toString().replace(/[£,₹]/g, '').trim();
    const amount = parseFloat(amountStr) || 0;
    return {
      id: index + 5, // Row number in sheet (accounting for 4 header rows)
      date: row[0] || '',
      amount: amount,
      description: row[2] || '',
      category: row[3] || '',
      type: 'expense'
    };
  });
};

/**
 * Get INCOME transactions from a specific sheet (Columns G-J)
 */
export const getIncomeTransactions = async (spreadsheetId) => {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values/Transactions!G:J`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to get income transactions');
  const data = await res.json();
  const values = data.values || [];
  // Skip rows 1-4 (metadata and headers), start from row 5
  // Column order: G=date, H=amount, I=description, J=category
  return values.slice(4).map((row, index) => {
    // Filter out empty rows
    if (!row[0] && !row[1] && !row[2]) return null;

    // Parse amount: remove currency symbol and commas
    const amountStr = (row[1] || '').toString().replace(/[£,₹]/g, '').trim();
    const amount = parseFloat(amountStr) || 0;
    return {
      id: index + 5, // Row number in sheet
      date: row[0] || '',
      amount: amount,
      description: row[2] || '',
      category: row[3] || '',
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
    // B28+C28 = category name (combined), E28 = actual amount
    for (let i = 27; i < values.length; i++) {
      const row = values[i];
      if (!row) continue;
      
      // Combine B and C columns for category name
      const colB = (row[1] || '').toString().trim();
      const colC = (row[2] || '').toString().trim();
      const categoryName = (colB + (colC ? ' ' + colC : '')).trim();
      const categoryAmount = row[4] || ''; // Column E (index 4)
      
      // Skip empty rows and header rows
      if (!categoryName || categoryName === 'Expenses') continue;
      
      // Skip if the row starts with metadata
      if (categoryName.includes('Planned') || categoryName.includes('Actual') || 
          categoryName.includes('Diff') || categoryName.includes('Totals') ||
          categoryName.includes('Income')) {
        continue;
      }
      
      // Add to unique list of categories
      if (!summary.expenseCategories.includes(categoryName)) {
        summary.expenseCategories.push(categoryName);
      }

      const amount = parseCurrency(categoryAmount);
      if (amount > 0 || categoryName) {
        summary.categoryBreakdown[categoryName] = amount;
      }
    }
    
    // Sort categories
    summary.expenseCategories.sort();
    
  } catch (error) {
    console.error('Error getting summary:', error);
  }

  summary.savings = summary.totalIncome - summary.totalExpenses;
  return summary;
};