import {
  AppBottomSheet,
  AppInput,
  AppModal,
  Avatar,
  Badge,
  ConfirmModal,
  Divider,
  GlassButton,
  GlassCard,
  showToast,
  Typography,
} from '@/components/ui';
import { appName } from '@/constants/settings';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Bottom Sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" color={colors.textTertiary}>
            {appName}
          </Typography>
          <Typography variant="h2">Design System</Typography>
        </View>
        <Avatar initials="FI" size="md" />
      </View>

      <Divider style={{ marginVertical: Spacing.lg }} />

      {/* Typography */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Typography
      </Typography>
      <GlassCard style={{ marginBottom: Spacing.lg }}>
        {(['display', 'h1', 'h2', 'h3', 'h4', 'title', 'subtitle', 'body', 'caption', 'overline', 'label'] as const).map(
          (v) => (
            <Typography key={v} variant={v} style={{ marginBottom: 4 }}>
              {v} — Reddit Sans
            </Typography>
          )
        )}
      </GlassCard>

      {/* Badges */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Badges
      </Typography>
      <View style={[styles.row, { flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg }]}>
        {(['primary', 'accent', 'success', 'warning', 'error', 'neutral'] as const).map((v) => (
          <Badge key={v} label={v} variant={v} />
        ))}
      </View>

      {/* Buttons */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Buttons
      </Typography>
      <View style={{ gap: Spacing.sm, marginBottom: Spacing.lg }}>
        <GlassButton variant="glass" label="Glass Button" fullWidth />
        <GlassButton variant="primary" label="Primary Button" fullWidth />
        <GlassButton variant="accent" label="Accent Button" fullWidth />
        <GlassButton variant="outline" label="Outline Button" fullWidth />
        <GlassButton variant="ghost" label="Ghost Button" fullWidth />
        <View style={styles.row}>
          <GlassButton variant="primary" label="Small" size="sm" style={{ flex: 1 }} />
          <GlassButton variant="primary" label="Medium" size="md" style={{ flex: 1 }} />
          <GlassButton variant="primary" label="Large" size="lg" style={{ flex: 1 }} />
        </View>
        <GlassButton variant="primary" label="Loading…" loading fullWidth />
        <GlassButton variant="primary" label="Disabled" disabled fullWidth />
      </View>

      {/* Inputs */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Inputs
      </Typography>
      <View style={{ gap: Spacing.md, marginBottom: Spacing.lg }}>
        <AppInput label="Email" placeholder="you@fashionistar.com" keyboardType="email-address" />
        <AppInput label="Password" placeholder="••••••••" secureTextEntry />
        <AppInput
          label="Search"
          placeholder="Search styles…"
          hint="Try searching for 'minimal'"
        />
        <AppInput
          label="With error"
          placeholder="Invalid field"
          error="This field is required"
          defaultValue="bad value"
        />
      </View>

      {/* Avatars */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Avatars
      </Typography>
      <View style={[styles.row, { marginBottom: Spacing.lg }]}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Avatar key={s} initials={s} size={s} />
        ))}
      </View>

      {/* Cards */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Cards
      </Typography>
      <View style={{ gap: Spacing.md, marginBottom: Spacing.lg }}>
        <GlassCard blur>
          <Typography variant="title">Blur Glass Card</Typography>
          <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
            Uses expo-blur for a real frosted glass effect.
          </Typography>
        </GlassCard>
        <GlassCard blur={false}>
          <Typography variant="title">Solid Glass Card</Typography>
          <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
            Uses rgba background with glass border.
          </Typography>
        </GlassCard>
      </View>

      <Divider label="overlays" style={{ marginBottom: Spacing.lg }} />

      {/* Interactive */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Overlays & Feedback
      </Typography>
      <View style={{ gap: Spacing.sm, marginBottom: Spacing.lg }}>
        <GlassButton
          variant="primary"
          label="Open Bottom Sheet"
          fullWidth
          onPress={() => bottomSheetRef.current?.expand()}
        />
        <GlassButton
          variant="accent"
          label="Open Modal"
          fullWidth
          onPress={() => setModalVisible(true)}
        />
        <GlassButton
          variant="outline"
          label="Open Confirm Dialog"
          fullWidth
          onPress={() => setConfirmVisible(true)}
        />
        <View style={styles.row}>
          <GlassButton
            variant="glass"
            label="Toast Success"
            size="sm"
            style={{ flex: 1 }}
            onPress={() =>
              showToast({ type: 'success', text1: 'Done!', text2: 'Action completed.' })
            }
          />
          <GlassButton
            variant="glass"
            label="Toast Error"
            size="sm"
            style={{ flex: 1 }}
            onPress={() =>
              showToast({ type: 'error', text1: 'Oops!', text2: 'Something went wrong.' })
            }
          />
        </View>
        <View style={styles.row}>
          <GlassButton
            variant="glass"
            label="Toast Info"
            size="sm"
            style={{ flex: 1 }}
            onPress={() =>
              showToast({ type: 'info', text1: 'FYI', text2: 'Just so you know!' })
            }
          />
          <GlassButton
            variant="glass"
            label="Open Modal Screen"
            size="sm"
            style={{ flex: 1 }}
            onPress={() => router.push('/modal')}
          />
        </View>
        <GlassButton
          variant="primary"
          label="Open Registration Form Demo →"
          fullWidth
          onPress={() => router.push('/form-demo')}
        />
      </View>

      {/* Bottom Sheet */}
      <AppBottomSheet
        ref={bottomSheetRef}
        snapPoints={['45%', '80%']}
        title="Bottom Sheet"
        scrollable
      >
        <Typography variant="body" color={colors.textSecondary}>
          This is a gorhom/bottom-sheet with glass background, custom handle, and backdrop.
        </Typography>
        <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
          <AppInput label="Name" placeholder="Your name" />
          <GlassButton
            variant="primary"
            label="Submit"
            fullWidth
            onPress={() => {
              bottomSheetRef.current?.close();
              showToast({ type: 'success', text1: 'Submitted!' });
            }}
          />
        </View>
      </AppBottomSheet>

      {/* Modal */}
      <AppModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="App Modal"
        description="A styled modal with blurred backdrop."
        footer={
          <GlassButton
            variant="primary"
            label="Got it"
            fullWidth
            onPress={() => setModalVisible(false)}
          />
        }
      >
        <Typography variant="body" color={colors.textSecondary}>
          {'This uses React Native\'s built-in Modal with a custom styled wrapper and BlurView backdrop. Works on iOS, Android, and Web.'}
        </Typography>
      </AppModal>

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => showToast({ type: 'success', text1: 'Confirmed!' })}
        title="Are you sure?"
        description="This action cannot be undone."
        confirmLabel="Yes, proceed"
        cancelLabel="Cancel"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
