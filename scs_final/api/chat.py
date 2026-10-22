# One function file per endpoint: Vercel only hands Flask the original URL path
# when it matches the function's own path (a rewrite passes the rewritten path).
from app import app
