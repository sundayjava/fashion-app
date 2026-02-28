import { BackButton, ControlledInput, GlassButton, GlassCard, ScreenWrapper, Typography, showToast } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as yup from 'yup';

// ─── Validation ───────────────────────────────────────────────────────────────

const confirmSchema = yup.object({
  confirmText: yup
    .string()
    .required('Please type DELETE to confirm')
    .test('is-delete', 'You must type DELETE exactly', (v) => v === 'DELETE'),
  password: yup.string().required('Password is required'),
});

type ConfirmForm = { confirmText: string; password: string };
type Step = 'warning' | 'confirm';

// ─── Consequence items ─────────────────────────────────────────────────────

const CONSEQUENCES = [
  { icon: 'person.fill', label: 'Your profile and account info will be permanently removed' },
  { icon: 'briefcase', label: 'All your business listings and portfolio will be deleted' },
  { icon: 'bag', label: 'Active orders may be cancelled and cannot be recovered' },
  { icon: 'creditcard', label: 'Any pending payouts may be forfeited' },
  { icon: 'bell', label: 'All notifications and activity history will be erased' },
  { icon: 'doc.text', label: 'This action is irreversible and cannot be undone' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const DeleteAccount = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [step, setStep] = useState<Step>('warning');
  const [showPassword, setShowPassword] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const form = useForm<ConfirmForm>({
    resolver: yupResolver(confirmSchema) as any,
    defaultValues: { confirmText: '', password: '' },
    mode: 'onChange',
  });

  const confirmText = form.watch('confirmText');
  const password = form.watch('password');
  const isReadyToDelete = confirmText === 'DELETE' && password.length > 0;

  // ── Download data handler ─────────────────────────────────────────────
  const handleDownloadData = async () => {
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 1200)); // stub
    setDownloading(false);
    showToast({
      type: 'success',
      text1: 'Data export requested',
      text2: 'You will receive a download link via email within 24 hours.',
    });
  };

  // ── Final delete handler ──────────────────────────────────────────────
  const handleDelete = async (data: ConfirmForm) => {
    Alert.alert(
      'Delete Account',
      'This is your final chance. Are you absolutely sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: call API to delete account + clear auth
              await new Promise((r) => setTimeout(r, 1000));
              showToast({ type: 'success', text1: 'Account deleted', text2: "We're sorry to see you go." });
              router.replace('/(app)/(auth)/login' as any);
            } catch {
              showToast({ type: 'error', text1: 'Failed', text2: 'Could not delete account. Try again.' });
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper
      padded
      keyboardAvoiding
      keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
      style={{ paddingVertical: Spacing.md }}
    >
      <View style={{ flex: 1 }}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <BackButton
              onPress={() => {
                if (step === 'confirm') setStep('warning');
                else router.back();
              }}
            />
            <Typography variant="h3">Delete Account</Typography>
            <View style={{ minWidth: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            contentContainerStyle={{ paddingBottom: 100 }}
          >

            {/* ── Step 1: Warning ── */}
            {step === 'warning' && (
              <View style={{ gap: Spacing.lg }}>
                {/* Big warning icon */}
                <View style={styles.warningHero}>
                  <View style={[styles.warningIconBg, { backgroundColor: Palette.error + '18' }]}>
                    <IconSymbol size={40} name={'trash' as any} color={Palette.error} />
                  </View>
                  <Typography variant="h2" align="center" style={{ marginTop: Spacing.md, color: Palette.error }}>
                    This is irreversible
                  </Typography>
                  <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginTop: Spacing.xs }}>
                    Deleting your account will permanently erase all your data. Please read carefully before continuing.
                  </Typography>
                </View>

                {/* Consequences card */}
                <GlassCard paddingVertical={Spacing.md}>
                  {CONSEQUENCES.map((item, index) => (
                    <View key={index} style={[
                      styles.consequenceRow,
                      index === 0 && { paddingTop: 0 },
                      index === CONSEQUENCES.length - 1 && { paddingBottom: 0 },
                    ]}>
                      <View style={[styles.consequenceIcon, { backgroundColor: Palette.error + '18' }]}>
                        <IconSymbol size={16} name={item.icon as any} color={Palette.error} />
                      </View>
                      <Typography variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: Spacing.sm }}>
                        {item.label}
                      </Typography>
                    </View>
                  ))}
                </GlassCard>

                {/* Download data */}
                <GlassCard>
                  <Pressable
                    onPress={handleDownloadData}
                    style={({ pressed }) => [styles.downloadRow, pressed && { opacity: 0.7 }]}
                  >
                    <View style={[styles.downloadIcon, { backgroundColor: colors.primary + '18' }]}>
                      <IconSymbol size={20} name={'doc.text' as any} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Typography variant="title">Download your data</Typography>
                      <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                        Get a copy of your profile, orders, and activity before you go.
                      </Typography>
                    </View>
                    {downloading ? (
                      <Typography variant="caption" color={colors.primary}>Requesting…</Typography>
                    ) : (
                      <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
                    )}
                  </Pressable>
                </GlassCard>

                {/* Proceed button */}
                <GlassButton
                  variant="glass"
                  label="I understand, proceed"
                  fullWidth
                  onPress={() => setStep('confirm')}
                  style={{ borderColor: Palette.error }}
                />
              </View>
            )}

            {/* ── Step 2: Confirm ── */}
            {step === 'confirm' && (
              <View style={{ gap: Spacing.lg }}>
                {/* Reminder banner */}
                <View style={[styles.reminderBanner, { backgroundColor: Palette.error + '12', borderColor: Palette.error + '30' }]}>
                  <IconSymbol size={16} name={'trash' as any} color={Palette.error} />
                  <Typography variant="caption" color={Palette.error} style={{ flex: 1, marginLeft: Spacing.xs }}>
                    This action cannot be undone. Your account and all data will be permanently deleted.
                  </Typography>
                </View>

                {/* Type DELETE */}
                <View style={{ gap: Spacing.xs }}>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Type <Typography variant="caption" style={{ fontWeight: '700', color: Palette.error }}>DELETE</Typography> to confirm
                  </Typography>
                  <ControlledInput
                    control={form.control}
                    name="confirmText"
                    placeholder="DELETE"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>

                {/* Password */}
                <ControlledInput
                  control={form.control}
                  name="password"
                  label="Enter your password"
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
                  onSubmitEditing={isReadyToDelete ? form.handleSubmit(handleDelete) : undefined}
                />

                {/* Delete button */}
                <GlassButton
                  variant="primary"
                  label="Permanently Delete Account"
                  fullWidth
                  loading={form.formState.isSubmitting}
                  disabled={!isReadyToDelete}
                  onPress={form.handleSubmit(handleDelete)}
                  style={{ backgroundColor: isReadyToDelete ? Palette.error : undefined }}
                />

                <Typography variant="caption" color={colors.textTertiary} align="center">
                  You won&apos;t be able to recover your account after deletion.
                </Typography>
              </View>
            )}
          </ScrollView>
      </View>
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
  warningHero: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  warningIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  consequenceIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
});