import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography, GlassButton, GlassCard } from '@/components/ui';
import { Spacing } from '@/constants/spacing';

export default function ModalScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.md,
        },
      ]}
    >
      <GlassCard style={styles.card}>
        <Typography variant="h3" align="center">
          Modal Screen
        </Typography>
        <Typography
          variant="body"
          color={colors.textSecondary}
          align="center"
          style={{ marginTop: Spacing.sm }}
        >
          This is a glass-style modal built with the Fashionistar design system.
        </Typography>
        <GlassButton
          variant="primary"
          label="Close Modal"
          onPress={() => router.back()}
          fullWidth
          style={{ marginTop: Spacing.lg }}
        />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    padding: Spacing.xl,
  },
});
