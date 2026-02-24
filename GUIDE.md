# Fashionistar — Project Guide

> A living reference for the complete project setup. Read this whenever you're unsure where
> something lives or how to extend it.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Running the App](#2-running-the-app)
3. [Navigation — How It Works](#3-navigation--how-it-works)
4. [Adding a New Tab](#4-adding-a-new-tab)
5. [Adding a New Stack Screen](#5-adding-a-new-stack-screen)
6. [Adding a Modal Screen](#6-adding-a-modal-screen)
7. [Theme System](#7-theme-system)
8. [Design Tokens (Colors, Typography, Spacing)](#8-design-tokens)
9. [UI Components](#9-ui-components)
10. [Forms, Validation & Inputs](#10-forms-validation--inputs)
11. [State Management (Zustand)](#11-state-management-zustand)
12. [Toasts](#12-toasts)
13. [Bottom Sheet](#13-bottom-sheet)
14. [Modals](#14-modals)
15. [Installed Packages](#15-installed-packages)
16. [Where to Continue From](#16-where-to-continue-from)
17. [Testing (Jest + RNTL)](#17-testing-jest--react-native-testing-library)
18. [Git Hooks (Husky)](#18-git-hooks-husky--lint-staged)
19. [Build Environments](#19-build-environments-appconfigts)
20. [Sentry Error Tracking](#20-sentry-error-tracking)

---

## 1. Project Structure

```
fashionistar/
├── app/                         ← All screens (expo-router)
│   ├── _layout.tsx              ← ROOT layout — providers, fonts, navigation shell
│   ├── modal.tsx                ← /modal route (modal presentation)
│   ├── form-demo.tsx            ← /form-demo route (stack, registration form)
│   └── (tabs)/                  ← Tab group
│       ├── _layout.tsx          ← Tab bar definition (add/remove tabs HERE)
│       ├── index.tsx            ← Home tab
│       ├── explore.tsx          ← Explore tab
│       └── settings.tsx         ← Settings tab (theme toggle)
│
├── components/
│   └── ui/                      ← All design system components
│       ├── index.ts             ← Barrel export — import everything from here
│       ├── Typography.tsx       ← Text component
│       ├── GlassButton.tsx      ← All button variants + glassmorphism
│       ├── GlassCard.tsx        ← Glass card container
│       ├── Input.tsx            ← AppInput — standard text input
│       ├── PhoneInput.tsx       ← Phone input + country code picker
│       ├── DOBInput.tsx         ← Date of birth (iOS modal + Android native)
│       ├── ControlledInputs.tsx ← react-hook-form wrappers for all inputs
│       ├── AppBottomSheet.tsx   ← @gorhom/bottom-sheet wrapper
│       ├── AppModal.tsx         ← Modal + ConfirmModal
│       ├── Toast.tsx            ← Toast config + showToast helper
│       ├── GlassTabBar.tsx      ← Custom glassmorphism tab bar
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       └── Divider.tsx
│
├── constants/
│   ├── colors.ts                ← Palette + ThemeColors (light/dark)
│   ├── typography.ts            ← FontFamily, FontSize, TextVariants
│   ├── spacing.ts               ← Spacing, BorderRadius, Shadow
│   └── theme.ts                 ← Barrel + NavigationLightTheme / NavigationDarkTheme
│
├── context/
│   └── ThemeContext.tsx         ← AppThemeProvider + useAppTheme()
│
├── stores/
│   └── themeStore.ts            ← Zustand store (theme preference, persisted)
│
├── data/
│   └── countries.ts             ← ~150 countries with flag emoji and dial codes
│
├── services/
│   └── sentry.ts                ← Sentry helpers (captureError, identifyUser, etc.)
│
├── utils/
│   └── validation.ts            ← All Yup schemas (register, login, profile, etc.)
│
├── __tests__/                   ← Jest test files (mirrors source structure)
│   ├── utils/
│   │   └── validation.test.ts
│   ├── stores/
│   │   └── themeStore.test.ts
│   └── components/
│       └── Typography.test.tsx
│
├── __mocks__/                   ← Jest module mocks
│   ├── expo-winter-runtime.js   ← Prevents Expo SDK52+ winter runtime crash in Jest
│   └── structured-clone.js      ← Native structuredClone shim
│
├── .husky/                      ← Git hooks (managed by husky)
│   ├── pre-commit               ← Runs lint-staged on commit
│   └── pre-push                 ← Runs Jest test suite on push
│
├── app.config.ts                ← Dynamic Expo config (replaces app.json)
├── jest.config.js               ← Jest configuration
├── jest.setup.js                ← Jest mocks (after framework loads)
├── jest.globals.js              ← Jest globals (before framework loads)
├── .env.development             ← Dev environment variables
├── .env.staging                 ← Staging environment variables
└── .env.production              ← Production environment variables
```

---

## 2. Running the App

```bash
npm start           # Expo dev server (scan QR with Expo Go)
npm run android     # Android emulator
npm run ios         # iOS simulator (Mac only)
npm run web         # Browser
```

If you see a Metro cache error:
```bash
npx expo start --clear
```

---

## 3. Navigation — How It Works

This project uses **expo-router** — a file-system based router.
Every `.tsx` file inside `app/` automatically becomes a route.

| File | URL / route |
|---|---|
| `app/(tabs)/index.tsx` | `/` (home tab) |
| `app/(tabs)/explore.tsx` | `/explore` |
| `app/(tabs)/settings.tsx` | `/settings` |
| `app/modal.tsx` | `/modal` |
| `app/form-demo.tsx` | `/form-demo` |

### How to navigate

```tsx
import { useRouter, Link } from 'expo-router';

// Programmatic
const router = useRouter();
router.push('/form-demo');      // push onto stack
router.replace('/settings');    // replace (no back button)
router.back();                  // go back

// Declarative
<Link href="/form-demo">Open Form</Link>
```

### Stack vs Tab vs Modal

- **Tabs** — defined in `app/(tabs)/_layout.tsx`
- **Stack** — defined in `app/_layout.tsx` inside `<Stack>`
- **Modal** — `presentation: 'modal'` in the Stack.Screen options

---

## 4. Adding a New Tab

**Step 1** — Create the screen file:
```
app/(tabs)/profile.tsx
```

**Step 2** — Add it to `app/(tabs)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="profile"
  options={{
    title: 'Profile',
    tabBarIcon: ({ color, size }) => (
      <IconSymbol size={size} name="person.fill" color={color} />
    ),
  }}
/>
```

That's it. The glassmorphism tab bar picks it up automatically.

> **Icon names** — the app uses SF Symbols on iOS and Material icons on Android.
> Browse SF Symbol names at https://developer.apple.com/sf-symbols/
> or check `components/ui/icon-symbol.tsx` for the Android fallback map.

---

## 5. Adding a New Stack Screen

**Step 1** — Create the file:
```
app/product-detail.tsx
```

**Step 2** — Register it in `app/_layout.tsx` inside `<Stack>`:
```tsx
<Stack.Screen
  name="product-detail"
  options={{
    title: 'Product',
    headerShown: true,   // or false if you build your own header
  }}
/>
```

**Step 3** — Navigate to it:
```tsx
router.push('/product-detail');
// or with params:
router.push({ pathname: '/product-detail', params: { id: '123' } });
```

**Step 4** — Read params inside the screen:
```tsx
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## 6. Adding a Modal Screen

**Step 1** — Create `app/my-modal.tsx`

**Step 2** — Register in `app/_layout.tsx`:
```tsx
<Stack.Screen
  name="my-modal"
  options={{ presentation: 'modal', headerShown: false }}
/>
```

**Step 3** — Open it:
```tsx
router.push('/my-modal');
```

---

## 7. Theme System

### How it works

```
Device system theme  ──┐
                        ▼
   useThemeStore()  ──▶  AppThemeProvider  ──▶  useAppTheme()
   (Zustand, persisted)     (React Context)
```

1. **Default** = system theme (follows device)
2. User can override to `'light'` or `'dark'` in Settings
3. The preference is saved to `AsyncStorage` via Zustand persist and survives app restarts

### Using the theme in any component

```tsx
import { useAppTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { colors, isDark, preference, setPreference } = useAppTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

### Changing theme programmatically

```tsx
const { setPreference } = useAppTheme();

setPreference('dark');    // force dark
setPreference('light');   // force light
setPreference('system');  // follow device
```

---

## 8. Design Tokens

### Colors — `constants/colors.ts`

```ts
import { Palette, ThemeColors } from '@/constants/colors';

Palette.primary        // #9056b9
Palette.accent         // #e9992c
Palette.success        // #22C55E
// ... etc

ThemeColors.light.text       // black
ThemeColors.dark.text        // white
```

### Typography — `constants/typography.ts`

```ts
import { FontFamily, FontSize, TextVariants } from '@/constants/typography';

FontFamily.regular    // 'RedditSans_400Regular'
FontFamily.bold       // 'RedditSans_700Bold'
FontSize.base         // 15
TextVariants.h2       // { fontFamily, fontSize, lineHeight, ... }
```

### Spacing / BorderRadius / Shadow — `constants/spacing.ts`

```ts
import { Spacing, BorderRadius, Shadow } from '@/constants/spacing';

Spacing.md    // 16
Spacing.lg    // 24
BorderRadius.lg  // 16
Shadow.glass  // { shadowColor, shadowOffset, ... elevation }
```

---

## 9. UI Components

Import everything from the barrel:
```tsx
import {
  Typography, GlassButton, GlassCard, AppInput,
  PhoneInput, DOBInput, Badge, Avatar, Divider,
  AppBottomSheet, AppModal, ConfirmModal,
  ControlledInput, ControlledPhone, ControlledDOB,
  showToast,
} from '@/components/ui';
```

### Typography

```tsx
<Typography variant="h2">Heading</Typography>
<Typography variant="body" color={colors.textSecondary}>Body text</Typography>

{/* Custom overrides — all optional */}
<Typography
  variant="body"
  weight="bold"       // 'regular' | 'medium' | 'semiBold' | 'bold'
  size={18}
  italic
  color="#9056b9"
  align="center"
  tracking={1}
  underline
  style={{ marginTop: 8 }}  // arbitrary TextStyle, always wins
>
  Fully custom
</Typography>
```

Available variants: `display h1 h2 h3 h4 title subtitle body bodyMedium caption overline label button buttonSm link`

### GlassButton

```tsx
<GlassButton variant="glass" label="Glass" onPress={() => {}} />
<GlassButton variant="primary" label="Primary" fullWidth />
<GlassButton variant="accent" label="Accent" size="sm" />
<GlassButton variant="outline" label="Outline" loading />
<GlassButton variant="ghost" label="Ghost" disabled />
```

### GlassCard

```tsx
<GlassCard>           {/* blur glassmorphism, default */}
  <Typography>Content</Typography>
</GlassCard>

<GlassCard blur={false} padding={24}>
  {/* solid glass with rgba background */}
</GlassCard>
```

### AppInput

```tsx
<AppInput
  label="Email"
  placeholder="you@example.com"
  keyboardType="email-address"
  error="Invalid email"    // shows red border + message
  hint="We'll never share"
  leftIcon={<Icon />}
  rightIcon={<Text>Clear</Text>}
  onRightIconPress={() => {}}
/>
```

---

## 10. Forms, Validation & Inputs

### Full form example (react-hook-form + Yup)

```tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, LoginFormValues } from '@/utils/validation';
import { ControlledInput, GlassButton } from '@/components/ui';

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log(data.email, data.password);
  };

  return (
    <>
      <ControlledInput
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ControlledInput
        control={control}
        name="password"
        label="Password"
        secureTextEntry
      />
      <GlassButton
        variant="primary"
        label="Log In"
        onPress={handleSubmit(onSubmit)}
        fullWidth
      />
    </>
  );
}
```

### Phone Input

```tsx
<ControlledPhone
  control={control}
  name="phone"
  label="Phone number"
  defaultCountryCode="NG"   // ISO-2 code — sets initial country
/>

// The value you get back:
// { country: Country, number: "8012345678", full: "+2348012345678" }
```

### Date of Birth

```tsx
<ControlledDOB
  control={control}
  name="dob"
  label="Date of birth"
  hint="Must be 13+ years old"
/>
// iOS: shows a bottom-sheet spinner with Confirm/Cancel
// Android: shows native date picker dialog
```

### Available Yup schemas (`utils/validation.ts`)

| Schema | Fields |
|---|---|
| `loginSchema` | email, password |
| `registerSchema` | firstName, lastName, username, email, password, confirmPassword, phone, dob |
| `forgotPasswordSchema` | email |
| `profileSchema` | firstName, lastName, username, bio, phone?, dob? |

To add a new schema:
```ts
// utils/validation.ts
export const myFormSchema = yup.object({
  title: nameSchema('Title'),
  email: emailSchema,
});
export type MyFormValues = yup.InferType<typeof myFormSchema>;
```

---

## 11. State Management (Zustand)

Stores live in `stores/`. Each store is a single file.

### Existing stores

| File | Contents |
|---|---|
| `stores/themeStore.ts` | `preference`, `setPreference` — persisted to AsyncStorage |

### Adding a new store

```ts
// stores/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem { id: string; qty: number; }

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

Then use anywhere:
```tsx
const { items, addItem } = useCartStore();
```

> If you don't need persistence, just remove the `persist` wrapper:
> `export const useStore = create<State>()((set) => ({ ... }));`

---

## 12. Toasts

```tsx
import { showToast } from '@/components/ui';

showToast({ type: 'success', text1: 'Done!', text2: 'Optional subtitle' });
showToast({ type: 'error',   text1: 'Error', text2: 'Something failed' });
showToast({ type: 'info',    text1: 'Info' });
showToast({ type: 'warning', text1: 'Warning' });
```

The `AppToastHost` is already registered once in `app/_layout.tsx`. Do not add it again.

---

## 13. Bottom Sheet

```tsx
import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { AppBottomSheet } from '@/components/ui';

const sheetRef = useRef<BottomSheet>(null);

// Open / close
sheetRef.current?.expand();
sheetRef.current?.close();

// JSX
<AppBottomSheet
  ref={sheetRef}
  snapPoints={['40%', '80%']}   // multiple snap points
  title="Filter"
  scrollable                    // wrap content in BottomSheetScrollView
>
  <Typography>Sheet content here</Typography>
</AppBottomSheet>
```

---

## 14. Modals

```tsx
import { useState } from 'react';
import { AppModal, ConfirmModal } from '@/components/ui';

// Information modal
const [open, setOpen] = useState(false);

<AppModal
  visible={open}
  onClose={() => setOpen(false)}
  title="Title"
  description="Optional subtitle"
  size="md"   // 'sm' | 'md' | 'lg' | 'full'
  footer={<GlassButton variant="primary" label="OK" onPress={() => setOpen(false)} fullWidth />}
>
  <Typography>Body content</Typography>
</AppModal>

// Confirm dialog
<ConfirmModal
  visible={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={() => doSomething()}
  title="Delete item?"
  description="This cannot be undone."
  confirmLabel="Delete"
  destructive   // makes confirm button accent (orange)
/>
```

---

## 15. Installed Packages

| Package | Why |
|---|---|
| `expo-router ~6` | File-based navigation |
| `react-native-reanimated ~4` | Animations |
| `react-native-gesture-handler ~2` | Gesture system (required by bottom-sheet) |
| `react-native-safe-area-context ~5` | Safe area insets |
| `@gorhom/bottom-sheet ^5` | Bottom sheet |
| `expo-blur ~15` | BlurView for glassmorphism |
| `@expo-google-fonts/reddit-sans` | Reddit Sans typeface |
| `react-native-toast-message ^2` | Toast notifications |
| `zustand` | Global state management |
| `@react-native-async-storage/async-storage` | Storage for zustand persist |
| `yup` | Schema-based form validation |
| `react-hook-form` | Form state management |
| `@hookform/resolvers` | yup adapter for react-hook-form |
| `@react-native-community/datetimepicker` | Native date/time picker (iOS + Android) |

---

## 16. Where to Continue From

### Immediate next steps (recommended order)

1. **Auth screens** — `app/login.tsx`, `app/register.tsx`, `app/forgot-password.tsx`
   - Use `ControlledInput`, `ControlledPhone`, `ControlledDOB`
   - Use the schemas already in `utils/validation.ts`
   - Register each screen in `app/_layout.tsx` `<Stack>`

2. **Auth store** — `stores/authStore.ts`
   - Store `user`, `token`, `isAuthenticated`
   - Persist token with AsyncStorage
   - Example pattern already shown in [Section 11](#11-state-management-zustand)

3. **Protected routes** — In `app/_layout.tsx`, read `isAuthenticated` and redirect with `router.replace('/login')`

4. **API layer** — Create `services/api.ts` using `fetch` or install `axios`
   ```bash
   npm install axios
   ```

5. **Product/feed screens** — Add new tabs or stack screens as needed

6. **Image handling** — Expo Image is already installed (`expo-image`)

### Editing what's already here

| To change… | Edit this file |
|---|---|
| Brand colors | `constants/colors.ts` → `Palette` |
| Light/dark theme tokens | `constants/colors.ts` → `ThemeColors` |
| Font sizes or variants | `constants/typography.ts` |
| Spacing / border radius | `constants/spacing.ts` |
| Glass button style | `components/ui/GlassButton.tsx` |
| Tab bar appearance | `components/ui/GlassTabBar.tsx` |
| Country list | `data/countries.ts` |
| Form validation rules | `utils/validation.ts` |
| Add a new Zustand store | Create `stores/yourStore.ts`, import where needed |

### Key patterns reminder

```tsx
// Always import theme tokens like this:
const { colors, isDark } = useAppTheme();

// Always import UI components from the barrel:
import { Typography, GlassButton, GlassCard } from '@/components/ui';

// Always import constants from the barrel:
import { Spacing, BorderRadius, Palette } from '@/constants/theme';
```

---

## 17. Testing (Jest + React Native Testing Library)

### Running tests

```bash
npm test                  # Run all tests once
npm run test:watch        # Watch mode (re-runs on file change)
npm run test:coverage     # Run with coverage report (outputs to coverage/)
npm run test:ci           # CI mode — fails if any test fails
```

### Test file locations

```
__tests__/
├── utils/
│   └── validation.test.ts    ← Yup schema tests (38 tests, all passing)
├── stores/
│   └── themeStore.test.ts    ← Zustand store tests
└── components/
    └── Typography.test.tsx   ← Typography component render tests
```

### Writing a new test

**Utility / store test (no rendering):**
```ts
// __tests__/utils/myUtil.test.ts
import { myHelper } from '@/utils/myHelper';

describe('myHelper', () => {
  it('returns the correct value', () => {
    expect(myHelper(5)).toBe(10);
  });
});
```

**Component test (with rendering):**
```tsx
// __tests__/components/MyComponent.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MyComponent } from '@/components/ui/MyComponent';

// Wrap in ThemeContext if the component reads colors:
const Wrapper = ({ children }) => (
  <AppThemeProvider>{children}</AppThemeProvider>
);

it('renders correctly', () => {
  render(<MyComponent />, { wrapper: Wrapper });
  expect(screen.getByText('Hello')).toBeTruthy();
});
```

**Zustand store test:**
```ts
import { renderHook, act } from '@testing-library/react-native';
import { useMyStore } from '@/stores/myStore';

beforeEach(() => useMyStore.setState({ count: 0 })); // reset state

it('increments count', () => {
  const { result } = renderHook(() => useMyStore());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

### Important: mocks

All global mocks live in `jest.setup.js`. If a new package causes test failures, add a mock there:
```js
// jest.setup.js
jest.mock('my-new-package', () => ({ doThing: jest.fn() }));
```

Key mocks already in place:
- `expo-font`, `expo-splash-screen`, `expo-constants`
- `@react-native-async-storage/async-storage`
- `react-native-gesture-handler`
- `@gorhom/bottom-sheet`
- `expo-router`
- `expo-blur`
- `react-native-toast-message`
- `@sentry/react-native`

---

## 18. Git Hooks (Husky + lint-staged)

### How it works

- **On `git commit`** → Husky runs `.husky/pre-commit` → runs `lint-staged`
  - `lint-staged` only processes **staged files** (not all files), so it's fast
  - It runs ESLint with auto-fix, then TypeScript type check
  - If ESLint or TypeScript fails, the commit is **blocked** until you fix issues

- **On `git push`** → Husky runs `.husky/pre-push` → runs the full Jest test suite
  - If any test fails, the push is **blocked**
  - This ensures broken tests never reach GitHub

### Bypass (emergency only)

```bash
git commit --no-verify -m "WIP: skip hooks"
git push --no-verify
```

Only use this if you're certain it's safe. Prefer fixing the issues.

### Adding more checks

Edit `.husky/pre-commit` to add more commands:
```sh
#!/usr/bin/env sh
npx lint-staged
# Add more checks here, e.g.:
# npm run typecheck
```

Edit `lint-staged` in `package.json` to change what runs on staged files:
```json
"lint-staged": {
  "**/*.{ts,tsx}": ["eslint --fix", "bash -c 'tsc --noEmit'"]
}
```

---

## 19. Build Environments (app.config.ts)

The project uses `app.config.ts` instead of `app.json` for **dynamic configuration** based on the build environment.

### Environment files

| File | Purpose |
|---|---|
| `.env.development` | Local dev (default) |
| `.env.staging` | Staging builds |
| `.env.production` | Production builds |

**Never commit real secrets to git.** The `.env.*` files are listed in `.gitignore`.

### Switching environments

```bash
APP_ENV=staging npx expo start
APP_ENV=production npx expo build
```

Or with EAS Build:
```bash
eas build --profile staging
eas build --profile production
```

### App name & bundle ID per environment

| Environment | App name | Bundle ID (iOS) | Package (Android) |
|---|---|---|---|
| development | Fashionistar (Dev) | com.fashionistar.dev | com.fashionistar.dev |
| staging | Fashionistar (Staging) | com.fashionistar.staging | com.fashionistar.staging |
| production | Fashionistar | com.fashionistar.app | com.fashionistar.app |

Update these in `app.config.ts` → `versionConfig`.

### Reading env values in app code

The values are passed through `extra` in `app.config.ts` and read via `expo-constants`:

```ts
import Constants from 'expo-constants';

const { apiUrl, appEnv, sentryDsn } = Constants.expoConfig?.extra ?? {};
```

---

## 20. Sentry Error Tracking

Sentry is installed (`@sentry/react-native`) and configured in `services/sentry.ts`.

### Initial setup (one-time)

1. Create an account at [sentry.io](https://sentry.io) (free tier available)
2. Create a new project → choose React Native
3. Copy the DSN string
4. Paste it into your `.env.development` (and staging/production):
   ```
   SENTRY_DSN=https://xxxxxxxxxxxxxxxx@oXXXXXX.ingest.sentry.io/XXXXXXX
   ```
5. Update `app.config.ts` → `plugins` → `@sentry/react-native/expo` with your org and project slug

### Using Sentry helpers

All helpers are in `services/sentry.ts`. Import them anywhere:

```ts
import {
  captureError,
  captureSentryMessage,
  identifySentryUser,
  addSentryBreadcrumb,
} from '@/services/sentry';

// Capture an error with context
try {
  await riskyOperation();
} catch (error) {
  captureError(error, { screen: 'CheckoutScreen', orderId: '123' });
}

// Log a custom message
captureSentryMessage('User completed onboarding', 'info');

// Identify a logged-in user (call after login)
identifySentryUser({ id: user.id, username: user.username });

// Clear user on logout
identifySentryUser(null);

// Add a navigation breadcrumb
addSentryBreadcrumb('navigation', 'Navigated to HomeScreen');
```

### What's already set up

- `initSentry()` is called at app startup in `app/_layout.tsx` (before any renders)
- The root component is wrapped with `Sentry.wrap()` for native crash capturing
- PII stripping: user email and IP are removed in `beforeSend`
- Performance tracing: 20% in production, 100% in development
- Debug mode is ON in development, OFF in production
- If `SENTRY_DSN` is not set, Sentry is disabled silently (dev-friendly)

---

*Last updated: Feb 2026 — Fashionistar Design System v1.1*

