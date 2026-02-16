---
description: How to run the Retinal Heart Prediction project
---
This project consists of a Python FastAPI backend and a React (Vite) frontend.

### Prerequisites
- Python 3.9+ 
- Node.js 18+

### Step 1: Run the Backend
1. Open a new terminal.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python main.py
   ```
   The backend will run on `http://localhost:8000`.

### Step 2: Run the Frontend
1. Open another terminal.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

### Step 3: Use the Dashboard
1. Open your browser and go to `http://localhost:5173`.
2. Upload a retinal fundus image (DRIVE or UK Biobank format).
3. Click "Run Prediction" to see the results.
