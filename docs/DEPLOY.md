# Backend Deployment — HuggingFace Spaces

## 1. Create a free PostgreSQL database (no card)

Choose one:

**Option A: Supabase (recommended, no card)**
1. Go to https://supabase.com → Sign up
2. Create a new project (free tier, 500MB)
3. In project dashboard → Project Settings → Database
4. Copy the connection string: `postgresql://postgres:xxx@xxx.supabase.co:5432/postgres`

**Option B: Neon (no card)**
1. Go to https://neon.tech → Sign up
2. Create a new project (free tier)
3. Copy the connection string

## 2. Deploy on HuggingFace Spaces

1. Go to https://huggingface.co/new-space
2. Set:
   - **Space Name**: `careercure-api`
   - **License**: MIT
   - **Space SDK**: Docker
3. Connect your GitHub repo or upload files manually
4. After Space is created, go to **Settings** → **Repository secrets**

5. Add these environment variables:

```
DATABASE_URL=<your-supabase-or-neon-connection-string>
SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(64))">
DEBUG=False
GROQ_API_KEY=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
GROQ_MODEL=llama-3.1-70b-versatile
CHROMA_PERSIST_DIR=./chroma_data
EMBEDDING_MODEL=all-MiniLM-L6-v2
GMAIL_USER=y0685670@gmail.com
GMAIL_APP_PASSWORD=uxam iyzc bydb vqbz
GOOGLE_CLIENT_ID=169399628302-p94ol9qpvicl2dh8jo0tqq2qds01kulh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FRONTEND_URL=https://<your-vercel-frontend-url>
BACKEND_URL=https://<your-space-name>.hf.space
ALLOWED_ORIGINS=https://<your-vercel-frontend-url>
```

6. The Space will build automatically (first build takes 10-15 min due to large dependencies)
7. Once built, your API is live at `https://<your-space-name>.hf.space`

## 3. Update Google OAuth

In Google Cloud Console → Credentials, add this to **Authorized redirect URIs**:
```
https://<your-space-name>.hf.space/api/auth/google/callback
```
**Important**: the path must be exactly `/api/auth/google/callback` (no trailing slash, `https` only). This must match `{BACKEND_URL}/api/auth/google/callback` exactly or Google returns `redirect_uri_mismatch`.

## 4. Deploy Frontend on Vercel

Import `frontend/` as a Next.js project, set:
```
NEXT_PUBLIC_API_URL=https://<your-space-name>.hf.space
```
