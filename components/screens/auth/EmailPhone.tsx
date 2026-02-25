import { CheckIcon } from '@/assets/icons/CheckIcon';
import { AppModal, BackButton, ControlledInput, ControlledPhone, GlassButton, Typography } from '@/components/ui';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Spacing } from '@/constants';
import { isIOS } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { EmailPhoneFormValues, emailPhoneSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, NativeModules, Platform, Pressable, TouchableWithoutFeedback, View } from 'react-native';

export const EmailPhone = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [detectedCountryCode, setDetectedCountryCode] = useState<string>('US');

  // Zustand store selectors
  const storedEmail = useRegistrationStore((state) => state.email);
  const storedPhone = useRegistrationStore((state) => state.phone);
  const setEmail = useRegistrationStore((state) => state.setEmail);
  const setPhone = useRegistrationStore((state) => state.setPhone);
  const setIsBusiness = useRegistrationStore((state) => state.setIsBusiness);
  const method = useRegistrationStore((state) => state.registrationMethod) || 'email';

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = useForm<EmailPhoneFormValues>({
    resolver: yupResolver(emailPhoneSchema) as any,
    defaultValues: {
      email: storedEmail || '',
      phone: storedPhone,
      isBusiness: false,
    },
    mode: 'onChange', // Real-time validation for better UX
  });

  // Watch form values for button state
  const emailValue = watch('email');
  const phoneValue = watch('phone');

  // Check if current field has value
  const hasValue = method === 'email'
    ? !!emailValue?.trim()
    : !!phoneValue?.full;

  useEffect(() => {
    if (method === 'phone') {
      try {
        // Get device locale using React Native's built-in capabilities
        const deviceLanguage = Platform.OS === 'ios'
          ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] // iOS 13+
          : NativeModules.I18nManager?.localeIdentifier; // Android

        if (deviceLanguage) {
          // Extract country code from locale string (e.g., 'en_US' -> 'US', 'en-NG' -> 'NG')
          const countryMatch = deviceLanguage.match(/[-_]([A-Z]{2})/);
          const countryCode = countryMatch ? countryMatch[1] : 'US';
          setDetectedCountryCode(countryCode);
        }
      } catch (error) {
        console.log('Failed to detect country:', error);
        // Keep default 'US'
      }
    }
  }, [method]);

  // Validate and show modal
  const handleContinue = async () => {
    // resetStore()
    const fieldToValidate = method === 'email' ? 'email' : 'phone';
    const isFieldValid = await trigger(fieldToValidate);

    if (isFieldValid) {
      setModalVisible(true);
    }
  };

  // Final submit after modal confirmation
  const onSubmit = (data: EmailPhoneFormValues) => {
    // Save to Zustand store
    if (method === 'email' && data.email) {
      setEmail(data.email);
    } else if (method === 'phone' && data.phone) {
      setPhone(data.phone as any); // Type cast needed due to yup inference
    }

    setIsBusiness(!!data.isBusiness);

    console.log("All details are: ", data);

    // Close modal and navigate
    setModalVisible(false);
    router.push(
      data.isBusiness ? '/business-details' : '/basic-profile'
    );
  };

  // Handle modal continue button click
  const handleModalContinue = async () => {
    // Manually trigger form submission
    await handleSubmit(onSubmit)();
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
          <View style={{ marginBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <BackButton onPress={() => router.back()} />
          </View>

          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }}>
            <Typography variant='h2'>Create Account</Typography>
            <Typography
              variant='title'
              align='center'
              style={{
                opacity: 0.7,
                paddingHorizontal: isIOS ? Spacing.md : Spacing.lg,
                marginBottom: Spacing['3xl']
              }}
            >
              Start managing your clients and showcasing your work in one place.
            </Typography>

            <View style={{ width: '100%' }} pointerEvents="box-none">
              {method === 'email' ? (
                <ControlledInput
                  control={control}
                  name="email"
                  label="Email address (OTP comes here)"
                  placeholder="jane@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              ) : (
                <ControlledPhone
                  control={control}
                  name="phone"
                  label="Phone number (OTP comes here)"
                  defaultCountryCode={detectedCountryCode}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <GlassButton
        onPress={handleContinue}
        variant="glass"
        label="Continue"
        fullWidth
        size='md'
        style={{
          borderRadius: Spacing[2],
          marginBottom: Platform.OS === 'android' ? Spacing.xl : Spacing.md
        }}
        disabled={!hasValue || isSubmitting}
      />

      <AppModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Brand Confirmation"
        footer={
          <GlassButton
            variant="glass"
            label="Continue"
            fullWidth
            onPress={handleModalContinue}
            disabled={isSubmitting}
          />
        }
      >
        <Typography variant="body" color={colors.textSecondary}>
          Please confirm whether you own a brand. This helps us customize your experience and unlock the right tools for you.
        </Typography>

        <View style={{ marginTop: Spacing.lg }}>
          <Controller
            control={control}
            name="isBusiness"
            render={({ field: { value, onChange } }) => (
              <Pressable
                onPress={() => onChange(!value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: value ? colors.primary : colors.border,
                    backgroundColor: value ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {value && <CheckIcon width={18} height={18} color='#fff' />}
                </View>
                <Typography variant="body">I confirm that I have a brand</Typography>
              </Pressable>
            )}
          />
        </View>
      </AppModal>
    </ScreenWrapper>
  );
};