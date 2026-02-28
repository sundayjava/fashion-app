import { BackButton, ControlledInput, GlassButton, OTPInput, ScreenWrapper, Typography, showToast } from '@/components/ui';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import * as yup from 'yup';

// ─── Validation ───────────────────────────────────────────────────────────────

const passwordStepSchema = yup.object({ password: yup.string().required('Password is required') });
const emailStepSchema = yup.object({
  newEmail: yup
    .string()
    .trim()
    .lowercase()
    .required('Email is required')
    .matches(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, 'Enter a valid email address'),
});

type PasswordForm = { password: string };
type EmailForm = { newEmail: string };
type Step = 'password' | 'email' | 'otp';

// ─── Component ────────────────────────────────────────────────────────────────

export const ChangeEmail = () => {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [step, setStep] = useState<Step>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = (seconds = 60) => {
    setResendTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Password step form ──────────────────────────────────────────────────
  const passwordForm = useForm<PasswordForm>({
    resolver: yupResolver(passwordStepSchema) as any,
    defaultValues: { password: '' },
    mode: 'onChange',
  });

  // ── Email step form ─────────────────────────────────────────────────────
  const emailForm = useForm<EmailForm>({
    resolver: yupResolver(emailStepSchema) as any,
    defaultValues: { newEmail: '' },
    mode: 'onChange',
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleVerifyPassword = async (data: PasswordForm) => {
    // TODO: call API to verify current password
    await new Promise((r) => setTimeout(r, 600)); // stub
    setStep('email');
  };

  const handleSendCode = async (data: EmailForm) => {
    // TODO: call API to send OTP to new email
    await new Promise((r) => setTimeout(r, 600)); // stub
    setTargetEmail(data.newEmail);
    setOtp('');
    setOtpError('');
    setStep('otp');
    startResendTimer(60);
  };

  const handleOtpComplete = async (code: string) => {
    setOtpError('');
    // TODO: call API to verify OTP
    await new Promise((r) => setTimeout(r, 400)); // stub
    // Simulate wrong code check — real impl would catch API error
    if (code.length < 6) {
      setOtpError('Invalid code. Please try again.');
      return;
    }
    showToast({ type: 'success', text1: 'Email updated!', text2: `Your email is now ${targetEmail}` });
    router.back();
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setOtpError('');
  };

  // ── Step labels ─────────────────────────────────────────────────────────
  const stepTitle: Record<Step, string> = {
    password: 'Verify Identity',
    email: 'New Email Address',
    otp: 'Verify Email',
  };

  const stepSubtitle: Record<Step, string> = {
    password: "Enter your current password to confirm it's you.",
    email: 'Enter the new email address for your account.',
    otp: `We sent a 6-digit code to ${targetEmail || 'your new email'}.`,
  };

  return (
    <ScreenWrapper
      padded
      keyboardAvoiding
      keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
      style={{ paddingVertical: Spacing.md }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <BackButton onPress={() => {
              if (step === 'email') { setStep('password'); }
              else if (step === 'otp') { setStep('email'); }
              else { router.back(); }
            }} />
            <Typography variant="h3">Change Email</Typography>
            <View style={{ minWidth: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* ── Step indicator ── */}
            <View style={styles.stepDots}>
              {(['password', 'email', 'otp'] as Step[]).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    { backgroundColor: step === s ? colors.primary : (
                      ['password', 'email', 'otp'].indexOf(step) > i
                        ? Palette.primary
                        : colors.border
                    )},
                  ]}
                />
              ))}
            </View>

            <Typography variant="h2" align="center" style={{ marginBottom: Spacing.xs }}>
              {stepTitle[step]}
            </Typography>
            <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginBottom: Spacing.xl }}>
              {stepSubtitle[step]}
            </Typography>

            {/* ── Step 1: Password ── */}
            {step === 'password' && (
              <View style={{ gap: Spacing.lg }}>
                <ControlledInput
                  control={passwordForm.control}
                  name="password"
                  label="Current Password"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  returnKeyType="done"
                  rightIcon={
                    <Typography variant="caption" color={colors.primary}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Typography>
                  }
                  onRightIconPress={() => setShowPassword((v) => !v)}
                  onSubmitEditing={passwordForm.handleSubmit(handleVerifyPassword)}
                />
                <GlassButton
                  variant="primary"
                  label="Continue"
                  fullWidth
                  loading={passwordForm.formState.isSubmitting}
                  disabled={!passwordForm.watch('password')}
                  onPress={passwordForm.handleSubmit(handleVerifyPassword)}
                />
              </View>
            )}

            {/* ── Step 2: New Email ── */}
            {step === 'email' && (
              <View style={{ gap: Spacing.lg }}>
                <ControlledInput
                  control={emailForm.control}
                  name="newEmail"
                  label="New Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={emailForm.handleSubmit(handleSendCode)}
                />
                <GlassButton
                  variant="primary"
                  label="Send Verification Code"
                  fullWidth
                  loading={emailForm.formState.isSubmitting}
                  disabled={!emailForm.watch('newEmail')}
                  onPress={emailForm.handleSubmit(handleSendCode)}
                />
              </View>
            )}

            {/* ── Step 3: OTP ── */}
            {step === 'otp' && (
              <View style={{ gap: Spacing.xl }}>
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOtpComplete}
                  error={!!otpError}
                />
                {otpError ? (
                  <Typography variant="caption" color={Palette.error} align="center">
                    {otpError}
                  </Typography>
                ) : null}

                {/* Change email link */}
                <Pressable onPress={handleChangeEmail} style={styles.changeLink}>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Wrong email?{' '}
                  </Typography>
                  <Typography variant="caption" color={colors.primary}>
                    Change email address
                  </Typography>
                </Pressable>

                {/* Resend */}
                <View style={styles.changeLink}>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Didn&apos;t receive a code?{' '}
                  </Typography>
                  {resendTimer > 0 ? (
                    <Typography variant="caption" color={colors.textTertiary}>
                      Resend in {resendTimer}s
                    </Typography>
                  ) : (
                    <Pressable onPress={() => { startResendTimer(60); /* TODO: call resend API */ }}>
                      <Typography variant="caption" color={colors.primary}>
                        Resend
                      </Typography>
                    </Pressable>
                  )}
                </View>

                <GlassButton
                  variant="primary"
                  label="Verify & Update Email"
                  fullWidth
                  disabled={otp.length < 6}
                  onPress={() => handleOtpComplete(otp)}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  changeLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});