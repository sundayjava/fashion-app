import { CheckIcon } from '@/assets/icons/CheckIcon';
import { BackButton, ControlledInput, GlassButton, ScreenWrapper, Typography } from '@/components/ui';
import { Spacing } from '@/constants';
import { useAppTheme } from '@/context/ThemeContext';
import { ResetPasswordFormValues, resetPasswordSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

export const ResetPassword = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema) as any,
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');
  const oldPassword = watch('oldPassword');

  // Password validation checks
  const checks = [
    { label: 'At least 8 characters', valid: newPassword?.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(newPassword || '') },
    { label: 'One lowercase letter', valid: /[a-z]/.test(newPassword || '') },
    { label: 'One number', valid: /[0-9]/.test(newPassword || '') },
    { label: 'One special character', valid: /[^a-zA-Z0-9]/.test(newPassword || '') },
    { label: 'Passwords match', valid: !!newPassword && newPassword === confirmPassword },
  ];

  const allChecksValid = checks.every((check) => check.valid);
  const hasValue = !!oldPassword && !!newPassword && !!confirmPassword;

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      // TODO: Submit password reset to backend
      console.log('Resetting password:', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      // await api.resetPassword({
      //   oldPassword: data.oldPassword,
      //   newPassword: data.newPassword,
      // });

      // Show success message and navigate back
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call
      router.back();
    } catch (error) {
      console.error('Password reset failed:', error);
      // TODO: Show error message to user
    }
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
            <Typography variant='h3'>Reset Password</Typography>
            <View />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Typography
              variant='title'
              align='center'
              style={{
                opacity: 0.7,
                paddingHorizontal: Spacing.md,
                marginBottom: Spacing.xl
              }}
            >
              Enter your current password and create a new secure password.
            </Typography>

            <View style={{ gap: Spacing.lg }}>
              <ControlledInput
                control={control}
                name="oldPassword"
                label="Current Password"
                placeholder="••••••••"
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                returnKeyType="next"
                rightIcon={
                  <Typography variant="caption" color={colors.primary}>
                    {showOldPassword ? 'Hide' : 'Show'}
                  </Typography>
                }
                onRightIconPress={() => setShowOldPassword((v) => !v)}
              />

              <ControlledInput
                control={control}
                name="newPassword"
                label="New Password"
                placeholder="••••••••"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="next"
                rightIcon={
                  <Typography variant="caption" color={colors.primary}>
                    {showNewPassword ? 'Hide' : 'Show'}
                  </Typography>
                }
                onRightIconPress={() => setShowNewPassword((v) => !v)}
              />

              <ControlledInput
                control={control}
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="••••••••"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="done"
                rightIcon={
                  <Typography variant="caption" color={colors.primary}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Typography>
                }
                onRightIconPress={() => setShowConfirmPassword((v) => !v)}
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            </View>

            {/* Password Requirements Checklist */}
            <View style={styles.checklistContainer}>
              <Typography variant="body" weight="semiBold" color={colors.text} style={{ marginBottom: Spacing.sm }}>
                New password must contain:
              </Typography>
              {checks.map((check, index) => (
                <View key={index} style={styles.checkItem}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: check.valid ? colors.primary : colors.border,
                        backgroundColor: check.valid ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {check.valid && <CheckIcon width={14} height={14} color="#fff" />}
                  </View>
                  <Typography
                    variant="caption"
                    color={check.valid ? colors.primary : colors.textSecondary}
                    style={{ flex: 1 }}
                  >
                    {check.label}
                  </Typography>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <GlassButton
        variant="glass"
        label="Update Password"
        fullWidth
        size="md"
        onPress={handleSubmit(onSubmit)}
        disabled={!hasValue || !allChecksValid || isSubmitting}
        loading={isSubmitting}
        style={{
          marginTop: Spacing.md,
          marginBottom: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
        }}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  checklistContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});