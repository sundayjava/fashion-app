import { AppModal, Avatar, ConfirmModal, GlassCard } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Typography } from '@/components/ui/Typography';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { THEME_OPTIONS } from '@/data/otherdata';
import {
  accountSettingsData,
  AppearanceSettingsData,
  BusinessSettingsData,
  LogoutSettingsData,
  NotificationSettingsData,
  SettingsEntry,
  SubMenuItem,
  SupportSettingsData,
} from '@/data/settings';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

// ─── Single settings row ────────────────────────────────────────────
interface SettingRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

function SettingRow({ icon, label, sublabel, onPress, destructive = false, isFirst = false, isLast = false }: SettingRowProps) {
  const { colors } = useAppTheme();
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.row,
          isFirst && { paddingTop: 0 },
          isLast && { paddingBottom: 0 },
        ]}
        activeOpacity={0.65}
      >
        <View>
          <IconSymbol
            size={24}
            name={icon as any}
            color={destructive ? Palette.error : colors.icon}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Typography
            variant="body" size={16}
            style={destructive ? { color: Palette.error } : undefined}
          >
            {label}
          </Typography>
          {sublabel ? (
            <Typography variant="caption" color={colors.textSecondary}>
              {sublabel}
            </Typography>
          ) : null}
        </View>
        {!destructive && (
          <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
        )}
      </TouchableOpacity>
      {!isLast && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
    </>
  );
}

