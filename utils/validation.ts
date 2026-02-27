import * as yup from 'yup';

// ─── Reusable field schemas ────────────────────────────────────────────────

export const emailSchema = yup
  .string()
  .trim()
  .lowercase()
  .required('Email is required')
  .matches(
    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    'Enter a valid email address'
  );

export const passwordSchema = yup
  .string()
  .required('Password is required')
  .min(8, 'At least 8 characters')
  .matches(/[A-Z]/, 'Must include an uppercase letter')
  .matches(/[a-z]/, 'Must include a lowercase letter')
  .matches(/[0-9]/, 'Must include a number')
  .matches(/[^a-zA-Z0-9]/, 'Must include a special character');

export const phoneSchema = yup
  .object({
    country: yup.object().required(),
    number: yup
      .string()
      .required('Phone number is required')
      .min(5, 'Phone number is too short')
      .max(15, 'Phone number is too long')
      .matches(/^\d+$/, 'Only digits allowed'),
    full: yup.string().required(),
  })
  .required('Phone number is required');

export const dobSchema = yup
  .date()
  .required('Date of birth is required')
  .max(new Date(), 'Date of birth cannot be in the future')
  .min(new Date(1900, 0, 1), 'Enter a valid date of birth')
  .test('is-adult', 'You must be at least 10 years old', (value) => {
    if (!value) return false;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 10);
    return value <= cutoff;
  });

export const nameSchema = (label = 'Name') =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be at most 50 characters`);

export const usernameSchema = yup
  .string()
  .trim()
  .required('Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .matches(
    /^[a-zA-Z0-9_.-]+$/,
    'Only letters, numbers, underscores, hyphens, and dots'
  );

// ─── Full form schemas ─────────────────────────────────────────────────────

/** Password creation form */
export const passwordCreationSchema = yup.object({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required(),
});

/** Registration form */
export const registerSchema = yup.object({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export const businessRegisterSchema = yup.object({
  businessName: yup
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : value))
    .min(2, 'Business name must be at least 2 characters')
    .max(50, 'Business name must be at most 50 characters')
    .optional(),
  firstName: nameSchema('First name'),
  lastName: nameSchema('Last name'),
  dob: dobSchema,
});

/** Email or Phone step (first registration step) */
export const emailPhoneSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : value)) // Convert empty string to undefined
    .lowercase()
    .matches(
      /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
      'Enter a valid email address'
    )
    .optional(),
  phone: phoneSchema.optional().default(undefined),
  isBusiness: yup.boolean().default(false),
});

/** Login form - Email */
export const loginEmailSchema = yup.object({
  emailOrPhone: emailSchema,
  password: yup.string().required('Password is required'),
});

/** Login form - Phone */
export const loginPhoneSchema = yup.object({
  emailOrPhone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Enter a valid phone number'),
  password: yup.string().required('Password is required'),
});

/** Legacy login schema (email only) */
export const loginSchema = loginEmailSchema;

/** Forgot password */
export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

/** Forgot password - Dynamic (Email or Phone) */
export const forgotPasswordDynamicSchema = yup.object({
  emailOrPhone: yup
    .string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Enter a valid email or phone number', function (value) {
      if (!value) return false;
      
      const firstChar = value.trim()[0];
      const startsWithNumber = /[0-9+]/.test(firstChar);
      
      // If starts with number/+, validate as phone
      if (startsWithNumber) {
        return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(value);
      }
      
      // Otherwise validate as email
      return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.toLowerCase());
    }),
});

/** Reset password (authenticated user) */
export const resetPasswordSchema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

/** Profile update */
export const profileSchema = yup.object({
  firstName: nameSchema('First name'),
  lastName: nameSchema('Last name'),
  username: usernameSchema,
  bio: yup.string().trim().max(160, 'Bio must be at most 160 characters'),
  phone: phoneSchema.optional(),
  dob: dobSchema.optional(),
});

export type EmailPhoneFormValues = yup.InferType<typeof emailPhoneSchema>;
export type BusinessRegisterFormValues = yup.InferType<typeof businessRegisterSchema>;
export type PasswordCreationFormValues = yup.InferType<typeof passwordCreationSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;
export type ForgotPasswordDynamicFormValues = yup.InferType<typeof forgotPasswordDynamicSchema>;
export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;
export type ProfileFormValues = yup.InferType<typeof profileSchema>;
