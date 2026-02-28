export type SubMenuItem = { name: string; icon: string; route?: string; externalUrl?: string; toggle?: boolean };
export type SettingsEntry = {
  name: string;
  icon: string;
  subMenuGroups?: SubMenuItem[];
};

export const accountSettingsData: SettingsEntry[] = [
  {
    name: 'Account',
    icon: 'person',
    subMenuGroups: [
      { name: 'Change Password', icon: 'lock', route: '/(app)/(account)/reset-password' },
      { name: 'Two-Factor Authentication', icon: 'shield', route: '/(app)/(account)/security' },
      { name: 'Change Email', icon: 'envelope', route: '/(app)/(account)/change-email' },
      { name: 'Phone Number', icon: 'phone', route: '/(app)/(account)/change-phone' },
      { name: 'Delete Account', icon: 'trash', route: '/(app)/(account)/delete-account' },
    ],
  },
];

export const BusinessSettingsData: SettingsEntry[] = [
  {
    name: 'Business Profile',
    icon: 'briefcase',
    subMenuGroups: [
      { name: 'Edit Business Info', icon: 'pencil.line', route: '/(app)/(account)/business-settings' },
      { name: 'Payment Methods', icon: 'creditcard', route: '/(app)/coming-soon' },
      { name: 'Portfolio Settings', icon: 'photo.on.rectangle', route: '/(app)/(account)/portfolio-settings' },
    ],
  },
];

export const NotificationSettingsData: SettingsEntry[] = [
  {
    name: 'Notifications',
    icon: 'bell',
    subMenuGroups: [
      { name: 'Reminders', icon: 'bell.badge', toggle: true },
      { name: 'Portfolio Preview', icon: 'photo', toggle: true },
      { name: 'New Order Alerts', icon: 'bag', toggle: true },
    ],
  },
];

export const AppearanceSettingsData: SettingsEntry[] = [
  { name: 'Appearance', icon: 'paintpalette' },
];

export const SupportSettingsData: SettingsEntry[] = [
  {
    name: 'Support',
    icon: 'questionmark.circle',
    subMenuGroups: [
      { name: 'Help Center', icon: 'questionmark.circle', externalUrl: 'https://cionde.com/privacy-policy' },
      { name: 'Terms & Privacy', icon: 'doc.text', externalUrl: 'https://cionde.com/terms-of-use' },
    ],
  },
];

export const LogoutSettingsData: SettingsEntry[] = [
  { name: 'Log Out', icon: 'rectangle.portrait.and.arrow.right' },
];
