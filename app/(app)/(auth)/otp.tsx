import { BackButton, GlassButton, ScreenWrapper, Typography } from '@/components/ui';
import { OTPInput } from '@/components/ui/OTPInput';
import { isIOS } from '@/constants/spacing';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; 

const Otp = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const regMethod = useRegistrationStore((state) => state.registrationMethod);
  const storedEmail = useRegistrationStore((state) => state.email);
  const storedPhone = useRegistrationStore((state) => state.phone);

  // Fallback to store values if params are missing (e.g., on app reload)
  const contact = regMethod === 'email' ? storedEmail : storedPhone?.number;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOTPComplete = async (code: string) => {
    setError('');
    setIsVerifying(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace({ pathname: '/password' }); // Navigate to main app on success
    } catch (_) {
      setError('Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    setCanResend(false);
    setTimer(RESEND_TIMEOUT);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      console.log('Resending OTP to:', contact);

      // Show success feedback
      setError(''); // Could show success message instead
    } catch (_) {
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskContact = (contact?: string) => {
    if (!contact) return '';
    if (regMethod === 'email') {
      const [local, domain] = contact.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }
    // Phone
    return `***${contact.slice(-4)}`;
  };

  return (
    <ScreenWrapper
      padded
      keyboardAvoiding
      keyboardVerticalOffset={isIOS ? 10 : 20}
      style={{ paddingVertical: Spacing.md }}
    >
      <View style={{ flex: 1 }}>

        <View style={{ marginBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton onPress={() => router.back()} />
          <Typography variant='h3'>Verify Your {regMethod === 'email' ? 'Email' : 'Phone'}</Typography>
          <View />
        </View>

        <View style={styles.content}>

          <Typography
            variant='title'
            align='center'
            style={{
              opacity: 0.7,
              paddingHorizontal: isIOS ? Spacing.md : Spacing.lg,
              marginBottom: Spacing['2xl']
            }}
          >
            We&apos;ve sent a verification code to{" "}
            <Typography variant="body" weight="semiBold" color={colors.text}>
              {maskContact(contact)}
            </Typography>
          </Typography>

          {/* OTP Input */}
            <OTPInput
              length={OTP_LENGTH}
              value={otp}
              onChange={setOtp}
              onComplete={handleOTPComplete}
              disabled={isVerifying}
              error={!!error}
            />

          {/* Error Message */}
          {error && (
            <Typography variant="caption" color={colors.error} align="center">
              {error}
            </Typography>
          )}

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            <Typography variant="body" color={colors.textSecondary}>
              Didn&apos;t receive the code?
            </Typography>
            <Pressable onPress={handleResend} disabled={!canResend}>
              <Typography
                variant="body"
                weight="semiBold"
                color={canResend ? colors.primary : colors.textSecondary}
              >
                {canResend ? 'Resend Code' : `Resend in ${formatTime(timer)}`}
              </Typography>
            </Pressable>
          </View>

          <View style={{ width: '100%', marginTop: Spacing.lg }}>
            <GlassButton
              variant="glass"
              label={isVerifying ? 'Verifying...' : 'Verify'}
              fullWidth
              loading={isVerifying}
              onPress={() => handleOTPComplete(otp)}
              disabled={otp.length !== OTP_LENGTH || isVerifying}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  resendContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  button: {
    marginBottom: isIOS ? Spacing.md : Spacing.xl,
  },
});

export default Otp;
