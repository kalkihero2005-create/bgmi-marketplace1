# BGMI Marketplace Deployment Guide

## Deploy on Vercel (Frontend)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Select your bgmi-marketplace repo
5. Under "Root Directory", select "frontend"
6. Add Environment Variable: REACT_APP_API_URL (your backend URL)
7. Click "Deploy"

## Deploy Backend on Vercel
1. On Vercel, create another new project
2. Select your repo again
3. Under "Root Directory", select "backend"
4. Add Environment Variables: MONGO_URL, JWT_SECRET
5. Deploy!

## Local Development
- Backend: cd backend && python -m uvicorn server:app --reload
- Frontend: cd frontend && npm start
