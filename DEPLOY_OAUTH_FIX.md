# Deploy OAuth Fix with Improved Logging

## What Changed
Added detailed logging to OAuth callback to help diagnose the "Google authentication failed" error.

## Deployment Steps

### 1. Commit and Push Changes

```bash
cd C:\Users\PMLS\Downloads\CareerCure

git add backend/app/api/auth.py backend/app/services/oauth_service.py
git commit -m "Add detailed OAuth error logging for debugging"
git push origin main
```

### 2. Vercel Will Auto-Deploy

Vercel should automatically detect the push and redeploy your backend.

**OR manually trigger:**
1. Go to https://vercel.com/dashboard
2. Select backend project
3. Deployments → Click latest → Redeploy

### 3. Test OAuth Again

1. Visit: https://careeer-cure-seven.vercel.app/login
2. Click "Continue with Google"
3. Complete Google login

### 4. Check Logs for Detailed Error

1. Go to Vercel Dashboard → Backend Project → Deployments
2. Click the latest deployment
3. Click **Functions** or **Logs**
4. Look for these log messages:

```
Google OAuth callback received with code: ...
Starting Google code exchange...
Token exchange redirect_uri: https://careeer-cure-a9xm.vercel.app/api/auth/google/callback
```

**If you see errors like:**
- `"redirect_uri_mismatch"` → Google Console issue
- `"invalid_client"` → Wrong Client ID/Secret
- `"Failed to create or get user"` → Database issue

### 5. Most Likely Issue: Google Cloud Console

The most common cause is the redirect URI not being added to Google Cloud Console.

**Double-check:**
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, verify it has:

```
https://careeer-cure-a9xm.vercel.app/api/auth/google/callback
```

**⚠️ Important:**
- No trailing slash
- Exact match (case-sensitive)
- Must be `https://` not `http://`
- Must end with `/api/auth/google/callback`

### 6. After Fixing Google Console

If you add the redirect URI, wait 5 minutes for Google's cache to update, then try again.

---

## Expected Log Flow (Success)

When OAuth works correctly, you should see:

```
INFO: Google OAuth callback received with code: ya29...
INFO: Starting Google code exchange...
INFO: Token exchange redirect_uri: https://careeer-cure-a9xm.vercel.app/api/auth/google/callback
INFO: Successfully received access token from Google
INFO: Successfully retrieved user info for: user@example.com
INFO: User authenticated successfully: user@example.com
```

---

## Troubleshooting Based on Logs

### Log: "Google token exchange failed with status 400"
**Cause:** Redirect URI mismatch or invalid code

**Response might show:**
```json
{
  "error": "redirect_uri_mismatch",
  "error_description": "Bad Request"
}
```

**Fix:** Add the exact redirect URI to Google Cloud Console

---

### Log: "invalid_client"
**Cause:** Wrong Client ID or Client Secret

**Fix:** 
1. Verify environment variables on Vercel
2. Make sure no extra spaces or characters
3. Client ID should end with `.apps.googleusercontent.com`

---

### Log: "Failed to create or get user for email: ..."
**Cause:** Database connection issue

**Fix:**
1. Check DATABASE_URL is correct
2. Verify database allows connections from Vercel
3. Check database logs for connection errors

---

## Quick Commands Reference

```bash
# View git status
git status

# Commit changes
git add .
git commit -m "Fix OAuth logging"

# Push to GitHub (triggers Vercel deploy)
git push origin main

# Check deployment status
# Visit: https://vercel.com/dashboard
```

---

## After Deployment

1. Clear browser cache or use Incognito mode
2. Try Google login again
3. Check Vercel logs immediately after attempting login
4. Share the log output if still having issues

The detailed logs will now show EXACTLY where the OAuth flow is failing!
