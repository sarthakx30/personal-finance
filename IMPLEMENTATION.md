# Finance Tracker - Implementation Summary

## Project Setup
- **Framework**: React 19.2.0 + Vite 7.3.1
- **Styling**: Tailwind CSS 4.1.18
- **Authentication**: Google Identity Services (GIS) for Web (OAuth 2.0)
- **APIs**: Google Sheets API v4 + Google Drive API v3
- **State Management**: React Hooks (useState, useEffect)
- **Development**: localhost:5173/5174

## Architecture

### Services
- **googleAuth.js**: OAuth 2.0 authentication using Google Identity Services (GIS)
  - Handles token client initialization and sign-in/sign-out flows
  - Provides access token management and auth state listeners
  
- **googleSheetsService.js**: RESTful API calls to Google Sheets/Drive
  - Uses fetch with Bearer token authentication (no gapi.client)
  - Operations: list sheets, get/add/update/delete transactions, get summary
  - Transactions: Columns B:E (date, amount, description, category), headers in rows 1-4, data starts row 5
  - Summary: Totals at row 26 (E26=expenses, K26=income), categories at rows 28+ (columns B+C=name, E=amount)
  - Fetch ranges: Transactions!B:E, Summary!A:K

### React Hooks
- **useGoogleAuth**: Manages authentication state and sign-in/sign-out
- **useGoogleSheets**: Manages transaction CRUD and summary data per selected sheet

### Components
- **AuthButton**: Sign-in/Sign-out UI with error display
- **SheetSelector**: Select monthly Google Sheets
- **TransactionForm**: Add/edit transaction form
- **TransactionList**: Display and manage transactions
- **TransactionItem**: Individual transaction with edit/delete
- **SummaryDashboard**: Display income, expenses, savings, category breakdown

## Key Implementation Details

### Migration from gapi.auth2 to Google Identity Services
- Removed deprecated gapi.auth2 library (causes idpiframe_initialization_failed error)
- Integrated modern Google Identity Services (accounts.google.com/gsi/client)
- Auth token now passed via Bearer header to all API requests
- Callback-based token client for popup sign-in flow

### Google Sheets API Integration
- All operations use fetch + Bearer token instead of gapi.client
- **Transactions Sheet**: 
  - Structure: Column A empty, data in columns B:E (Date, Amount, Description, Category)
  - Headers in rows 1-4, actual transaction data starts at row 5
  - API access: `Transactions!B:E` with row offset of 4 (skip header rows)
- **Summary Sheet**:
  - Row 26 contains totals: E26=total expenses, K26=total income
  - Rows 28+ contain category breakdown: Column B+C=category name (combined), Column E=amount
  - Fetch range: `Summary!A:K` (expanded from A:F to include column K for income)
- **Currency Handling**: Pound sterling (£) with commas; parsed via regex `/[£,+\-\s]/g`
- **Date Parsing**: Robust handling of multiple date formats, returns value as-is if unparseable

### Transaction Management
- **Add**: Calculate next row number from existing transactions, append new transaction to next available row
- **Update**: Direct PUT request to specific row range (B:E) with updated values
- **Delete**: Uses batchUpdate API with deleteDimension request to remove row
- **Read**: Fetches range, skips header rows (rows 1-4), parses amounts with £ symbol handling
- **Amount Parsing**: Converts formatted currency (e.g., "£1,234.56") to number by removing £, commas, spaces

## Configuration
- **Environment Variables** (.env.local):
  - VITE_GOOGLE_CLIENT_ID: OAuth client ID for web
  - VITE_GOOGLE_API_KEY: API key for server-side requests
- **Scopes**: 
  - https://www.googleapis.com/auth/spreadsheets (read/write)
  - https://www.googleapis.com/auth/drive.readonly (list files)

## Known Working Features
✅ User authentication (Google OAuth 2.0 popup via Google Identity Services)
✅ Sheet selection (list monthly budgets in descending date order)
✅ Transaction CRUD (create, read, update, delete with correct field ordering)
✅ Summary dashboard (income, expenses, savings, and category breakdown)
✅ Currency formatting and parsing (£ symbol, commas, amounts)
✅ Date formatting with robust multi-format handling
✅ Error handling and display
✅ Responsive UI with Tailwind CSS v4 (using @import syntax)

## Fixes Applied During Implementation
- **OAuth Migration**: Replaced deprecated gapi.auth2 with Google Identity Services (GIS) to fix "idpiframe_initialization_failed" error
- **Tailwind CSS v4**: Updated index.css to use `@import "tailwindcss"` instead of @tailwind directives
- **Transaction Field Ordering**: Corrected to date (B), amount (C), description (D), category (E)
- **Row Offset**: Fixed to skip metadata rows 1-4 in Transactions sheet, data starts at row 5
- **Summary Data Range**: Expanded fetch range from `Summary!A:F` to `Summary!A:K` to include column K for income reading
- **Categories Section**: Removed conditional rendering - Category Breakdown always visible with "No data" fallback
- **Date Parsing**: Enhanced to handle multiple date formats gracefully without "Invalid Date" errors
- **Amount Parsing**: Robust regex-based currency extraction handles £, commas, plus/minus signs, spaces

## Known Limitations & Special Handling
- **Sheet Structure**: User's sheet has non-standard layout (empty column A, data starts B)
- **Summary Totals**: Must read from specific row 26, columns E and K (not from dynamic calculations)
- **Category Data**: Retrieved from rows starting at 28, requires combined B+C for category names
- **Date Formats**: Application accepts multiple input formats but always parses gracefully
- **Column Access**: API fetch ranges must include all columns referenced in parsing code (e.g., K26 requires Summary!A:K minimum)

## Testing Checklist
- [x] OAuth sign-in with Google account (working via GIS popup)
- [x] Select a monthly budget sheet (working, shows in descending date order)
- [x] Add a transaction - should append to next row (working, calculates row 5+)
- [x] Edit a transaction - should update correct row (working with B:E fields)
- [x] Delete a transaction - should remove row from sheet (working via batchUpdate)
- [x] View summary dashboard with income and expenses (working, now reads from E26 and K26)
- [x] View category breakdown (working, always visible, reads from rows 28+)
- [x] Sign out (working)

## Deployment Notes
- Ensure `.env.local` contains valid VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY
- Google Cloud project must have Sheets API v4 and Drive API v3 enabled
- OAuth consent screen must have test users added (or app must be in production)
- Test user email must have access to Google Sheets with monthly budgets
- Sheet names should contain "Monthly budget" for filtering
- Summary sheet must have totals at row 26 (E26, K26) and categories starting row 28
