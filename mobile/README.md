# ACM Check-In — Mobile

The member app for ACM Check-In, built with **Expo (React Native) + TypeScript**. It talks to the same Supabase database (under the same RLS rules) and the same Clerk app as the web app. There is no separate API.

| | |
| --- | --- |
| Framework | Expo SDK 57, React Native, TypeScript |
| Navigation | Expo Router (file-based, `src/app/`) |
| Auth | Clerk (`@clerk/expo`) |
| Database | `@supabase/supabase-js` with the Clerk token (ADTCIA-28) |
| Builds | EAS Build / EAS Submit (later sprints) |

## 1. Prerequisites

- Everything in the root [ONBOARDING.md](../ONBOARDING.md) Part 1 — Node 20.19+ (22 recommended), Docker Desktop, Git — and the **web app's local setup done once** (`npm run setup` in the repo root). The mobile app uses that same local Supabase and the same Clerk keys.
- One way to run the app:
  - **Your phone** with the **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)). Easiest; works from Windows or Mac.
  - **Android emulator** via Android Studio (Windows or Mac). See [Expo: Android Studio emulator](https://docs.expo.dev/workflow/android-studio-emulator/).
  - **iOS simulator** via Xcode (Mac only). See [Expo: iOS simulator](https://docs.expo.dev/workflow/ios-simulator/).

## 2. Install

From the repo root:

```bash
cd mobile
npm install
```

## 3. Configure `mobile/.env.local`

```bash
cp .env.example .env.local
```

Then fill in three values, all copied from the **root** `.env.local` the web setup created:

| `mobile/.env.local` | Copy from root `.env.local` |
| --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `EXPO_PUBLIC_SUPABASE_URL` | see below — it depends on where the app runs |

`EXPO_PUBLIC_SUPABASE_URL` must be reachable **from the device**, so `127.0.0.1` only works on the iOS simulator:

| Running on | `EXPO_PUBLIC_SUPABASE_URL` |
| --- | --- |
| iOS simulator | `http://127.0.0.1:54321` |
| Android emulator | `http://10.0.2.2:54321` |
| Physical phone (Expo Go) | `http://<your computer's LAN IP>:54321` — find it with `ipconfig` (Windows) or `ipconfig getifaddr en0` (Mac). Phone and computer must be on the same Wi-Fi. |

> Only **public** keys go in this file — every `EXPO_PUBLIC_*` value is bundled into the app. Never put `CLERK_SECRET_KEY` or the Supabase `service_role` key here.

## 4. Run it

Start local Supabase first (from the repo root, with Docker Desktop running):

```bash
npx supabase start
```

Then, from `mobile/`:

```bash
npx expo start
```

- **Phone:** scan the QR code in the terminal (iOS: Camera app; Android: Expo Go).
- **Android emulator:** press `a`. **iOS simulator:** press `i`.
- Changed `.env.local`? Restart with `npx expo start -c` (clears the cache so new values load).

You should land on the **Sign in** placeholder. When signed in, you get three tabs: **Home**, **Check in**, **Profile** (with Sign out).

### On campus Wi-Fi (or any network that blocks phone ↔ laptop)

UF Wi-Fi blocks devices from talking to each other, so the normal QR code won't connect. Use a tunnel instead:

1. Make a free account at [expo.dev/signup](https://expo.dev/signup). Expo Go needs it for tunnels.
2. Log in on your computer with `npx expo login`, and in the Expo Go app with the same account.
3. Start with `npx expo start --tunnel` and scan the QR code it prints, or in Expo Go use **Enter URL manually** with the `exp://….exp.direct` address. Don't tap the "Development servers" entry, which may point at your blocked local address.

The first load downloads ~8 MB through the tunnel and can drop partway ("Could not connect to development server" at some percentage). Fully close Expo Go and open the project again; the second try is fast because the bundle is cached. Switching the phone to cellular data also helps.

## 5. Before you push

CI runs these on every PR that touches `mobile/` — run them locally first:

```bash
npm run lint
npm run typecheck
npm test
```

## Project layout

```
mobile/
  src/
    app/                 Routes (Expo Router). Every file is a screen.
      _layout.tsx        ClerkProvider + signed-in / signed-out switch
      (auth)/            Signed-out stack (sign-in; sign-up + onboarding in ADTCIA-27)
      (tabs)/            Signed-in tabs: Home, Check in, Profile
    components/          Shared UI (Screen, PlaceholderScreen, Button)
    theme/               Design tokens -- the ONLY place colours are defined
```

## Design tokens: no raw hex

`src/theme/tokens.ts` ports the web design system from [`app/globals.css`](../app/globals.css): canvas/surface, the ink ramp, lines, accent tiers, good/warn/bad, radii.

```tsx
import { colors, radii, space } from '@/theme';

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.card, padding: space[4] },
});
```

- `npm run lint` **fails** on a raw hex colour anywhere in `src/` outside `src/theme/`.
- `npm test` **fails** if a token no longer matches `app/globals.css`. If web changes a token, update `tokens.ts` to match.

Same rules as web: the accent is only for the primary action, the active state and identity; good/warn/bad are never branded; light surface only.

## Troubleshooting

**"Missing Clerk key" screen** — `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` isn't set. Check `mobile/.env.local`, then `npx expo start -c`.

**Network request failed / can't reach Supabase on a phone** — `EXPO_PUBLIC_SUPABASE_URL` is `127.0.0.1`, which on a phone means the phone itself. Use your computer's LAN IP (see step 3), and make sure `npx supabase start` is running.

**Windows PowerShell: "npx.ps1 cannot be loaded because running scripts is disabled"**: use `npx.cmd` / `npm.cmd` instead (e.g. `npx.cmd expo start`), or run the commands in Command Prompt.

**Expo Go says the project is incompatible** — update Expo Go from the app store; this project targets SDK 57.
