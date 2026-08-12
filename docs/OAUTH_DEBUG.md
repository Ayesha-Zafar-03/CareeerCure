# Debugging "Google Authentication Failed" Error

## Error Message
```
Authentication Failed
Google authentication failed
```

This error appears on `/auth/error` page after attempting Google OAuth login.

---

## Common Causes & Solutions

### 1. ✅ Redirect URI Mismatch (Most Common)

**Problem**: The redirect URI in Google Cloud Console doesn't match your backend URL.

**Check**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials → Your OAuth 2.0 Client ID
3. Verify **Authorized redirect URIs** includes:
   ```
   https://careeer-cure-a9xm.vercel.app/api/auth/google/callback
   ```

**Fix**: Add the exact URL above (no trailing slash, exact protocol)

---

### 2. ✅ Environment Variables Not Set on Vercel

**Problem**: Vercel backend doesn't have the OAuth credentials or URLs configured.

**Check**:
1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Verify these exist for **Production**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `BACKEND_URL=https://careeer-cure-a9xm.vercel.app`
   - `FRONTEND_URL=https://careeer-cure-seven.vercel.app`

**Fix**: Add missing variables and **redeploy**

---

### 3. ✅ Frontend Not Using Correct Backend URL

**Problem**: Frontend is trying to reach wrong backend URL.

**Check**:
1. Vercel Dashboard → Frontend Project → Settings → Environment Variables
2. Verify:
   ```
   NEXT_PUBLIC_API_URL=https://careeer-cure-a9xm.vercel.app
   ```

**Fix**: Update and **redeploy frontend**

---

### 4. ✅ CORS Issues

**Problem**: Backend is blocking requests from frontend.

**Check**: Vercel backend logs for CORS errors

**Fix**:
```bash
ALLOWED_ORIGINS=https://careeer-cure-seven.vercel.app
```

---

### 5. ✅ Database Connection Issues

**Problem**: Backend can't create/update user in database.

**Check**: 
1. Vercel backend logs
2. Database connection string is correct
3. Database is accessible from Vercel

**Fix**: Verify `DATABASE_URL` in backend environment variables

---

## 🔍 Step-by-Step Debugging

### Step 1: Check Vercel Backend Logs

1. Go to Vercel Dashboard → Backend Project → Deployments
2. Click on the latest deployment
3. Click **Functions** tab
4. Look for logs when you attempt Google login
5. Look for error messages containing:
   - "Google OAuth callback error"
   - "Failed to authenticate with Google"
   - "Failed to create user account"

### Step 2: Test Backend Directly

Visit this URL in your browser:
```
https://careeer-cure-a9xm.vercel.app/api/auth/oauth/status
```

**Expected Response**:
```json
{
  "google_configured": true,
  "linkedin_configured": false,
  "oauth_available": true
}
```

If `google_configured` is `false`, your OAuth credentials are not set correctly.

### Step 3: Test OAuth Flow Manually

1. Open browser console (F12)
2. Go to your login page: https://careeer-cure-seven.vercel.app/login
3. Click "Continue with Google"
4. Watch the **Network** tab for these requests:
   - Request to `/api/auth/google` (should redirect)
   - Request to Google OAuth page (should show consent screen)
   - Callback to `/api/auth/google/callback?code=...`
   - Final redirect to `/auth/success?token=...` or `/auth/error?message=...`

Look for any failed requests (red in network tab).

### Step 4: Check Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID
5. Verify:
   - **Application type**: Web application
   - **Authorized redirect URIs** includes:
     ```
     https://careeer-cure-a9xm.vercel.app/api/auth/google/callback
     http://localhost:8000/api/auth/google/callback
     ```

---

## 🛠️ Quick Fix Checklist

- [ ] Google Cloud Console has correct redirect URI
- [ ] Backend environment variables are set on Vercel
- [ ] Frontend environment variable `NEXT_PUBLIC_API_URL` is correct
- [ ] Backend has been redeployed after env var changes
- [ ] Frontend has been redeployed after env var changes
- [ ] `/api/auth/oauth/status` returns `google_configured: true`
- [ ] Database is accessible and `DATABASE_URL` is correct
- [ ] `ALLOWED_ORIGINS` includes frontend URL

---

## 🔧 Force Refresh Configuration

If you've made changes but still seeing errors:

### Backend:
1. Vercel Dashboard → Backend Project
2. Deployments → Click three dots on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Frontend:
1. Vercel Dashboard → Frontend Project
2. Deployments → Click three dots on latest deployment
3. Click **Redeploy**
4. Clear browser cache or use incognito mode

---

## 🚨 Common Error Messages in Logs

### "redirect_uri_mismatch"
- **Cause**: Redirect URI not in Google Cloud Console
- **Fix**: Add exact callback URL to Google Console

### "invalid_client"
- **Cause**: Wrong Client ID or Secret
- **Fix**: Double-check credentials in Vercel env vars

### "Failed to create user account"
- **Cause**: Database connection issue
- **Fix**: Check DATABASE_URL and database accessibility

### "CORS error"
- **Cause**: Frontend origin not allowed
- **Fix**: Update ALLOWED_ORIGINS in backend

---

## 📞 Still Not Working?

1. **Check Vercel Logs**: Most issues show clear error messages in logs
2. **Test Locally**: Try OAuth on localhost to isolate if it's a deployment issue
3. **Verify All URLs**: Make sure no typos in any URL configuration
4. **Try Incognito**: Sometimes browser cache causes issues

---

## 📝 Local Testing

To test OAuth flow locally:

```bash
# Backend
cd backend
# Make sure .env has:
# BACKEND_URL=http://localhost:8000
# FRONTEND_URL=http://localhost:3000
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
# Make sure .env.local has:
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Visit: http://localhost:3000/login

If it works locally but not on Vercel, the issue is with Vercel configuration.
If it doesn't work locally, the issue is with OAuth setup itself.
