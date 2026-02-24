import {
    ControlledInput,
    Divider,
    GlassButton,
    GlassCard,
    Typography,
} from '@/components/ui';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { LoginFormValues, loginSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (_data: LoginFormValues) => {
    // TODO: call auth service with _data.email / _data.password
    await new Promise<void>((res) => setTimeout(res, 800)); // simulate request
    router.replace('/(app)/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Glow orb */}
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: Palette.primary + (isDark ? '30' : '18'),
            top: -80,
            right: -80,
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.logoMark,
              {
                backgroundColor: Palette.primary + '22',
                borderColor: Palette.primary + '55',
              },
            ]}
          >
            <Typography
              variant="h3"
              weight="bold"
              color={Palette.primary}
              align="center"
            >
              F
            </Typography>
          </View>

          <Typography variant="h2" weight="bold" color={colors.text} align="center">
            Welcome back
          </Typography>
          <Typography
            variant="body"
            color={colors.textSecondary}
            align="center"
            style={styles.subheading}
          >
            Sign in to continue to Fashionistar
          </Typography>
        </View>

        {/* Form card */}
        <GlassCard style={styles.card}>
          <ControlledInput
            control={control}
            name="email"
            label="Email"
            placeholder="you@fashionistar.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />

          <ControlledInput
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="done"
            rightIcon={
              <Typography variant="caption" color={colors.primary}>
                {showPassword ? 'Hide' : 'Show'}
              </Typography>
            }
            onRightIconPress={() => setShowPassword((v) => !v)}
          />

          {/* Forgot password */}
          <Pressable
            onPress={() => {/* TODO: navigate to forgot password screen */}}
            hitSlop={8}
            style={styles.forgotWrap}
          >
            <Typography variant="caption" color={colors.primary}>
              Forgot password?
            </Typography>
          </Pressable>

          <GlassButton
            variant="primary"
            label="Sign In"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={styles.signInBtn}
          />
        </GlassCard>

        <Divider style={styles.divider} />

        {/* Register link */}
        <View style={styles.registerRow}>
          <Typography variant="body" color={colors.textSecondary}>
            {"Don't have an account? "}
          </Typography>
          <Pressable
            onPress={() => {/* TODO: navigate to register screen */}}
            hitSlop={8}
          >
            <Typography variant="body" weight="semiBold" color={colors.primary}>
              Sign up
            </Typography>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    zIndex: 0,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  subheading: {
    marginTop: 4,
  },
  card: {
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  signInBtn: {
    marginTop: Spacing.sm,
  },
  divider: {
    marginVertical: Spacing.xl,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
