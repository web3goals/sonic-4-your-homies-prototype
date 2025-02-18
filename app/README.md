# App

### Commands

- Install dependencies - `npm install`
- Start development app - `npm run dev`
- Buid and run production app - `npm run build` and `npm run start`
- Deploy to vercel preview - `vercel`
- Deploy to vercel production - `vercel --prod`

### How to fix `zustand` error from `@privy-io/react-auth`

Add following lines to `package.json`:

```js
"overrides": {
  "zustand": "4.5.6"
}
```

## Example of `.env`

```ini
# Privy (Public)
NEXT_PUBLIC_PRIVY_APP_ID=""

# CDP
CDP_API_KEY_NAME=""
CDP_API_KEY_PRIVATE_KEY=""

# OpenAI
OPENAI_API_KEY=""

# MongoDB
MONGODB_URI=""

# Privy
PRIVY_APP_ID=""
PRIVY_APP_SECRET=""
```
