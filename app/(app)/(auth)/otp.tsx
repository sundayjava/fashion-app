import { AppModal, BackButton, ControlledInput, GlassButton, ScreenWrapper, Typography } from '@/components/ui';
import { OTPInput } from '@/components/ui/OTPInput';
import { isIOS } from '@/constants/spacing';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { formatTime, maskContact } from '@/utils/helpers';
import { ForgotPasswordDynamicFormValues, forgotPasswordDynamicSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; 

const Otp = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const regMethod = useRegistrationStore((state) => state.registrationMethod);
  const storedEmail = useRegistrationStore((state) => state.email);
  const storedPhone = useRegistrationStore((state) => state.phone);
  const setEmail = useRegistrationStore((state) => state.setEmail);
  const setPhone = useRegistrationStore((state) => state.setPhone);
  
  const { method, value, flow } = useLocalSearchParams<{ 
    method?: 'email' | 'phone'; 
    value?: string;
    flow?: 'signup' | 'forgot-password';
  }>();

  // ===== DUAL FLOW HANDLING =====
  // This screen handles both signup and forgot-password flows:
  // 
  // SIGNUP FLOW:
  //   - Contact comes from registration store (storedEmail/storedPhone)
  //   - Updates persist in store for subsequent screens
  //   - After OTP: goes to Password screen (signup)
  //
  // FORGOT PASSWORD FLOW:
  //   - Contact comes from route params (value)
  //   - Updates tracked locally and passed via route params
  //   - After OTP: goes to Password screen (forgot-password) with contact info

  // Determine the flow type
  const isSignupFlow = flow === 'signup' || (!flow && (storedEmail || storedPhone));
  const isForgotPasswordFlow = flow === 'forgot-password';

  // Get contact and method based on flow
  const contactMethod = method || regMethod;
  const contactValue = isSignupFlow 
    ? (regMethod === 'email' ? storedEmail : storedPhone?.number)
    : value;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedContact, setUpdatedContact] = useState(contactValue || '');
  const [updateMethod, setUpdateMethod] = useState<'email' | 'phone'>(contactMethod || 'email');

  // Form for updating contact
  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    formState: { isSubmitting: isUpdating },
  } = useForm<ForgotPasswordDynamicFormValues>({
    resolver: yupResolver(forgotPasswordDynamicSchema),
    defaultValues: { emailOrPhone: contactValue || '' },
    mode: 'onTouched',
  });

  const emailOrPhone = watch('emailOrPhone');

  // Sync updatedContact with store changes in signup flow
  useEffect(() => {
    if (isSignupFlow) {
      const currentContact = regMethod === 'email' ? storedEmail : storedPhone?.number;
      if (currentContact && currentContact !== updatedContact) {
        setUpdatedContact(currentContact);
      }
    }
  }, [storedEmail, storedPhone, regMethod, isSignupFlow, updatedContact]);

  // Auto-detect method for modal input
  useEffect(() => {
    if (!emailOrPhone || emailOrPhone.length === 0) {
      setUpdateMethod('email');
      return;
    }

    const firstChar = emailOrPhone.trim()[0];
    const isPhoneStart = /[0-9+]/.test(firstChar);
    const isEmailStart = /[a-zA-Z]/.test(firstChar);

    if (isPhoneStart) {
      setUpdateMethod('phone');
      clearErrors('emailOrPhone');
    } else if (isEmailStart) {
      setUpdateMethod('email');
      clearErrors('emailOrPhone');
    }
  }, [emailOrPhone, clearErrors]);

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
      
      // Navigate based on flow type
      if (isSignupFlow) {
        // Continue with signup flow - go to password creation
        router.replace({ pathname: '/password', params: { flow: 'signup' } });
      } else if (isForgotPasswordFlow) {
        // Go to password screen with forgot-password context
        // Pass the updated contact (in case user changed it)
        router.replace({ 
          pathname: '/password',
          params: { 
            flow: 'forgot-password',
            method: updateMethod, // Use the current method
            value: updatedContact, // Use the updated contact
            verified: 'true'
          }
        });
      }
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
      // For signup: use updated contact from store or updatedContact state
      // For forgot-password: use updatedContact state
      const contactToResend = isSignupFlow
        ? (updateMethod === 'email' ? (storedEmail || updatedContact) : (storedPhone?.number || updatedContact))
        : updatedContact;
        
      console.log('Resending OTP to:', contactToResend, 'Flow:', flow || 'signup');

      // Show success feedback
      setError(''); // Could show success message instead
    } catch (_) {
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  const handleUpdateContact = async (data: ForgotPasswordDynamicFormValues) => {
    try {
      // TODO: Call API to update contact and resend OTP
      console.log('Updating contact to:', data.emailOrPhone, 'Method:', updateMethod, 'Flow:', flow || 'signup');
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // ===== FLOW-SPECIFIC HANDLING =====
      if (isSignupFlow) {
        // SIGNUP FLOW: Update registration store so the new contact persists through the flow
        // This ensures the updated contact is available in subsequent screens (Password, etc.)
        if (updateMethod === 'email') {
          setEmail(data.emailOrPhone);
          console.log('✓ Updated email in registration store');
        } else {
          // For phone, we'd need to parse it properly with country code
          // For now, just log that phone update is needed
          console.log('⚠ Phone update in signup flow - needs proper phone parsing with country code');
        }
      } else if (isForgotPasswordFlow) {
        // FORGOT PASSWORD FLOW: Just track locally
        // The updated contact will be passed via route params when navigating to password screen
        console.log('✓ Updated contact for forgot-password flow (tracked locally)');
      }
      
      // Update local state (for both flows)
      setUpdatedContact(data.emailOrPhone);
      setModalVisible(false);
      
      // Auto-resend OTP to new contact
      setCanResend(false);
      setTimer(RESEND_TIMEOUT);
      setOtp('');
      setError('');
      
      // Show success feedback
      console.log('✓ OTP sent to new contact:', data.emailOrPhone);
    } catch (error) {
      console.error('❌ Failed to update contact:', error);
      setError('Failed to update contact. Please try again.');
    }
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
          <Typography variant='h3'>
            Verify Your {contactMethod === 'email' ? 'Email' : 'Phone'}
          </Typography>
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
              {maskContact(updatedContact, contactMethod)}
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
            
            {/* Update Contact Button */}
            <Pressable onPress={() => setModalVisible(true)} style={{ marginTop: Spacing.sm }}>
              <Typography
                variant="caption"
                weight="semiBold"
                color={colors.primary}
                style={{ textDecorationLine: 'underline' }}
              >
                Update {contactMethod === 'email' ? 'Email' : 'Phone Number'}
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

      {/* Update Contact Modal */}
      <AppModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={`Update ${contactMethod === 'email' ? 'Email' : 'Phone Number'}`}
        footer={
          <GlassButton
            variant="glass"
            label="Send OTP"
            fullWidth
            onPress={handleSubmit(handleUpdateContact)}
            disabled={isUpdating}
            loading={isUpdating}
          />
        }
      >
        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: Spacing.lg }}>
          {isSignupFlow 
            ? `Update your ${contactMethod === 'email' ? 'email address' : 'phone number'} and we'll send a new verification code.`
            : `Enter a new ${contactMethod === 'email' ? 'email address' : 'phone number'} to receive your verification code.`
          }
        </Typography>

        <ControlledInput
          control={control}
          name="emailOrPhone"
          label={updateMethod === 'email' ? 'Email Address' : 'Phone Number'}
          placeholder={updateMethod === 'email' ? 'you@fashionistar.com' : '+1 234 567 8900'}
          keyboardType={updateMethod === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
          autoComplete={updateMethod === 'email' ? 'email' : 'tel'}
          returnKeyType="done"
        />
      </AppModal>
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
