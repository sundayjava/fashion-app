import { BackButton, GlassCard } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Typography } from '@/components/ui/Typography';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Switch,
    View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

// ─── Constants ───────────────────────────────────────────────────────────────

const SECURE_KEY = 'biometric_prefs_v1';

type AuthType = LocalAuthentication.AuthenticationType;
const { FINGERPRINT, FACIAL_RECOGNITION, IRIS } = LocalAuthentication.AuthenticationType;

interface BiometricPrefs {
    [authType: number]: boolean;
}

interface BiometricInfo {
    name: string;
    description: string;
    icon: string;
}

const AUTH_TYPE_INFO: Record<number, BiometricInfo> = {
    [FINGERPRINT]: {
        name: Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint',
        description: 'Use your fingerprint to authenticate',
        icon: 'touchid',
    },
    [FACIAL_RECOGNITION]: {
        name: Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition',
        description: 'Use your face to authenticate',
        icon: 'faceid',
    },
    [IRIS]: {
        name: 'Iris Scan',
        description: 'Use iris recognition to authenticate',
        icon: 'eye.fill',
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadPrefs(): Promise<BiometricPrefs> {
    try {
        const raw = await SecureStore.getItemAsync(SECURE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

async function savePrefs(prefs: BiometricPrefs): Promise<void> {
    await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify(prefs));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Security() {
    const { colors, isDark } = useAppTheme();
    const router = useRouter();

    // Device capability state
    const [loading, setLoading] = useState(true);
    const [hasHardware, setHasHardware] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [availableTypes, setAvailableTypes] = useState<AuthType[]>([]);

    // Stored preferences per auth type
    const [prefs, setPrefs] = useState<BiometricPrefs>({});

    // Toggling lock — prevents rapid double-taps during auth prompt
    const [toggling, setToggling] = useState<number | null>(null);

    // ── Load device info + saved prefs on mount ──────────────────────────────
    const init = useCallback(async () => {
        setLoading(true);
        const [hardware, enrolled, types, savedPrefs] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
            LocalAuthentication.supportedAuthenticationTypesAsync(),
            loadPrefs(),
        ]);
        setHasHardware(hardware);
        setIsEnrolled(enrolled);
        setAvailableTypes(types);
        setPrefs(savedPrefs);
        setLoading(false);
    }, []);

    useEffect(() => {
        init();
    }, [init]);

    // ── Toggle a biometric type ───────────────────────────────────────────────
    const handleToggle = useCallback(async (authType: AuthType, currentValue: boolean) => {
        if (toggling !== null) return;
        setToggling(authType);

        const action = currentValue ? 'disable' : 'enable';
        const typeName = AUTH_TYPE_INFO[authType]?.name ?? 'Biometric';

        // Always re-authenticate before changing security settings
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: `Authenticate to ${action} ${typeName}`,
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
        });

        if (!result.success) {
            // User cancelled or auth failed — do not change the toggle
            if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
                Alert.alert(
                    'Authentication Failed',
                    'Could not verify your identity. Please try again.',
                    [{ text: 'OK' }]
                );
            }
            setToggling(null);
            return;
        }

        // Auth succeeded — update prefs
        const newPrefs: BiometricPrefs = { ...prefs, [authType]: !currentValue };
        try {
            await savePrefs(newPrefs);
            setPrefs(newPrefs);
        } catch {
            Alert.alert('Error', 'Failed to save your preference. Please try again.');
        }
        setToggling(null);
    }, [toggling, prefs]);

    // ── Derived: overall biometrics enabled (any type on) ────────────────────
    const anyEnabled = availableTypes.some((t) => prefs[t]);

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <ScreenWrapper padded>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            padded
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
            style={{ paddingVertical: Spacing.md }}
        >

            <View style={{ marginBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <BackButton onPress={() => router.back()} />
                <View />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>

                {/* ── Page header ── */}
                <View style={styles.header}>
                    <View style={[styles.headerIcon, { backgroundColor: anyEnabled ? Palette.primary + '22' : colors.surface }]}>
                        <IconSymbol
                            size={32}
                            name={anyEnabled ? ('shield.fill' as any) : ('shield' as any)}
                            color={anyEnabled ? Palette.primary : colors.textSecondary}
                        />
                    </View>
                    <Typography variant="h2" style={{ marginTop: Spacing.sm }}>
                        Biometric Security
                    </Typography>
                    <Typography variant="body" color={colors.textSecondary} style={styles.headerSubtitle}>
                        Use your biometrics to quickly and securely access your account.
                    </Typography>
                </View>

                {/* ── No hardware case ── */}
                {!hasHardware && (
                    <GlassCard style={{ marginBottom: Spacing.lg }}>
                        <View style={styles.infoRow}>
                            <IconSymbol size={22} name="exclamationmark.shield" color={colors.textSecondary} />
                            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                <Typography variant="title">Not Available</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                                    This device does not have biometric hardware.
                                </Typography>
                            </View>
                        </View>
                    </GlassCard>
                )}

                {/* ── Hardware exists but not enrolled ── */}
                {hasHardware && !isEnrolled && (
                    <GlassCard style={{ marginBottom: Spacing.lg }}>
                        <View style={styles.infoRow}>
                            <IconSymbol size={22} name="exclamationmark.shield" color={Palette.warning ?? '#f59e0b'} />
                            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                <Typography variant="title">No Biometrics Enrolled</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                                    Go to your device Settings to add a fingerprint or face to enable this feature.
                                </Typography>
                            </View>
                        </View>
                    </GlassCard>
                )}

                {/* ── Available biometric types ── */}
                {hasHardware && isEnrolled && availableTypes.length > 0 && (
                    <GlassCard style={{ marginBottom: Spacing.lg }} paddingHorizontal={Spacing.md} paddingVertical={Spacing.md}>
                        {availableTypes.map((authType, index) => {
                            const info = AUTH_TYPE_INFO[authType] ?? {
                                name: 'Biometric',
                                description: 'Authenticate with biometrics',
                                icon: 'touchid',
                            };
                            const enabled = prefs[authType] ?? false;
                            const isFirst = index === 0;
                            const isLast = index === availableTypes.length - 1;

                            return (
                                <React.Fragment key={authType}>
                                    <View style={[
                                        styles.typeRow,
                                        isFirst && { paddingTop: 0 },
                                        isLast && { paddingBottom: 0 },
                                    ]}>
                                        {/* Icon */}
                                        <View style={[
                                            styles.iconBadge,
                                            { backgroundColor: enabled ? Palette.primary + '18' : colors.surface },
                                        ]}>
                                            <IconSymbol
                                                size={22}
                                                name={info.icon as any}
                                                color={enabled ? Palette.primary : colors.icon}
                                            />
                                        </View>

                                        {/* Label */}
                                        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                            <Typography variant="title">{info.name}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                                                {info.description}
                                            </Typography>
                                        </View>

                                        {/* Toggle */}
                                        {toggling === authType ? (
                                            <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: Spacing.sm }} />
                                        ) : (
                                            <Switch
                                                value={enabled}
                                                onValueChange={() => handleToggle(authType, enabled)}
                                                trackColor={{ false: colors.border, true: Palette.primary + '80' }}
                                                thumbColor={enabled ? Palette.primary : (isDark ? '#9ca3af' : '#d1d5db')}
                                                ios_backgroundColor={colors.border}
                                            />
                                        )}
                                    </View>

                                    {!isLast && (
                                        <View style={[styles.divider, { backgroundColor: colors.border, marginHorizontal: -Spacing.md }]} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </GlassCard>
                )}

                {/* ── Info / tips card ── */}
                {hasHardware && isEnrolled && (
                    <GlassCard style={{ marginBottom: Spacing.lg }}>
                        <View style={styles.tip}>
                            <IconSymbol size={16} name={'shield' as any} color={colors.textSecondary} />
                            <Typography variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: Spacing.xs }}>
                                Your biometric data never leaves your device. We only store whether you have enabled this feature.
                            </Typography>
                        </View>
                    </GlassCard>
                )}

            </ScrollView>
        </ScreenWrapper>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingTop: Spacing.md,
    },
    headerIcon: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.full ?? 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSubtitle: {
        textAlign: 'center',
        marginTop: Spacing.xs,
        paddingHorizontal: Spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
});