# Conventions

TypeScript strict mode. Server validation is mandatory. Errors use {error:string}; successful requests use {data:unknown}. HTTP 400 validation, 401 authentication, 403 origin, 404 inaccessible resource, 409 conflict, 429 throttling, 503 unavailable dependency. UTC timestamps; exact decimal strings at boundaries. All mutations verify Origin against APP_URL and current membership. No secrets or invitation tokens in logs.
