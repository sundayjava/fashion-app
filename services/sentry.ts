import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as {
  sentryDsn?: string;
  appEnv?: string;
} | undefined;

const DSN = extra?.sentryDsn ?? '';
const ENV = (extra?.appEnv as string) ?? 'development';
const IS_PRODUCTION = ENV === 'production';

/**
 * Call this once at app startup (before any React renders).
 * Already called inside app/_layout.tsx — do NOT call again.
 */
export function initSentry() {
  if (!DSN) {
    if (__DEV__) {
      console.warn('[Sentry] No DSN configured — error tracking disabled. Set SENTRY_DSN in your .env file.');
    }
    return;
  }

  Sentry.init({
    dsn: DSN,
    environment: ENV,
    debug: !IS_PRODUCTION,

    // Performance monitoring — % of transactions to trace
    tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,

    // Only send errors to Sentry in non-dev OR if you want dev errors too
    // enableInExpoDevelopment is not in the type defs for @sentry/react-native
    // but is supported at runtime. Use `enabled` instead:
    enabled: !!DSN,

    // Attach the breadcrumbs (navigation, user actions, etc.)
    enableNativeCrashHandling: true,
    attachScreenshot: IS_PRODUCTION,

    beforeSend(event) {
      // Strip any PII before sending
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Capture an error with optional extra context.
 *
 * @example
 * captureError(error, { screen: 'LoginScreen', userId: '123' });
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Log a message to Sentry (useful for non-error events you want visibility on).
 *
 * @example
 * captureSentryMessage('User completed onboarding', 'info');
 */
export function captureSentryMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.captureMessage(message, level);
}

/**
 * Identify the authenticated user in Sentry.
 * Call after successful login, clear on logout.
 *
 * @example
 * identifySentryUser({ id: '123', username: 'sunday' });
 * identifySentryUser(null); // on logout
 */
export function identifySentryUser(
  user: { id: string; username?: string } | null
) {
  if (user) {
    Sentry.setUser({ id: user.id, username: user.username });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add a breadcrumb for navigation or action tracking.
 *
 * @example
 * addSentryBreadcrumb('navigation', 'Navigated to HomeScreen');
 */
export function addSentryBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({ category, message, data, level: 'info' });
}
