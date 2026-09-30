# Localink mobile build

## Required environment
Copy `.env.example` to `.env` and provide the Localink Supabase URL and public anon key.

## Local development
From the repository root:

```bash
pnpm install
pnpm --filter @localink/mobile dev
```

Use Expo Go only while every installed native dependency is compatible with Expo Go. Use the development build profile when native SDKs such as Mapbox or advanced video are added.

## Internal Android build

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview
```

The preview profile creates an internally distributable APK.

## Internal development client

```bash
cd apps/mobile
npx eas-cli build --platform android --profile development
```

## Production

```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Do not commit `.env` or service-role secrets. Public mobile configuration may use only the Supabase public client key. Server-only payment, moderation, streaming-provider and administrative credentials must stay outside the mobile bundle.
