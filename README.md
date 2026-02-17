# Cloud Storage App

This project is a full-stack cloud storage application built with a React frontend and a Node.js/Express backend. It allows users to upload, manage, and view files in a secure environment.

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

```
e:\cloud_storage
├── backend/                # Node.js/Express Backend
│   ├── middleware/         # Custom middleware (e.g., auth checks)
│   ├── models/             # Mongoose models (Database schemas)
│   ├── routes/             # API route definitions
│   ├── uploads/            # Directory for storing uploaded files locally
│   ├── .env                # Backend environment variables
│   ├── passportConfig.js   # Passport.js configuration for authentication
│   ├── server.js           # Entry point for the backend server
│   └── package.json        # Backend dependencies and scripts
│
├── frontend/               # React Frontend (Vite)
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks (e.g., useAuth)
│   │   ├── pages/          # Application pages (Dashboard, Login, etc.)
│   │   ├── services/       # API service calls
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point for React
│   ├── .env                # Frontend environment variables
│   ├── index.html          # HTML entry point
│   ├── vite.config.ts      # Vite configuration
│   └── package.json        # Frontend dependencies and scripts
│
├── .gitignore              # Git ignore rules for the root
├── CNAME                   # CNAME record for custom domain deployment
└── DEPLOYMENT.md           # Deployment documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd cloud_storage
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file in the `backend` directory and configure your environment variables (PORT, MONGO_URI, JWT_SECRET, etc.).

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```
    - Create a `.env` file in the `frontend` directory if needed.

### Running the Application

1.  **Start Backend:**
    ```bash
    cd backend
    npm start
    # or for development
    npm run dev
    ```

2.  **Start Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

Access the application at `http://localhost:5173` (or the port specified by Vite).

## Features

- User Authentication (Passport.js, Google OAuth)
- File Upload and Management
- Dashboard for viewing files
- Responsive Design

