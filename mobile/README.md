# ACM Check-In — Mobile App

This folder is the phone app for ACM Check-In. It's built with **Expo** (React Native + TypeScript) and uses the **same Clerk login and the same Supabase database** as the website.

Follow the steps in order. Each step tells you what you should see when it worked. Setting up the first time takes about 20 minutes.

**Contents**
- [Part A: First-time setup](#part-a-first-time-setup) (do once)
- [Part B: Open the app on your phone](#part-b-open-the-app-on-your-phone) (every time)
- [Part C: Before you push code](#part-c-before-you-push-code)
- [Part D: How the code is organized](#part-d-how-the-code-is-organized)
- [Something went wrong?](#something-went-wrong)

---

## Part A: First-time setup

### Step 1: Set up the website first

The phone app reuses the website's keys and database, so the website setup has to be done first.

Follow **Part 1 of [ONBOARDING.md](../ONBOARDING.md)** (in the main folder).

✅ **It worked if** the website opens at http://localhost:3000 and you can sign in.

### Step 2: Install Expo Go on your phone

Expo Go is a free app that runs our app on your phone while you develop.

- iPhone: [Expo Go on the App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Expo Go on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

> Prefer a simulator instead of a phone? Android: [Android Studio emulator](https://docs.expo.dev/workflow/android-studio-emulator/) (Windows or Mac). iPhone: [Xcode simulator](https://docs.expo.dev/workflow/ios-simulator/) (Mac only).

### Step 3: Make an Expo account

1. Sign up for free at [expo.dev/signup](https://expo.dev/signup).
2. Open **Expo Go** on your phone and sign in with that account.

You need this to connect your phone over UF Wi-Fi (see Part B).

### Step 4: Open a terminal in the `mobile` folder

- **Windows:** press the Windows key, type **cmd**, open **Command Prompt**.
- **Mac:** open **Terminal**.

Then go to the `mobile` folder inside the project (change the path to wherever you cloned it):

```bash
cd path/to/acm_checkin/mobile
```

> **Windows + PowerShell users:** if you get *"running scripts is disabled on this system"*, either use Command Prompt instead, or type `npx.cmd` / `npm.cmd` wherever this guide says `npx` / `npm`.

### Step 5: Install the app's packages

```bash
npm install
```

✅ **It worked if** it ends with something like `added 1159 packages`. (Warnings are fine. Only `ERR!` lines mean it failed.)

### Step 6: Log in to Expo on your computer

```bash
npx expo login
```

Use the same Expo account as on your phone.

✅ **It worked if** it says `Logged in as <your-username>`.

### Step 7: Create your settings file

The app reads its keys from a file called `.env.local` in the `mobile` folder. Make it by copying the example:

- Windows: `copy .env.example .env.local`
- Mac: `cp .env.example .env.local`

Open `mobile/.env.local` in your editor (VS Code, Notepad…) and fill in the values below. You copy them from the **other** `.env.local`, the one in the main project folder that the website setup created.

| In `mobile/.env.local`, set… | …to the value of this line in the main `.env.local` |
| --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `EXPO_PUBLIC_SUPABASE_URL` | See the table below |

`EXPO_PUBLIC_SUPABASE_URL` depends on where the app runs:

| Running the app on… | Use this |
| --- | --- |
| Your phone | `http://YOUR-COMPUTER-IP:54321`. Find your IP: Windows, run `ipconfig` and use the "IPv4 Address" under Wi-Fi. Mac: run `ipconfig getifaddr en0`. |
| Android emulator | `http://10.0.2.2:54321` |
| iPhone simulator (Mac) | `http://127.0.0.1:54321` |

Save the file.

> 🔒 Only the three values above go in this file. **Never** put `CLERK_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` here, because everything in this file is built into the app where anyone could read it. The file itself is never uploaded to GitHub.

🎉 First-time setup is done. Go to Part B.

---

## Part B: Open the app on your phone

Do this every time you want to work on the app.

### Step 1: Start Docker and the database

Open **Docker Desktop** and wait until it says **Engine running**. Then, in a terminal in the **main project folder** (not `mobile`):

```bash
npx supabase start
```

> The current screens are placeholders and don't use the database yet, but data features (ADTCIA-28 onward) will.

### Step 2: Start the app server

In a terminal in the **`mobile` folder**:

```bash
npx expo start --tunnel
```

✅ **It worked if** you see `Tunnel ready` and a big QR code. **Leave this terminal open** while you use the app.

> **Why `--tunnel`?** UF Wi-Fi doesn't let your phone talk directly to your laptop. A tunnel connects them through the internet instead, so it works on any network. On home Wi-Fi, plain `npx expo start` (no `--tunnel`) is faster.

### Step 3: Open it on your phone

- **iPhone:** open the **Camera** app, point it at the QR code, and tap **Open in Expo Go**.
- **Android:** open **Expo Go** and tap **Scan QR code**.

The first time takes up to a minute while the app loads.

✅ **It worked if** you see a white card that says **Sign in** with a purple **ADTCIA-27** tag.

> Use the **QR code**, not the "Development servers" list in Expo Go. That list can point at an address UF Wi-Fi blocks.

### Step 4: Make changes

Edit any file in `mobile/src/` and save. The app on your phone updates by itself within a second or two.

To stop the server, click the terminal and press **Ctrl + C**.

---

## Part C: Before you push code

GitHub automatically checks every pull request that changes the mobile app. Run the same three checks yourself first, in the `mobile` folder:

```bash
npm run lint
npm run typecheck
npm test
```

✅ All three should finish **without errors**. If one fails, read the message: it names the file and line to fix.

---

## Part D: How the code is organized

```
mobile/
  src/
    app/              Screens. Every file here is a screen (Expo Router).
      _layout.tsx       Decides what you see: signed out → (auth), signed in → (tabs)
      (auth)/           Screens for signed-out users (Sign in)
      (tabs)/           The tab bar for signed-in users: Home, Check in, Profile
    components/       Reusable pieces (Screen, PlaceholderScreen, Button)
    theme/            All colours, corner sizes and spacing
```

### Colours: always use the theme

All colours are copied from the website's design (`app/globals.css`) into `src/theme/tokens.ts`. **Never type a colour code like `#7c3aed` in a screen.** Use the theme instead:

```tsx
import { colors, radii, space } from '@/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: space[4],
  },
});
```

Two automatic checks keep this honest:
- `npm run lint` fails if a screen contains a raw colour code.
- `npm test` fails if a colour no longer matches the website. If the web team changes a colour, update `tokens.ts` to match.

Design rules (same as the website): purple (`colors.accent`) is **only** for the main button, the selected tab, and logos/avatars. Green/amber/red are for success/warning/error only. Light mode only.

---

## Something went wrong?

Find the message you're seeing:

| What you see | What to do |
| --- | --- |
| **"running scripts is disabled on this system"** (Windows PowerShell) | Use **Command Prompt**, or type `npx.cmd` / `npm.cmd` instead of `npx` / `npm`. |
| **"Missing Clerk key"** screen on the phone | `mobile/.env.local` is missing or the Clerk line is empty (Part A, Step 7). Fix it, stop the server (Ctrl + C), and start it again with `npx expo start --tunnel -c`. The `-c` makes it reload the settings. |
| Expo Go asks you to **sign in to Expo CLI** / run `npx expo login` | Do Part A, Steps 3 and 6. Use the same account on phone and computer. |
| **"Could not connect to development server"**, stuck at some % | The download dropped partway (common on UF Wi-Fi). Fully close Expo Go (swipe it away), open it, and scan again. The second try is fast. Still failing? Turn off Wi-Fi on your phone and use cellular data. |
| **"Could not connect"** right away, no % | The server isn't running (Part B, Step 2), or you tapped the "Development servers" list instead of scanning the QR code. |
| Expo Go says the project is **incompatible** / wrong SDK | Update Expo Go from the App Store or Google Play. This app needs SDK 57. |
| **"Network request failed"** when the app loads data | Check `EXPO_PUBLIC_SUPABASE_URL` uses your computer's IP, not `127.0.0.1` (Part A, Step 7), and that `npx supabase start` is running. |
| `npx supabase start` fails on Windows with an error about **vector** or **analytics** | Run `npx supabase start -x vector,logflare` instead. It skips the logging services, which don't work on Windows. |
| You changed `.env.local` but nothing changed | Restart with `npx expo start --tunnel -c`. Settings are only read at startup. |

Still stuck? Ask in the team channel and include a screenshot of the error.
