# Personal Finance Tracker - MVP Plan

## Project Overview

A web application that serves as a better interface for managing personal finance data stored in Google Sheets. The app will read from and write to existing Google Sheets that follow a specific monthly budget tracking format.

## Problem Statement

The user currently tracks finances in Google Sheets with a consistent format:
- Monthly sheets with start/end dates based on salary payment (varies ±2 days)
- Transaction-level tracking with categories
- Summary calculations for monthly overview
- Need for better interface than direct Google Sheets editing
- Plans for future analytics and multi-year insights

## Current User Workflow

1. **Monthly Setup:** Duplicates previous month's sheet, changes dates, clears transactions
2. **Storage:** All sheets stored in Google Drive root folder (no specialized folders yet)
3. **Usage:** Adds transactions almost daily on both mobile and desktop
4. **Editing:** Occasionally edits or deletes past transactions
5. **Categories:** Fixed set of 11 categories (99% complete list)

## Existing Google Sheets Structure

### Sheet Naming Convention
Format: `[Start Date] [End Date] Monthly budget [Year] [Sheet Type]`
Example: `24 December 22 January Monthly budget 2026 Transactions`

### Transactions Sheet (Tab)
Columns:
- Date
- Category
- Description  
- Amount

Expense Categories (Fixed List):
- Food	
- Gifts	
- Health / Medical	
- Home Supplies / Groceries	
- Transportation / Uber	
- Personal	
- Pets	
- Travel / Fuel	
- Debt	
- Other	
- Trip	
- Mom	
- Saksham Bhaiya	
- Osheen	
- Office Outing / Spends	
- Drinks / Party	
- Home Bills	
- Subscription / Phone Bills	
- Dates	
- Investment	
- Mandir	
- Personal Outing	
- Credit Card Bill	
- Family Outing	
- Cash	
- Savings	
- EMI	

### Summary Sheet (Tab)
- Total Income
- Total Expenses
- Savings
- Category-wise expense breakdowns
- **Note:** Summary is READ-ONLY for the app (for consistency)

## MVP Scope - Phase 1

### Core Functionality

#### 1. Authentication
- Google OAuth 2.0 integration
- Login/Logout functionality
- Persist authentication state
- Request permissions for Google Sheets API access

#### 2. Sheet Selection
- List all monthly budget sheets from Google Drive
- Allow user to select which monthly sheet to work with
- Store current selection in app state
- Display currently selected sheet name/dates

#### 3. Transaction Management (CRUD Operations)

**Read:**
- Fetch and display all transactions from Transactions tab
- Show in table/list format
- Mobile and desktop responsive design

**Create:**
- Form to add new transaction with fields:
  - Date (date picker)
  - Category (dropdown from fixed list)
  - Description (text input)
  - Amount (number input)
- Validate inputs before submission
- Write to Transactions tab in Google Sheets
- Refresh transaction list after adding

**Update:**
- Edit existing transactions (inline or modal)
- Update specific row in Transactions tab
- Refresh transaction list after editing

**Delete:**
- Delete transaction with confirmation
- Remove row from Transactions tab
- Refresh transaction list after deletion

#### 4. Summary Dashboard
- Read data from Summary tab
- Display key metrics:
  - Total Income
  - Total Expenses  
  - Savings
  - Category-wise breakdown
- READ-ONLY view (no writes to Summary tab)
- Auto-refresh when transactions are modified

#### 5. User Interface Requirements
- Clean, modern design using Tailwind CSS
- Mobile-first responsive design (works on both mobile and desktop)
- Fast loading and interactions
- Clear visual feedback for all actions
- Error handling with user-friendly messages

## Technical Stack

### Frontend
- **Framework:** React (using Vite for setup)
- **Styling:** Tailwind CSS
- **State Management:** React hooks (useState, useEffect, useContext)

### Backend/API
- **Direct Integration:** Google Sheets API (no separate backend server)
- **Authentication:** Google OAuth 2.0
- **API Library:** gapi-script (Google API JavaScript client)

### Storage
- **Primary Data:** Google Sheets (existing user sheets)
- **App State:** React state + sessionStorage/localStorage for auth tokens and sheet selection

## Project Structure

