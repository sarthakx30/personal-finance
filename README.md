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
### **v1.0.0 (Current)**
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
