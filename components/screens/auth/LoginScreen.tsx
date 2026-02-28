import { BackButton, ControlledInput, GlassButton, GlassCard, Logo, ScreenWrapper, Typography } from '@/components/ui';
import { appName } from '@/constants/settings';
import { BorderRadius, FontFamily, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { loginEmailSchema, loginPhoneSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

type LoginFormValues = {
    emailOrPhone: string;
    password: string;
};

export const LoginScreen = () => {
    const { colors } = useAppTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const { isDark } = useAppTheme();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        formState: { isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: yupResolver(authMethod === 'email' ? loginEmailSchema : loginPhoneSchema) as any,
        defaultValues: { emailOrPhone: '', password: '' },
        mode: 'onTouched',
    });

    const emailOrPhoneValue = watch('emailOrPhone');
    const passwordValue = watch('password');

    // Check if both fields have values
    const hasValue = !!emailOrPhoneValue?.trim() && !!passwordValue?.trim();

    // Clear the emailOrPhone field when switching between email and phone
    useEffect(() => {
        setValue('emailOrPhone', '');
        clearErrors('emailOrPhone');
    }, [authMethod, setValue, clearErrors]);

    const onSubmit = async (_data: LoginFormValues) => {
        await new Promise<void>((res) => setTimeout(res, 800)); // simulate request
        router.replace('/(app)/(tabs)');
    };

    return (
        <ScreenWrapper
            padded
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
            style={{ paddingVertical: Spacing.md }}
        >
            <View style={{ marginBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <BackButton onPress={() => router.back()} />
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>
                    <View style={{ flex: 1 }}>

                        <View style={styles.header}>

                            <Logo />

                            <Typography variant="h2" weight="bold" color={colors.text} align="center" style={{ width: '100%' }}>
                                Welcome back
                            </Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">
                                Sign in to continue to {appName}
                            </Typography>
                        </View>

                        {/* Form card */}
                        <GlassCard style={styles.card}>

                            {/* Method toggle */}
                            <View style={[styles.toggle, { backgroundColor: colors.surface }]}>
                                {(['email', 'phone'] as const).map((m) => (
                                    <Pressable
                                        key={m}
                                        onPress={() => setAuthMethod(m)}
                                        style={[
                                            styles.toggleOption,
                                            authMethod === m && { backgroundColor: colors.background, borderRadius: BorderRadius.md },
                                        ]}
                                    >
                                        <Typography
                                            variant="caption"
                                            weight={authMethod === m ? 'semiBold' : 'regular'}
                                            color={authMethod === m ? colors.text : colors.textSecondary}
                                        >
                                            {m === 'email' ? 'Email' : 'Phone'}
                                        </Typography>
                                    </Pressable>
                                ))}
                            </View>

                            {authMethod === 'email' ? (
                                <ControlledInput
                                    control={control}
                                    name="emailOrPhone"
                                    label="Email"
                                    placeholder="you@fashionistar.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    returnKeyType="next"
                                />
                            ) : (
                                <ControlledInput
                                    control={control}
                                    name="emailOrPhone"
                                    label="Phone number"
                                    placeholder="+1 000 000 0000"
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                    autoComplete="tel"
                                    returnKeyType="next"
                                />
                            )}

                            <View style={{ height: Spacing.lg }} />

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
                            <View style={{ height: Spacing.sm }} />
                            {/* Forgot password */}
                            <Pressable
                                onPress={() => { router.push('/forgot-password') }}
                                hitSlop={8}
                                style={styles.forgotWrap}
                            >
                                <Typography variant="caption" color={colors.primary}>
                                    Forgot password?
                                </Typography>
                            </Pressable>
                            <View style={{ height: Spacing.lg }} />
                            <GlassButton
                                variant="glass"
                                label="Login"
                                fullWidth
                                loading={isSubmitting}
                                onPress={handleSubmit(onSubmit)}
                                style={styles.signInBtn}
                                disabled={!hasValue || isSubmitting}
                            />
                        </GlassCard>

                        <View style={styles.loginRow}>
                            <Text
                                style={[
                                    styles.loginText,
                                    { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' },
                                ]}
                            >
                                Doesn&apos;t have an account?{' '}
                            </Text>
                            <Pressable onPress={() => router.push('/auth-stack')} hitSlop={8}>
                                <Text style={[styles.loginLink, { color: isDark ? '#fff' : '#111' }]}>
                                    Sign Up
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>

            {/* Login link */}

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

    card: {
        gap: Spacing.md,
        padding: Spacing[1],
    },
    forgotWrap: {
        alignSelf: 'flex-end',
        marginTop: -4,
    },
    signInBtn: {
        marginTop: Spacing.sm,
    },
    toggle: {
        flexDirection: 'row',
        borderRadius: BorderRadius.md,
        padding: 4,
        marginBottom: Spacing.md,
    },
    toggleOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },

    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing['2xl'] },
    loginText: { fontSize: 14, fontFamily: FontFamily.regular },
    loginLink: { fontSize: 14, fontFamily: FontFamily.bold },
})