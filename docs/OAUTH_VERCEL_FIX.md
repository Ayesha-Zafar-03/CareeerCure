# Google OAuth Configuration for Vercel Deployment

## Issue
Google OAuth login fails on deployed version with error: "Social login requires the backend API"

## Root Cause
OAuth redirect URIs in Google Cloud Console only include `localhost:8000`, but production backend is on Vercel with a different URL.

---

## Solution: Step-by-Step Fix

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or the project with Client ID: `7746148794-9g61u1k3sd6duscdo3lefjoq21tcjda3`)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID**
5. Under **Authorized redirect URIs**, add this URL:

```
https://careeer-cure-a9xm.vercel.app/api/auth/google/callback
```

**Note**: Keep your existing `http://localhost:8000/api/auth/google/callback` for local development.

6. Click **SAVE**

---

### Step 2: Configure Backend Environment Variables on Vercel

1. Go to your backend Vercel project: https://vercel.com/dashboard
2. Select the backend project
3. Go to **Settings** → **Environment Variables**
4. Add or update these variables for **Production** environment:

| Variable Name | Value |
|---------------|-------|
| `FRONTEND_URL` | `https://careeer-cure-seven.vercel.app` |
| `BACKEND_URL` | `https://careeer-cure-a9xm.vercel.app` |
| `ALLOWED_ORIGINS` | `https://careeer-cure-seven.vercel.app` |
| `GOOGLE_CLIENT_ID` | `7746148794-9g61u1k3sd6duscdo3lefjoq21tcjda3.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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no` |

**Important**: Make sure all your other environment variables are also set (DATABASE_URL, SECRET_KEY, GROQ_API_KEY, etc.)

5. Click **Save**
6. **Redeploy** the backend (Deployments → click the three dots → Redeploy)

---

### Step 3: Configure Frontend Environment Variables on Vercel

1. Go to your frontend Vercel project
2. Select the frontend project (careeer-cure-seven)
3. Go to **Settings** → **Environment Variables**
4. Add or update this variable for **Production** environment:

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://careeer-cure-a9xm.vercel.app` |

5. Click **Save**
6. **Redeploy** the frontend (Deployments → click the three dots → Redeploy)

---

## Verification Steps

After completing all steps:

1. Go to your deployed frontend: https://careeer-cure-seven.vercel.app/login
2. Click **Continue with Google**
3. You should be redirected to Google's login page
4. After authentication, you should be redirected back to your app with a token
5. You should land on the dashboard logged in

---

## Troubleshooting

### Issue: Still shows "backend unreachable"
- Check that NEXT_PUBLIC_API_URL in frontend matches your backend URL exactly
- Verify the backend is deployed and accessible (visit the backend URL in browser)

### Issue: "redirect_uri_mismatch" error from Google
- The redirect URI in Google Cloud Console must match EXACTLY what's in your backend
- Format: `{BACKEND_URL}/api/auth/google/callback`
- No trailing slashes, exact protocol (https)

### Issue: CORS errors in browser console
- Check ALLOWED_ORIGINS includes your frontend URL
- Redeploy backend after changing ALLOWED_ORIGINS

---

## Summary

**URLs to configure:**
- Frontend: `https://careeer-cure-seven.vercel.app`
- Backend: `https://careeer-cure-a9xm.vercel.app`
- OAuth Callback: `https://careeer-cure-a9xm.vercel.app/api/auth/google/callback`

**Configuration locations:**
1. Google Cloud Console → OAuth redirect URIs
2. Vercel Backend → Environment Variables
3. Vercel Frontend → Environment Variables

After all changes, redeploy both frontend and backend!
