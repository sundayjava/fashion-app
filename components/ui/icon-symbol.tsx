// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'chevron.right': 'chevron-right',
  'chevron.down': 'expand-more',
  'chevron.left.forwardslash.chevron.right': 'code',
  'xmark': 'close',
  'checkmark': 'check',
  // Biometrics
  'faceid': 'face',
  'touchid': 'fingerprint',
  'eye.fill': 'visibility',
  // Tabs
  'gearshape.fill': 'settings',
  'person': 'person-outline',
  'plus': 'add',
  'note': 'note',
  'paperplane.fill': 'send',
  // Account (fill = filled, no fill = outline)
  'person.fill': 'person',
  'key.fill': 'vpn-key',
  'key': 'vpn-key',
  'lock.fill': 'lock',
  'lock': 'lock-outline',
  'shield.fill': 'security',
  'shield': 'security',
  'envelope.fill': 'email',
  'envelope': 'mail-outline',
  'phone.fill': 'phone',
  'phone': 'phone',
  'trash.fill': 'delete',
  'trash': 'delete-outline',
  // Business
  'briefcase.fill': 'work',
  'briefcase': 'work-outline',
  'pencil.line': 'edit',
  'creditcard.fill': 'credit-card',
  'creditcard': 'credit-card',
  'photo.on.rectangle': 'burst-mode',
  // Notifications
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'bell.badge.fill': 'notification-important',
  'bell.badge': 'notification-important',
  'photo.fill': 'photo',
  'photo': 'photo',
  'bag.fill': 'shopping-bag',
  'bag': 'shopping-bag',
  // Appearance
  'paintpalette.fill': 'palette',
  'paintpalette': 'palette',
  'sun.max.fill': 'light-mode',
  'moon.fill': 'dark-mode',
  // Support
  'questionmark.circle.fill': 'help',
  'questionmark.circle': 'help-outline',
  'doc.text.fill': 'description',
  'doc.text': 'description',
  'info': 'info',
  // Logout
  'rectangle.portrait.and.arrow.right.fill': 'logout',
  'rectangle.portrait.and.arrow.right': 'logout',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
