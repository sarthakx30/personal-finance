# Personal Finance Tracker

A serverless Single Page Application (SPA) designed to help you track expenses and income seamlessly using **Google Sheets** as your personal backend database.

## 🚀 Overview

This application provides a modern, responsive interface to manage your finances without the need for a dedicated backend server. By leveraging Google's APIs, your data stays under your control in your own Google Drive.

### Key Features
- **Google Auth:** Secure login using your existing Google Account.
- **Sheets Integration:** Directly read/write to the "Monthly budget" Google Sheets template.
- **Transaction Management:** Easily add, edit, or delete expenses and income.
- **Visual Dashboard:** Get a quick summary of your total income, expenses, and savings rate.
- **Responsive Design:** Built with React 19, Tailwind CSS 4, and Lucide icons for a sleek experience on any device.

## 🛠️ Tech Stack
- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **Storage/API:** Google Sheets API, Google Drive API, Google Identity Services

## 📋 Versioning
### **v0.70**
- **Sidebar Layout:** New responsive sidebar navigation with mobile drawer support.
- **Bucket Editor:** Drag-and-drop interface (Desktop) and list view (Mobile) to organize categories into budget buckets. Configuration is saved to Google Drive.
- **Profile Management:** Dedicated account page with profile picture and centralized sign-out.
- **Notifications:** Integrated toast notification system for success/error feedback.
- **Permissions:** Enhanced Google Drive integration to support saving app configuration.

### **v0.65**
- **Education Loan Tracker:** Dedicated dashboard for tracking loan repayment progress with charts for outstanding balance and payment history.
- **Loan Entry Management:** Features to add new repayment entries and edit historical records, with automatic balance recalculation logic.
- **Mobile Experience:** Optimized navigation for specialized trackers (Net Worth, Loans) by hiding the bottom bar for a focused view.

### **v0.60**
- **Dynamic Categories:** Application now fetches expense and income categories directly from the Google Sheet's "Summary" tab and transaction history, ensuring 100% synchronization with your budget template.
- **Smart Bucket Editor:** The bucket configuration tool now intelligently filters to show only the categories present in the currently selected month, reducing clutter.
- **Privacy Enhanced:** Removed all hardcoded category lists and personal references from the source code.
- **Data Integrity:** Fixed date parsing logic to correctly handle Google Sheets serial dates and raw unformatted values.
- **UI Polish:** Improved transaction history visibility with red/green color coding for expenses/income and chronological sorting.

### **v0.40**
- **Sidebar Layout:** New responsive sidebar navigation with mobile drawer support.
- **Bucket Editor:** Drag-and-drop interface (Desktop) and list view (Mobile) to organize categories into budget buckets. Configuration is saved to Google Drive.
- **Profile Management:** Dedicated account page with profile picture and centralized sign-out.
- **Notifications:** Integrated toast notification system for success/error feedback.
- **Permissions:** Enhanced Google Drive integration to support saving app configuration.

### **v0.25**
- **UI/UX Overhaul:** Refined visual theme with high-contrast light mode, sharper cards, and consistent blue brand styling.
- **New Brand Identity:** Custom-designed logo integrated into the app header, favicon, and sign-in screen.
- **Improved Navigation:** Global Sheet Selector accessible from all views.
- **Enhanced Feedback:** Skeleton loading states for smoother transitions in lists and forms.
- **Dark Mode:** Full support for dark color schemes with automatic detection and manual toggle.

### **v0.10**
- Initial release with core CRUD functionality for transactions.
- Google Sheets connectivity and authentication.
- Dashboard summary cards and category breakdown.

## ⚙️ Setup

1. **Prerequisites:** Node.js, Google Cloud Project with enabled Sheets/Drive APIs.
2. **Environment:** Create a `.env.local` in the `finance-tracker/` directory with:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_GOOGLE_API_KEY=your_api_key
   ```
3. **Install:** `cd finance-tracker && npm install`
4. **Run:** `npm run dev`
