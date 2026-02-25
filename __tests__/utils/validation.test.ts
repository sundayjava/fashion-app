import {
  dobSchema,
  emailSchema,
  loginSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
  usernameSchema,
} from '@/utils/validation';

// ─── Email ────────────────────────────────────────────────────────────────────
describe('emailSchema', () => {
  it('accepts a valid email', async () => {
    await expect(emailSchema.validate('hello@example.com')).resolves.toBe('hello@example.com');
  });

  it('accepts email with subdomains', async () => {
    await expect(emailSchema.validate('user@mail.co.uk')).resolves.toBeTruthy();
  });

  it('rejects missing @', async () => {
    await expect(emailSchema.validate('notanemail')).rejects.toThrow();
  });

  it('rejects missing TLD', async () => {
    await expect(emailSchema.validate('user@domain')).rejects.toThrow();
  });

  it('rejects empty string', async () => {
    await expect(emailSchema.validate('')).rejects.toThrow();
  });
});

// ─── Password ─────────────────────────────────────────────────────────────────
describe('passwordSchema', () => {
  it('accepts a strong password', async () => {
    await expect(passwordSchema.validate('Secure@123')).resolves.toBeTruthy();
  });

  it('rejects password shorter than 8 chars', async () => {
    await expect(passwordSchema.validate('Ab1!')).rejects.toThrow();
  });

  it('rejects password without uppercase', async () => {
    await expect(passwordSchema.validate('secure@123')).rejects.toThrow();
  });

  it('rejects password without number', async () => {
    await expect(passwordSchema.validate('Secure@abc')).rejects.toThrow();
  });

  it('rejects password without special character', async () => {
    await expect(passwordSchema.validate('Secure123')).rejects.toThrow();
  });
});

// ─── Name ─────────────────────────────────────────────────────────────────────
describe('nameSchema', () => {
  // nameSchema is a factory — call it to get a yup schema
  const schema = nameSchema();

  it('accepts a valid name', async () => {
    await expect(schema.validate('Sunday')).resolves.toBeTruthy();
  });

  it('rejects a single character', async () => {
    await expect(schema.validate('S')).rejects.toThrow();
  });

  it('rejects empty string', async () => {
    await expect(schema.validate('')).rejects.toThrow();
  });
});

// ─── Username ──────────────────────────────────────────────────────────────────
describe('usernameSchema', () => {
  it('accepts alphanumeric username', async () => {
    await expect(usernameSchema.validate('sunday_dev')).resolves.toBeTruthy();
  });

  it('rejects username with spaces', async () => {
    await expect(usernameSchema.validate('sunday dev')).rejects.toThrow();
  });

  it('rejects too short username', async () => {
    await expect(usernameSchema.validate('ab')).rejects.toThrow();
  });
});

// ─── Phone ────────────────────────────────────────────────────────────────────
describe('phoneSchema', () => {
  it('accepts a valid phone value', async () => {
    const value = {
      country: { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
      number: '8012345678',
      full: '+2348012345678',
    };
    await expect(phoneSchema.validate(value)).resolves.toBeTruthy();
  });

  it('rejects number with letters', async () => {
    const value = {
      country: { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
      number: '801abc5678',
      full: '+234801abc5678',
    };
    await expect(phoneSchema.validate(value)).rejects.toThrow();
  });

  it('rejects number that is too short', async () => {
    const value = {
      country: { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
      number: '123',
      full: '+234123',
    };
    await expect(phoneSchema.validate(value)).rejects.toThrow();
  });
});

// ─── DOB ──────────────────────────────────────────────────────────────────────
describe('dobSchema', () => {
  it('accepts a valid adult birthdate', async () => {
    const dob = new Date('1995-06-15');
    await expect(dobSchema.validate(dob)).resolves.toBeTruthy();
  });

  it('rejects a future date', async () => {
    const future = new Date(Date.now() + 86400000 * 365);
    await expect(dobSchema.validate(future)).rejects.toThrow();
  });

  it('rejects a date making user under 13', async () => {
    const tooYoung = new Date(Date.now() - 86400000 * 365 * 10);
    await expect(dobSchema.validate(tooYoung)).rejects.toThrow();
  });
});

// ─── Login Schema ─────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  it('accepts valid login credentials', async () => {
    await expect(
      loginSchema.validate({ emailOrPhone: 'user@test.com', password: 'Password1!' })
    ).resolves.toBeTruthy();
  });

  it('rejects invalid email in login', async () => {
    await expect(
      loginSchema.validate({ emailOrPhone: 'bademail', password: 'Password1!' })
    ).rejects.toThrow();
  });
});
