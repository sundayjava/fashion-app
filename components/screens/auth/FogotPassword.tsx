import { BackButton, ControlledInput, GlassButton, Logo, ScreenWrapper, Typography } from '@/components/ui'
import { Spacing } from '@/constants'
import { useAppTheme } from '@/context/ThemeContext'
import { ForgotPasswordDynamicFormValues, forgotPasswordDynamicSchema } from '@/utils/validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Keyboard, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

export const FogotPassword = () => {
  const { colors } = useAppTheme();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordDynamicFormValues>({
    resolver: yupResolver(forgotPasswordDynamicSchema),
    defaultValues: { emailOrPhone: '' },
    mode: 'onTouched',
  });

  const emailOrPhone = watch('emailOrPhone');

  const hasValue = !!emailOrPhone?.trim();

  // Auto-detect auth method based on first character
  useEffect(() => {
    if (!emailOrPhone || emailOrPhone.length === 0) {
      // Reset to email when input is cleared
      if (authMethod === 'phone') {
        setAuthMethod('email');
        clearErrors('emailOrPhone');
      }
      return;
    }

    const firstChar = emailOrPhone.trim()[0];
    const isPhoneStart = /[0-9+]/.test(firstChar);
    const isEmailStart = /[a-zA-Z]/.test(firstChar);

    if (isPhoneStart && authMethod === 'email') {
      setAuthMethod('phone');
      clearErrors('emailOrPhone');
    } else if (isEmailStart && authMethod === 'phone') {
      setAuthMethod('email');
      clearErrors('emailOrPhone');
    }
  }, [emailOrPhone, authMethod, clearErrors]);

  const onSubmit = async (data: ForgotPasswordDynamicFormValues) => {
    console.log('Form data:', data);
    await new Promise<void>((res) => setTimeout(res, 800)); // simulate request
    router.push({ 
      pathname: '/otp', 
      params: { 
        flow: 'forgot-password',
        method: authMethod,
        value: data.emailOrPhone
      } 
    }); 
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
          <View style={{ marginBottom: Spacing['3xl'], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <BackButton onPress={() => router.back()} />
          </View>
          <View style={styles.header}>

            <Logo />

            <Typography variant="h2" weight="bold" color={colors.text} align="center" style={{ width: '100%' }}>
              Forgot Password
            </Typography>
            <Typography variant="body" color={colors.textSecondary} align="center">
              Please enter the email or phone number associated with your account and we&apos;ll send an OTP
            </Typography>
          </View>

          <ControlledInput
            control={control}
            name="emailOrPhone"
            label={'Email or phone'}
            placeholder={'Enter your email or phone number'}
            keyboardType={authMethod === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            autoComplete={authMethod === 'email' ? 'email' : 'tel'}
            returnKeyType="next"
          />
        </View>
      </TouchableWithoutFeedback>
      <View>
        <GlassButton
        variant="glass"
        label="Send OTP"
        fullWidth
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={styles.signInBtn}
        disabled={!hasValue || isSubmitting}
      />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    width: '100%'
  },
  signInBtn: {
    marginVertical: Spacing.sm,
  },
})