import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

/**
 * Reactive colour-scheme hook — updates immediately when the user changes
 * the system theme without needing an app reload.
 * Requires `userInterfaceStyle: 'automatic'` in app.config.ts.
 *
 * `Appearance.setColorScheme(null)` keeps Android in "follow system" mode so
 * the JS Appearance listener actually fires on OS theme changes.
 */
export function useColorScheme(): ColorSchemeName {
  const [scheme, setScheme] = useState<ColorSchemeName>(
    () => Appearance.getColorScheme()
  );

  useEffect(() => {
    // null = defer to OS; required on Android to receive change events
    Appearance.setColorScheme(null);

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(colorScheme);
    });

    return () => sub.remove();
  }, []);

  return scheme;
}
