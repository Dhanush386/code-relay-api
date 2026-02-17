# 🚀 Step-by-Step Render Deployment Guide

This guide will walk you through deploying the **Code-Relay** platform to Render. Since we need to execute student code securely, we will deploy a **Piston API** service as our "Docker worker."

---

## 🏗️ Phase 1: Prepare your Code (GitHub)

Render deploys directly from GitHub.
1.  **Commit your changes**: Ensure the recent Piston integration and `uuid` fix are committed.
2.  **Push to GitHub**: Create a repository and push your `code-relay-main` folder contents.

---

## 🗄️ Phase 2: Set up the Database (Render)
*Since you already have a Render PostgreSQL instance, you can skip this if you want to keep using it.*

1.  In Render, click **New +** → **Postgres**.
2.  **Your Internal Database URL**: `postgresql://coderelay_user:me4WJmVIymEQlp79EbTED0yjqdqzBhiI@dpg-d64rslshg0os73df80g0-a/coderelay`
3.  Copy the **External Database URL** (if you need to run migrations from your local PC).

---

## 🐳 Phase 3: Deploy Piston (The Docker Worker)
Render doesn't allow raw Docker commands in Web Services, so we use Piston to manage the isolation.

1.  Click **New +** → **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: `code-relay-piston`
4.  **Root Directory**: (Leave blank)
5.  **Runtime**: `Docker`
6.  **Plan**: Free (or Starter for no "sleep" delay).
7.  **Auto-Deploy**: Yes.
8.  **Wait for deployment**: Once it says "Live," copy the **Internal Service URL** (usually `http://code-relay-piston:2000`).

---

## ⚙️ Phase 4: Deploy the Backend
1.  Click **New +** → **Web Service**.
2.  **Name**: `code-relay-backend`
3.  **Root Directory**: `backend`
4.  **Runtime**: `Node`
5.  **Build Command**: `npm install && npx prisma generate`
6.  **Start Command**: `npm start`
7.  **Environment Variables**:
    *   `DATABASE_URL`: `postgresql://coderelay_user:me4WJmVIymEQlp79EbTED0yjqdqzBhiI@dpg-d64rslshg0os73df80g0-a/coderelay`
    *   `PISTON_API_URL`: `http://code-relay-piston:2000/api/v2/piston`
    *   `ORGANIZER_JWT_SECRET`: (Pick any long random string)
    *   `PARTICIPANT_JWT_SECRET`: (Pick another random string)
    *   `PORT`: `5000`
    *   `NODE_ENV`: `production`

---

## 💻 Phase 5: Deploy the Frontend
1.  Click **New +** → **Web Service** (or use Vercel).
2.  **Name**: `code-relay-frontend`
3.  **Root Directory**: `frontend`
4.  **Runtime**: `Node` (Next.js)
5.  **Build Command**: `npm run build`
6.  **Start Command**: `npm start`
7.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: `https://code-relay-backend.onrender.com` (Use the **External** URL of your backend).

---

## ✅ Phase 6: Syncing the Database
From your **local computer** terminal, run the following to set up the tables:
```bash
cd backend
# Set your local env DATABASE_URL to the EXTERNAL Render URL temporarily
npx prisma migrate deploy
```

## 🎉 Success!
- **Frontend**: Check your frontend URL.
- **Backend Health**: Visit `https://your-backend.onrender.com/health` to confirm it's up.