// ─── Main screen ────────────────────────────────────────────────────
export const Settings = () => {
  const { colors, preference, setPreference } = useAppTheme();
  const router = useRouter();

  const [submenuState, setSubmenuState] = useState<{ title: string; icon: string; items: SubMenuItem[] } | null>(null);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(
      [...(NotificationSettingsData[0].subMenuGroups ?? [])].map((item) => [item.name, true])
    )
  );

  const flipToggle = (name: string) =>
    setToggleStates((prev) => ({ ...prev, [name]: !prev[name] }));

  const openSubmenu = (entry: SettingsEntry) => {
    if (entry.subMenuGroups) {
      setSubmenuState({ title: entry.name, icon: entry.icon, items: entry.subMenuGroups });
    }
  };

  const handleSubmenuNavigate = (item: SubMenuItem) => {
    setSubmenuState(null);
    // Give the modal time to fully dismiss before navigating
    setTimeout(() => {
      if (item.externalUrl) {
        Linking.openURL(item.externalUrl);
      } else if (item.route) {
        router.push(item.route as any);
      }
    }, 300);
  };

  const handleLogout = () => {
    // TODO: clear auth state + tokens
    router.replace('/(app)/(auth)/login' as any);
  };

  // All sections flattened into rows
  const sections: { entry: SettingsEntry; key: string }[] = [
    ...accountSettingsData.map((e) => ({ entry: e, key: 'account' })),
    ...BusinessSettingsData.map((e) => ({ entry: e, key: 'business' })),
    ...NotificationSettingsData.map((e) => ({ entry: e, key: 'notifications' })),
    ...AppearanceSettingsData.map((e) => ({ entry: e, key: 'appearance' })),
    ...SupportSettingsData.map((e) => ({ entry: e, key: 'support' })),
    ...LogoutSettingsData.map((e) => ({ entry: e, key: 'logout' })),
  ];

  return (
    <ScreenWrapper
      padded
      keyboardAvoiding
      keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
      style={{ paddingVertical: Spacing.md }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Typography variant="h2" style={{ marginBottom: Spacing.md }}>
          Settings
        </Typography>

        {/* ── Profile card ── */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/profile-settings')}>
          <GlassCard style={{ marginBottom: Spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Avatar initials="FI" size="md" />
                <View>
                  <Typography variant="title">Fashionista User</Typography>
                  <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: -4 }}>
                    user@gmail.com
                  </Typography>
                </View>
              </View>
              <IconSymbol size={18} name="chevron.right" color={colors.textTertiary} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* ── First 4 settings in one card ── */}
        <GlassCard style={{ marginBottom: Spacing.lg }}>
          {sections.slice(0, 4).map(({ entry, key }, index) => {
            const isFirst = index === 0;
            const isLast = index === 3;
            const isLogout = key === 'logout';
            const isAppearance = key === 'appearance';

            return (
              <SettingRow
                key={entry.name}
                icon={entry.icon}
                label={entry.name}
                sublabel={
                  isAppearance
                    ? preference.charAt(0).toUpperCase() + preference.slice(1)
                    : undefined
                }
                onPress={
                  isLogout
                    ? () => setLogoutOpen(true)
                    : isAppearance
                    ? () => setAppearanceOpen(true)
                    : () => openSubmenu(entry)
                }
                isFirst={isFirst}
                destructive={isLogout}
                isLast={isLast}
              />
            );
          })}
        </GlassCard>


        {/* ── All settings in one card ── */}
        <GlassCard style={{ marginBottom: Spacing.lg }}>
          {sections.slice(4,5).map(({ entry, key }, index) => {
            const isFirst = true;
            const isLast = true;
            const isLogout = key === 'logout';
            const isAppearance = key === 'appearance';

            return (
              <SettingRow
                key={entry.name}
                icon={entry.icon}
                label={entry.name}
                sublabel={
                  isAppearance
                    ? preference.charAt(0).toUpperCase() + preference.slice(1)
                    : undefined
                }
                onPress={
                  isLogout
                    ? () => setLogoutOpen(true)
                    : isAppearance
                    ? () => setAppearanceOpen(true)
                    : () => openSubmenu(entry)
                }
                isFirst={isFirst}
                destructive={isLogout}
                isLast={isLast}
              />
            );
          })}
        </GlassCard>


        {/* ── All settings in one card ── */}
        <GlassCard style={{ marginBottom: Spacing.lg }}>
          {sections.slice(5).map(({ entry, key }, index) => {
            const isFirst = index === 0;
            const isLast = index === sections.slice(5).length - 1;
            const isLogout = key === 'logout';
            const isAppearance = key === 'appearance';

            return (
              <SettingRow
                key={entry.name}
                icon={entry.icon}
                label={entry.name}
                sublabel={
                  isAppearance
                    ? preference.charAt(0).toUpperCase() + preference.slice(1)
                    : undefined
                }
                onPress={
                  isLogout
                    ? () => setLogoutOpen(true)
                    : isAppearance
                    ? () => setAppearanceOpen(true)
                    : () => openSubmenu(entry)
                }
                isFirst={isFirst}
                destructive={isLogout}
                isLast={isLast}
              />
            );
          })}
        </GlassCard>

        {/* Bottom space for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── SubMenu Modal ── */}
      <AppModal
        visible={!!submenuState}
        onClose={() => setSubmenuState(null)}
        title={submenuState?.title}
        size="md"
      >
        <View>
          {submenuState?.items.map((item, i) => (
            <React.Fragment key={item.name}>
              {item.toggle ? (
                // Toggle row — no navigation, just switch
                <View style={styles.modalRow}>
                  <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <IconSymbol size={20} name={item.icon as any} color={colors.icon} />
                  </View>
                  <Typography variant="body" style={{ flex: 1 }}>
                    {item.name}
                  </Typography>
                  <Switch
                    value={toggleStates[item.name] ?? true}
                    onValueChange={() => flipToggle(item.name)}
                    
                    trackColor={{ false: colors.border, true: colors.primary + '10' }}
                                    thumbColor={Platform.OS === 'android' ? (true ? Palette.primary : '#f4f3f4') : undefined}
                  />
                </View>
              ) : (
                // Navigation row
                <TouchableOpacity
                  style={styles.modalRow}
                  onPress={() => handleSubmenuNavigate(item)}
                  activeOpacity={0.65}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <IconSymbol size={20} name={item.icon as any} color={colors.icon} />
                  </View>
                  <Typography variant="body" style={{ flex: 1 }}>
                    {item.name}
                  </Typography>
                  <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
                </TouchableOpacity>
              )}
              {i < submenuState.items.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </AppModal>

      {/* ── Appearance Modal ── */}
      <AppModal
        visible={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
        title="Appearance"
        description="Choose how Fashionistar looks"
        size="sm"
      >
        <View style={{ gap: Spacing.sm }}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = preference === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setPreference(opt.value);
                  setAppearanceOpen(false);
                }}
                activeOpacity={0.75}
                style={[
                  styles.themeOption,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '12' : colors.surface,
                  },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                  <IconSymbol
                    size={20}
                    name={opt.icon as any}
                    color={isSelected ? colors.primary : colors.icon}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Typography
                    variant="body"
                    style={isSelected ? { color: colors.primary, fontWeight: '600' } : undefined}
                  >
                    {opt.label}
                  </Typography>
                </View>
                {isSelected && (
                  <IconSymbol size={18} name="checkmark" color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </AppModal>

      {/* ── Logout Confirm ── */}
      <ConfirmModal
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Log Out"
        description="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        cancelLabel="Stay"
        destructive
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -Spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
});
