# CareerCure Deployment Checklist

## Frontend (Vercel)
Set these environment variables in Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-domain.com` | **Production backend URL** (no trailing slash) |
| `NEXT_PUBLIC_ADMIN_URL` | `https://your-admin-domain.com` | Admin portal URL |

## Backend (Vercel/Render/Railway)
Set these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | **Production PostgreSQL URL** |
| `SECRET_KEY` | `your-64-char-random-string` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `GROQ_API_KEY` | `gsk_...` | Your Groq API key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | |
| `CHROMA_PERSIST_DIR` | `./chroma_data` | |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.com,https://your-admin-domain.com` | **Production frontend URLs** |
| `FRONTEND_URL` | `https://your-frontend-domain.com` | **Production frontend URL** (no trailing slash) |
| `BACKEND_URL` | `https://your-backend-domain.com` | **Production backend URL** (no trailing slash) |
| `GMAIL_USER` | `your-email@gmail.com` | For email OTPs |
| `GMAIL_APP_PASSWORD` | `your-16-char-app-password` | Gmail App Password (not regular password) |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | From Google Cloud Console |
| `LINKEDIN_CLIENT_ID` | `...` | Optional - LinkedIn Developer Portal |
| `LINKEDIN_CLIENT_SECRET` | `...` | Optional |
| `JSEARCH_API_KEY` | `...` | Optional - RapidAPI JSearch |
| `RAPIDAPI_KEY` | `...` | Optional - RapidAPI |

## Google Cloud Console OAuth Setup
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. **Authorized JavaScript origins**: Add `https://your-backend-domain.com`
4. **Authorized redirect URIs**: Add `https://your-backend-domain.com/api/auth/google/callback`

## LinkedIn Developer Portal (if using)
1. Go to https://www.linkedin.com/developers/
2. Select your app → Auth tab
3. **Redirect URLs**: Add `https://your-backend-domain.com/api/auth/linkedin/callback`

## Database
- Ensure PostgreSQL is accessible from backend host
- Run migrations: `alembic upgrade head` (if using Alembic)
- Or tables auto-create on first run (SQLAlchemy)

## Common Issues & Fixes

### "Cannot upload CV" / "Generate roadmap fails"
- Check `GROQ_API_KEY` is set in backend
- Check backend logs for Groq API errors
- Ensure ChromaDB is running (if using vector search)

### "Social login failed"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend
- Verify redirect URI in Google Cloud Console matches exactly: `https://your-backend-domain.com/api/auth/google/callback`
- Check `FRONTEND_URL` and `BACKEND_URL` in backend env
- Check CORS: `ALLOWED_ORIGINS` must include frontend domain

### "Login failed - Please check your credentials"
- User may not have verified email (check `is_active` and `is_verified` in users table)
- Password hash may be wrong - try password reset flow
- Check backend logs for authentication errors

### CORS Errors
- Ensure `ALLOWED_ORIGINS` includes exact frontend URL (with https://)
- No trailing slashes in URLs

## Quick Test Commands

```bash
# Test backend health
curl https://your-backend-domain.com/api/health

# Test CV upload (requires auth token)
curl -X POST https://your-backend-domain.com/api/cv/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf"

# Test roadmap generation
curl -X POST https://your-backend-domain.com/api/roadmap/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"career_goal": "Software Engineer"}'

# Test OAuth status
curl https://your-backend-domain.com/api/auth/oauth/status
```

## Generate Secure SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

## Frontend Build (Vercel auto-detects)
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next` (standalone mode)

## Backend Build (Vercel)
- Framework: Other
- Build command: `pip install -r requirements.txt`
- Output directory: `.` (root)
- Install command: `pip install -r requirements.txt`