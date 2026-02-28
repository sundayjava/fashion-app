import type { PhoneValue } from '@/components/ui';
import { BackButton, ControlledInput, ControlledPhone, GlassButton, OTPInput, ScreenWrapper, Typography, showToast } from '@/components/ui';
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
const phoneStepSchema = yup.object({
  phone: yup
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
    .required('Phone number is required'),
});

type PasswordForm = { password: string };
type PhoneForm = { phone: PhoneValue };
type Step = 'password' | 'phone' | 'otp';

// ─── Component ────────────────────────────────────────────────────────────────

export const ChangePhone = () => {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [step, setStep] = useState<Step>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
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

  // ── Phone step form ─────────────────────────────────────────────────────
  const phoneForm = useForm<PhoneForm>({
    resolver: yupResolver(phoneStepSchema) as any,
    mode: 'onChange',
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleVerifyPassword = async (data: PasswordForm) => {
    // TODO: verify password against backend
    await new Promise((r) => setTimeout(r, 600));
    setStep('phone');
  };

  const handleSendCode = async (data: PhoneForm) => {
    // TODO: send OTP to new phone number
    await new Promise((r) => setTimeout(r, 600));
    setTargetPhone(data.phone.full);
    setOtp('');
    setOtpError('');
    setStep('otp');
    startResendTimer(60);
  };

  const handleOtpComplete = async (code: string) => {
    setOtpError('');
    // TODO: verify OTP with backend
    await new Promise((r) => setTimeout(r, 400));
    if (code.length < 6) {
      setOtpError('Invalid code. Please try again.');
      return;
    }
    showToast({ type: 'success', text1: 'Phone updated!', text2: `Your phone is now ${targetPhone}` });
    router.back();
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtp('');
    setOtpError('');
  };

  // ── Step labels ─────────────────────────────────────────────────────────
  const stepTitle: Record<Step, string> = {
    password: 'Verify Identity',
    phone: 'New Phone Number',
    otp: 'Verify Phone',
  };

  const stepSubtitle: Record<Step, string> = {
    password: "Enter your current password to confirm it's you.",
    phone: 'Enter the new phone number for your account.',
    otp: `We sent a 6-digit code to ${targetPhone || 'your new number'}.`,
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
            <BackButton
              onPress={() => {
                if (step === 'phone') setStep('password');
                else if (step === 'otp') setStep('phone');
                else router.back();
              }}
            />
            <Typography variant="h3">Change Phone</Typography>
            <View style={{ minWidth: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* ── Step indicator ── */}
            <View style={styles.stepDots}>
              {(['password', 'phone', 'otp'] as Step[]).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        step === s
                          ? colors.primary
                          : (['password', 'phone', 'otp'] as Step[]).indexOf(step) > i
                          ? Palette.primary
                          : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            <Typography variant="h2" align="center" style={{ marginBottom: Spacing.xs }}>
              {stepTitle[step]}
            </Typography>
            <Typography
              variant="body"
              color={colors.textSecondary}
              align="center"
              style={{ marginBottom: Spacing.xl }}
            >
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

            {/* ── Step 2: New Phone ── */}
            {step === 'phone' && (
              <View style={{ gap: Spacing.lg }}>
                <ControlledPhone
                  control={phoneForm.control}
                  name="phone"
                  label="New Phone Number"
                />
                <GlassButton
                  variant="primary"
                  label="Send Verification Code"
                  fullWidth
                  loading={phoneForm.formState.isSubmitting}
                  disabled={!phoneForm.watch('phone')?.full}
                  onPress={phoneForm.handleSubmit(handleSendCode)}
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

                {/* Change phone link */}
                <Pressable onPress={handleChangePhone} style={styles.changeLink}>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Wrong number?{' '}
                  </Typography>
                  <Typography variant="caption" color={colors.primary}>
                    Change phone number
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
                  label="Verify & Update Phone"
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