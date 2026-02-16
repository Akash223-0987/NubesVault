# Deployment Guide: Render (Backend) + Cloudflare Pages (Frontend)

This guide will walk you through deploying your **Node.js/Express Backend to Render** and your **React/Vite Frontend to Cloudflare Pages**.

## Prerequisites
- A [GitHub](https://github.com/) account with this project pushed to a repository.
- A [Render](https://render.com/) account.
- A [Cloudflare](https://dash.cloudflare.com/) account.
- A MongoDB Atlas Cluster (or use your existing `MONGO_URI`).

---

## Part 1: Deploy Backend to Render

1.  **Log in to Render** and click "New +" -> "Web Service".
2.  **Connect your GitHub repository**.
3.  **Configure the Service**:
    -   **Name**: `cloud-storage-backend` (or similar)
    -   **Region**: Choose one close to you.
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: Node
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
4.  **Environment Variables**:
    Scroll down to "Environment Variables" and add the following keys from your `.env` file:
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `JWT_SECRET`: A secure random string for JWT.
    -   `SESSION_SECRET`: A secure random string for sessions.
    -   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
    -   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
    -   `BACKEND_URL`: The URL Render assigns to you (e.g., `https://cloud-storage-backend.onrender.com`). *Note: You will know this after the first deploy. For now leave blank.*
    -   `CLIENT_URL`: The URL of your Cloudflare frontend. *Update this later.*

5.  **Create Web Service**.
    -   Once created, copy the **Render Service URL** (top left, e.g., `https://your-app.onrender.com`).
    -   Go back to "Environment Variables" and set `BACKEND_URL` to this URL (no trailing slash).

---

## Part 2: Deploy Frontend to Cloudflare Pages

1.  **Log in to Cloudflare Dashboard** and go to **Compute (Workers & Pages)** -> **Pages**.
2.  **Connect to Git**: Click "Connect to Git" and select your repository.
3.  **Configure Build Settings**:
    -   **Project Name**: `cloud-storage-frontend` (or similar).
    -   **Production branch**: `main` (or `master`).
    -   **Framework Preset**: Select `Vite` or `React` (or manual).
    -   **Build command**: `npm run build`
    -   **Build output directory**: `dist`
    -   **Root directory**: `/frontend` (Click "Path" or "Root Directory" settings to specify this if your repo has subfolders). **This is Critical.**
4.  **Environment Variables**:
    -   Go to **Environment variables** section in the setup.
    -   Add `VITE_API_URL` and set it to your **Render Backend URL** (e.g., `https://your-app.onrender.com`).
5.  **Deploy**:
    -   Click "Save and Deploy".
    -   Cloudflare will build your site. Once done, you'll get a URL (e.g., `https://cloud-storage-frontend.pages.dev`).

---

## Part 3: Connect the Pieces & Google OAuth

Now update the configuration to let them talk to each other correctly.

1.  **Update Render Variables**:
    -   Go to your Render Dashboard -> Environment Variables.
    -   Set `CLIENT_URL` to your **Cloudflare Pages URL** (e.g., `https://cloud-storage-frontend.pages.dev`).
    -   Save changes. Render will likely auto-redeploy.

2.  **Update Google Cloud Console**:
    -   Go to [Google Cloud Console](https://console.cloud.google.com/).
    -   Select your project and go to **APIs & Services > Credentials**.
    -   Edit your OAuth 2.0 Client ID.
    -   **Authorized Javascript Origins**: Add your Cloudflare URL (e.g., `https://cloud-storage-frontend.pages.dev`).
    -   **Authorized Redirect URIs**: 
        -   Ensure your Render Backend Callback URL is still there: `https://<YOUR_RENDER_APP_NAME>.onrender.com/auth/google/callback`
        -   (No changes needed to Redirect URI if the backend URL hasn't changed).
    -   Save.

3.  **Final Checks**:
    -   Visit your Cloudflare URL.
    -   Try to Sign Up / Login. 
    -   Test File Upload.

## Important Note on File Uploads
You are currently using `multer` with local disk storage (`uploads/` folder).
**Render's disk modification is ephemeral**, meaning all uploaded files **will be deleted** every time you redeploy or the server restarts (which happens frequently on the free tier).
For production, you should implement AWS S3, Cloudinary, or use Render's persistent disk storage feature.
