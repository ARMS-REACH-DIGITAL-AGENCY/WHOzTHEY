# WHOzTHEY Health Routes

These are temporary diagnostic routes.

## Files to upload

Upload these files to the exact matching paths:

- `app/api/health/integrations/route.js`
- `app/api/health/db/route.js`

## Required package

The DB route requires the Neon serverless package in `package.json`:

```json
"@neondatabase/serverless": "^0.10.4"
```

If you do not add this dependency, `/api/health/db` will fail at build/runtime.

## Test URLs after Vercel redeploy

- `https://whozthey.com/api/health/integrations`
- `https://whozthey.com/api/health/db`

## Expected

`/api/health/integrations` should show `true` values for Firebase and at least one Neon/Postgres database URL.

`/api/health/db` should return the list of Neon tables.

## Security note

These routes reveal configuration status and table names. Remove them or protect them after setup is verified.