```
finance-tracker/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── auth/
│   │   │   └── AuthButton.jsx   # Login/Logout button
│   │   ├── sheets/
│   │   │   └── SheetSelector.jsx # Monthly sheet selection
│   │   ├── transactions/
│   │   │   ├── TransactionList.jsx    # Display transactions
│   │   │   ├── TransactionForm.jsx    # Add new transaction
│   │   │   ├── TransactionItem.jsx    # Single transaction row
│   │   │   └── TransactionEdit.jsx    # Edit transaction
│   │   └── dashboard/
│   │       └── SummaryDashboard.jsx   # Summary view
│   ├── services/                # API and business logic
│   │   ├── googleAuth.js        # Google OAuth handling
│   │   └── googleSheetsService.js # All Sheets API calls
│   ├── hooks/                   # Custom React hooks
│   │   ├── useGoogleAuth.js     # Auth state management
│   │   └── useGoogleSheets.js   # Sheets data management
│   ├── utils/                   # Helper functions
│   │   ├── formatters.js        # Date, currency formatting
│   │   └── validators.js        # Input validation
│   ├── config/                  # Configuration
│   │   ├── googleConfig.js      # API keys, scopes
│   │   └── categories.js        # Fixed category list
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── public/
├── .env.local                   # Environment variables (gitignored)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Setup Instructions

### 1. Project Initialization

```bash
# Create React app with Vite
npm create vite@latest finance-tracker -- --template react
cd finance-tracker

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Google API library
npm install gapi-script
```

### 2. Tailwind Configuration

Update `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Google Cloud Setup (Manual Steps)

**Prerequisites:**
- Google account
- Google Cloud Console access

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Finance Tracker"
3. Enable Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure consent screen if prompted
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:5173` (for development)
   - Authorized redirect URIs: `http://localhost:5173` (for development)
   - Copy the **Client ID**
5. Create API Key:
   - Click "Create Credentials" > "API key"
   - Copy the **API Key**

### 4. Environment Configuration

Create `.env.local` in project root:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

Add to `.gitignore`:
```
.env.local
```

## Google Sheets API Integration

### Required Scopes
```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];
```

### Key API Operations

#### Authentication
- Initialize gapi client
- Load auth2 library
- Sign in/out
- Get access token
- Check auth status

#### List Sheets
- Search Google Drive for files matching naming pattern
- Filter by file type (Google Sheets)
- Return list with file IDs and names

#### Read Transactions
- Use spreadsheets.values.get
- Range: 'Transactions!A:D' (Date, Category, Description, Amount)
- Parse response into array of transaction objects

#### Write Transaction
- Use spreadsheets.values.append
- Range: 'Transactions!A:D'
- Value input option: 'USER_ENTERED'
- Format: [[date, category, description, amount]]

#### Update Transaction
- Use spreadsheets.values.update
- Range: 'Transactions!A{row}:D{row}'
- Value input option: 'USER_ENTERED'

#### Delete Transaction
- Use spreadsheets.batchUpdate
- Delete dimension (row)
- Shift remaining rows up

#### Read Summary
- Use spreadsheets.values.get
- Range: 'Summary!A:B' (or appropriate range)
- Parse into summary object

## Data Models

### Transaction Object
```javascript
{
  id: string,           // Row number or unique identifier
  date: string,         // ISO date format or DD/MM/YYYY
  category: string,     // One of the fixed categories
  description: string,  // Transaction description
  amount: number        // Transaction amount
}
```

### Summary Object
```javascript
{
  totalIncome: number,
  totalExpenses: number,
  savings: number,
  categoryBreakdown: {
    'Food & Dining': number,
    'Shopping': number,
    // ... other categories
  }
}
```

### Sheet Info Object
```javascript
{
  id: string,           // Google Sheets file ID
  name: string,         // Full sheet name
  startDate: string,    // Parsed from name
  endDate: string,      // Parsed from name
  year: string          // Parsed from name
}
```

## User Flow

### First Time User
1. Land on app → See login screen
2. Click "Login with Google"
3. Authenticate and grant permissions
4. See sheet selector with list of monthly sheets
5. Select current month's sheet
6. View transactions and summary dashboard

### Daily Usage
1. Open app (already authenticated)
2. Current sheet is pre-selected
3. View today's transactions
4. Add new transaction via form
5. See summary update automatically
6. (Optional) Edit/delete transactions
7. (Optional) Switch to different month

### Adding Transaction
1. Click "Add Transaction" button
2. Form appears with fields
3. Fill in: Date, Category, Description, Amount
4. Click "Save"
5. Loading indicator shows
6. Transaction appears in list
7. Success message displays

### Editing Transaction
1. Click edit icon on transaction row
2. Fields become editable (or modal opens)
3. Modify values
4. Click "Save"
5. Changes reflect in list
6. Success message displays

