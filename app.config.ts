import 'dotenv/config';
import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * App build environments.
 * Switch by setting APP_ENV in your .env file.
 *   APP_ENV=development  →  dev build (local API, verbose Sentry)
 *   APP_ENV=staging      →  staging build (staging API, Sentry enabled)
 *   APP_ENV=production   →  production build (prod API, Sentry enabled)
 */

type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV: AppEnv = (process.env.APP_ENV as AppEnv) ?? 'development';

const versionConfig = {
  development: {
    appName: 'Fashionistar (Dev)',
    bundleId: 'com.fashionistar.dev',
    androidPackage: 'com.fashionistar.dev',
    icon: './assets/images/icon.png',
  },
  staging: {
    appName: 'Fashionistar (Staging)',
    bundleId: 'com.fashionistar.staging',
    androidPackage: 'com.fashionistar.staging',
    icon: './assets/images/icon.png',
  },
  production: {
    appName: 'Fashionistar',
    bundleId: 'com.fashionistar.app',
    androidPackage: 'com.fashionistar.app',
    icon: './assets/images/icon.png',
  },
} satisfies Record<AppEnv, Record<string, string>>;

const { appName, bundleId, androidPackage, icon } = versionConfig[APP_ENV];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: 'fashionistar',
  version: '1.0.0',
  orientation: 'portrait',
  icon,
  scheme: 'fashionistar',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
  },
  android: {
    package: androidPackage,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    '@react-native-community/datetimepicker',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'fashionistar',
        organization: 'YOUR_SENTRY_ORG',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    /** Access via Constants.expoConfig?.extra?.apiUrl */
    appEnv: APP_ENV,
    apiUrl: process.env.API_URL ?? 'https://api.dev.fashionistar.com',
    sentryDsn: process.env.SENTRY_DSN ?? '',
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID', // get from `eas init`
    },
  },
});
