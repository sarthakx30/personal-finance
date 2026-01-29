# Personal Finance Tracker Context

## Project Overview
This project is a serverless **Personal Finance Tracker** built as a Single Page Application (SPA). It allows users to track expenses and income using **Google Sheets** as a backend database.

### Key Features
-   **Authentication:** Signs users in via their Google Account.
-   **Data Storage:** Reads and writes directly to a user's Google Sheet ("Monthly budget" template).
-   **Transaction Management:**
    -   Add/Edit/Delete **Expenses** (stored in columns B:E).
    -   Add/Edit/Delete **Income** (stored in columns G:J).
-   **Dashboard:** Visual summary of Total Income, Expenses, and Savings Rate.
-   **UI/UX:** Modern, responsive design using Tailwind CSS and Lucide icons.

## Tech Stack
-   **Frontend:** React 19 + Vite
-   **Styling:** Tailwind CSS 4
-   **APIs:**
    -   Google Drive API (to list spreadsheet files).
    -   Google Sheets API (for CRUD operations).
    -   Google Identity Services (for OAuth 2.0).

## Project Structure
The core application code resides in the `finance-tracker` directory.

```text
finance-tracker/
├── src/
│   ├── components/       # UI Components
│   │   ├── auth/         # Authentication buttons/logic
│   │   ├── dashboard/    # Summary cards and visualizers
│   │   ├── sheets/       # Spreadsheet selector
│   │   └── transactions/ # Forms and Lists for data entry
│   ├── config/           # Categories and app constants
│   ├── hooks/            # Custom React hooks (useGoogleAuth, useGoogleSheets)
│   ├── services/         # API wrappers (googleAuth.js, googleSheetsService.js)
│   ├── utils/            # Formatters and validators
│   ├── App.jsx           # Main layout and routing logic
│   └── main.jsx          # Entry point
└── package.json          # Dependencies and scripts
```

## Setup & Running

1.  **Prerequisites:**
    -   Node.js installed.
    -   A Google Cloud Project with Sheets and Drive APIs enabled.
    -   An `.env.local` file in `finance-tracker/` containing:
        ```env
        VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
        VITE_GOOGLE_API_KEY=your_api_key
        ```

2.  **Installation:**
    ```bash
    cd finance-tracker
    npm install
    ```

3.  **Development:**
    ```bash
    npm run dev
    ```

4.  **Build:**
    ```bash
    npm run build
    ```

## Architecture & Conventions

-   **Data Flow:** The app follows a strictly client-side architecture. It does not have a dedicated backend server; it communicates directly with Google APIs from the browser.
-   **State Management:** Uses custom hooks (`useGoogleSheets`) to manage API state (loading, error, data).
-   **Styling:** Utility-first CSS using Tailwind. Components should be responsive and use the `slate-50` theme palette established in the project.
-   **Sheet Convention:** The app expects specific columns in the Google Sheet:
    -   **Expenses:** Date (B), Amount (C), Description (D), Category (E).
    -   **Income:** Date (G), Amount (H), Description (I), Category (J).
    -   **Summary:** Reads specific cells from a `Summary` tab.

## Documentation
-   `ARCHITECTURE.md`: Detailed diagrams and flow of the application.
-   `IMPLEMENTATION.md`: Implementation logs and status.
