import { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { ThemePreference } from "@/stores/themeStore";

export const SPECIALIZATIONS = [
  'Fashion Design',
  'Tailoring',
  'Couture',
  'Bridal Wear',
  'Streetwear',
  'Menswear',
  'Womenswear',
  'Kids Fashion',
  'Formal Wear',
  'Casual Wear',
  'Traditional Wear',
  'Ready-to-Wear',
  'Activewear',
  'Accessories',
  'Shoe Making',
  'Bag Making',
  'Leather Work',
  'Embroidery',
  'Beading',
  'Fabric Painting',
  'Tie & Dye',
  'Pattern Making',
  'Garment Construction',
  'Alterations',
  'Upcycling',
];

export const PRODUCTION_TIMES = [
    '1–2 days',
    '3–5 days',
    '1 week',
    '2 weeks',
    '3–4 weeks',
    'Custom / Ask me',
];

export const MEASUREMENT_METHODS = [
    { value: 'ai', label: 'Our AI', description: 'Client uses our AI to take measurements' },
    { value: 'inperson', label: 'In-person', description: 'Client visits your location' },
    { value: 'both', label: 'Both', description: 'Either method works' },
];

export const CURRENCIES = [
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
  { code: 'KES', label: 'Kenyan Shilling (KES)' },
  { code: 'ZAR', label: 'South African Rand (R)' },

  { code: 'CAD', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'NZD', label: 'New Zealand Dollar (NZ$)' },

  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'CNY', label: 'Chinese Yuan (¥)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'AED', label: 'UAE Dirham (د.إ)' },
  { code: 'SAR', label: 'Saudi Riyal (﷼)' },
  { code: 'QAR', label: 'Qatari Riyal (﷼)' },

  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'SEK', label: 'Swedish Krona (kr)' },
  { code: 'NOK', label: 'Norwegian Krone (kr)' },
  { code: 'DKK', label: 'Danish Krone (kr)' },

  { code: 'SGD', label: 'Singapore Dollar (S$)' },
  { code: 'HKD', label: 'Hong Kong Dollar (HK$)' },
  { code: 'MYR', label: 'Malaysian Ringgit (RM)' },
  { code: 'THB', label: 'Thai Baht (฿)' },
  { code: 'IDR', label: 'Indonesian Rupiah (Rp)' },

  { code: 'BRL', label: 'Brazilian Real (R$)' },
  { code: 'MXN', label: 'Mexican Peso (MX$)' },
  { code: 'ARS', label: 'Argentine Peso (AR$)' },
  { code: 'EGP', label: 'Egyptian Pound (E£)' },
];

export const SERVICE_AREAS = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Kaduna',
    'Accra', 'Nairobi', 'London', 'New York', 'Nationwide', 'International',
];


export const UNITS = [
    { value: 'in', label: 'Inches (in)' },
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'mm', label: 'Millimeters (mm)' },
];

export const PRESET_FIELDS = [
    'Chest', 'Waist', 'Hips', 'Shoulder Width', 'Sleeve Length',
    'Inseam', 'Outseam', 'Neck', 'Upper Arm', 'Wrist',
    'Thigh', 'Knee', 'Ankle', 'Back Length', 'Front Length',
    'Bust', 'Under Bust', 'Torso', 'Rise', 'Calf',
];

export const MENU_ITEMS: DropdownMenuItem[] = [
    { id: 'save_template', label: 'Save template', icon: 'square.and.arrow.down' },
    { id: 'load_template', label: 'Load template', icon: 'square.and.arrow.up' },
    { id: 'restore_default', label: 'Restore default', icon: 'arrow.counterclockwise' },
    { id: 'help', label: 'Help', icon: 'questionmark.circle' },
];

export const THEME_OPTIONS: { label: string; value: ThemePreference; icon: string; desc: string }[] = [
  { label: 'System', value: 'system', icon: 'gearshape.fill', desc: 'Follows your device setting' },
  { label: 'Light',  value: 'light',  icon: 'sun.max.fill',  desc: 'Always light mode' },
  { label: 'Dark',   value: 'dark',   icon: 'moon.fill',     desc: 'Always dark mode' },
];