import {
  ControlledDOB,
  ControlledInput,
  ControlledPhone,
  Divider,
  GlassButton,
  GlassCard,
  showToast,
  Typography,
} from '@/components/ui';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { RegisterFormValues, registerSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FormDemoScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched', // validate as user leaves each field
  });

  const onSubmit = async (data: RegisterFormValues) => {
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1200));
    showToast({
      type: 'success',
      text1: 'Account created!',
      text2: `Welcome, ${data.firstName}`,
    });
    router.back();
  };

  return (
    <ScrollView 
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <GlassButton
          variant="ghost"
          label="← Back"
          size="sm"
          onPress={() => router.back()}
        />
      </View>

      <Typography variant="overline" color={colors.textTertiary}>
        Registration Demo
      </Typography>
      <Typography variant="h2" style={{ marginBottom: 4 }}>
        Create Account
      </Typography>
      <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: Spacing.xl }}>
        All fields use Yup validation + react-hook-form.
      </Typography>

      <GlassCard style={{ gap: Spacing.md }}>
        {/* Name row */}
        <View style={styles.row}>
          <ControlledInput
            control={control}
            name="firstName"
            label="First name"
            placeholder="Jane"
            containerStyle={{ flex: 1 }}
            autoCapitalize="words"
          />
          <ControlledInput
            control={control}
            name="lastName"
            label="Last name"
            placeholder="Doe"
            containerStyle={{ flex: 1 }}
            autoCapitalize="words"
          />
        </View>

        <ControlledInput
          control={control}
          name="username"
          label="Username"
          placeholder="jane.doe"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Divider label="contact" />

        <ControlledInput
          control={control}
          name="email"
          label="Email address"
          placeholder="jane@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <ControlledPhone
          control={control}
          name="phone"
          label="Phone number"
          defaultCountryCode="NG"
        />

        <ControlledDOB
          control={control}
          name="dob"
          label="Date of birth"
          hint="Must be at least 13 years old"
        />

        <Divider label="security" />

        <ControlledInput
          control={control}
          name="password"
          label="Password"
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          hint="Min 8 chars, uppercase, number, special char"
          rightIcon={
            <Typography variant="caption" color={colors.primary}>
              {showPassword ? 'Hide' : 'Show'}
            </Typography>
          }
          onRightIconPress={() => setShowPassword((v) => !v)}
        />

        <ControlledInput
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="••••••••"
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          rightIcon={
            <Typography variant="caption" color={colors.primary}>
              {showConfirm ? 'Hide' : 'Show'}
            </Typography>
          }
          onRightIconPress={() => setShowConfirm((v) => !v)}
        />

        <GlassButton
          variant="primary"
          label="Create Account"
          fullWidth
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: Spacing.sm }}
        />
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