### Deleting Transaction
1. Click delete icon on transaction row
2. Confirmation dialog appears
3. Confirm deletion
4. Transaction removed from list
5. Success message displays

## Error Handling

### Authentication Errors
- Failed login → Display error message, retry option
- Token expired → Auto-refresh or prompt re-login
- Permission denied → Explain required permissions

### API Errors
- Network failure → Display offline message, retry option
- Rate limit exceeded → Display message, suggest waiting
- Invalid data → Display validation errors
- Sheet not found → Suggest selecting different sheet

### User Input Errors
- Empty required fields → Highlight fields, show error
- Invalid date format → Show format hint
- Invalid amount → Show numeric validation error
- Unknown category → Prevent selection, show valid options

## Performance Considerations

- Cache transaction list in state to minimize API calls
- Debounce search/filter inputs
- Lazy load transactions if list is very long
- Show loading states for all async operations
- Optimize re-renders with React.memo where appropriate

## Security Considerations

- Store API keys in environment variables (never commit to git)
- Use HTTPS in production
- Implement proper OAuth flow
- Validate all user inputs before API calls
- Handle sensitive data appropriately (no unnecessary logging)

## Testing Strategy (Future)

- Unit tests for utility functions
- Integration tests for Google Sheets service
- Component tests for React components
- E2E tests for critical user flows
- Manual testing on mobile and desktop

## Future Enhancements (Post-MVP)

### Phase 2 - Analytics
- Multi-sheet view (annual analytics)
- Charts and visualizations (spending trends)
- Category-wise insights
- Month-over-month comparisons
- Budget vs actual tracking

### Phase 3 - Advanced Features
- Recurring transactions
- Budget alerts and notifications
- Export functionality (CSV, PDF)
- Search and advanced filtering
- Tags and custom categorization
- Attach receipts/images

### Phase 4 - Optimization
- Offline mode with sync
- PWA (Progressive Web App)
- Batch operations
- Undo/redo functionality
- Keyboard shortcuts

## Success Criteria for MVP

- [ ] User can authenticate with Google
- [ ] User can see list of monthly budget sheets
- [ ] User can select a sheet to work with
- [ ] User can view all transactions from selected sheet
- [ ] User can add new transactions
- [ ] User can edit existing transactions
- [ ] User can delete transactions
- [ ] User can view summary dashboard
- [ ] App works on mobile and desktop
- [ ] All actions provide clear feedback
- [ ] Errors are handled gracefully

## Timeline Estimate

- Project setup and Google Cloud configuration: 1-2 hours
- Authentication implementation: 2-3 hours
- Sheet selector: 1-2 hours
- Transaction CRUD: 4-6 hours
- Summary dashboard: 1-2 hours
- UI/UX polish and responsive design: 2-3 hours
- Testing and bug fixes: 2-3 hours

**Total: ~15-20 hours**

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "gapi-script": "^1.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## Important Notes

1. **No separate backend required** - Direct Google Sheets API integration from frontend
2. **Summary tab is READ-ONLY** - App only reads from it, never writes
3. **Categories are fixed** - Hardcoded list of 11 categories
4. **Mobile-first design** - User accesses on both mobile and desktop daily
5. **Future-proof structure** - Built with analytics and multi-sheet features in mind
6. **Existing data preserved** - Works with current Google Sheets format without migration

## Getting Started Checklist

- [ ] Install Node.js (v16+)
- [ ] Create Vite React project
- [ ] Install Tailwind CSS and configure
- [ ] Install gapi-script
- [ ] Set up Google Cloud project
- [ ] Enable Google Sheets API
- [ ] Create OAuth credentials
- [ ] Create API key
- [ ] Configure environment variables
- [ ] Create project structure (folders and files)
- [ ] Implement authentication
- [ ] Implement sheet selector
- [ ] Implement transaction CRUD
- [ ] Implement summary dashboard
- [ ] Test on mobile and desktop
- [ ] Deploy (optional for MVP)

---

## Questions to Resolve Before Implementation

1. **Sheet Structure:** Are "Transactions" and "Summary" separate files or tabs in the same file?
2. **Category Management:** Should categories be hardcoded or read from the sheet?
3. **Offline Mode:** Should the app work offline or require constant internet?
4. **Date Format:** What date format should be used for display and storage?
5. **Multi-sheet Management:** For future - how should annual views aggregate data?

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** Ready for Implementation