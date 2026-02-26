import { CheckIcon } from '@/assets/icons/CheckIcon';
import { ExternalLink } from '@/components/external-link';
import { AppModal, ControlledInput, GlassButton, ScreenWrapper, Typography } from '@/components/ui';
import { Spacing } from '@/constants';
import { isIOS } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import { PasswordCreationFormValues, passwordCreationSchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

export const Password = () => {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const setPassword = useRegistrationStore((state) => state.setPassword);

    const {
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting },
    } = useForm<PasswordCreationFormValues>({
        resolver: yupResolver(passwordCreationSchema) as any,
        defaultValues: { 
            password: '', 
            confirmPassword: '',
            acceptTerms: false,
        },
        mode: 'onChange',
    });

    const password = watch('password');
    const confirmPassword = watch('confirmPassword');
    const acceptTerms = watch('acceptTerms');

    // Password validation checks
    const checks = [
        { label: 'At least 8 characters', valid: password?.length >= 8 },
        { label: 'One uppercase letter', valid: /[A-Z]/.test(password || '') },
        { label: 'One lowercase letter', valid: /[a-z]/.test(password || '') },
        { label: 'One number', valid: /[0-9]/.test(password || '') },
        { label: 'One special character', valid: /[^a-zA-Z0-9]/.test(password || '') },
        { label: 'Passwords match', valid: !!password && password === confirmPassword },
    ];

    const allChecksValid = checks.every((check) => check.valid);
    const hasValue = !!password && !!confirmPassword;

    const handleContinue = async () => {
        if (allChecksValid && !acceptTerms) {
            setModalVisible(true);
        }
    };

    const onSubmit = async (data: PasswordCreationFormValues) => {
        setPassword(data.password);
        
        setModalVisible(false);
        // TODO: Navigate to next step or complete registration
        // router.push('/next-step');
        router.replace('/(app)/(tabs)'); // For demo, navigate to main app
    };

    const handleModalContinue = async () => {
        await handleSubmit(onSubmit)();
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
                    <View style={styles.header}>
                        <View />
                        <Typography variant='h3'>Create Password</Typography>
                        <View />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Typography
                            variant='title'
                            align='center'
                            style={{
                                opacity: 0.7,
                                paddingHorizontal: isIOS ? Spacing.sm : Spacing.md,
                                marginBottom: Spacing.xl
                            }}
                        >
                            Create a secure password to protect your account and keep your information safe.
                        </Typography>

                        <View style={{ gap: Spacing.lg }}>
                            <ControlledInput
                                control={control}
                                name="password"
                                label="Password"
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="new-password"
                                returnKeyType="next"
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
                                label="Confirm Password"
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
                            />
                        </View>

                        {/* Password Requirements Checklist */}
                        <View style={styles.checklistContainer}>
                            <Typography variant="body" weight="semiBold" color={colors.text} style={{ marginBottom: Spacing.sm }}>
                                Password must contain:
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
                label="Continue"
                fullWidth
                size="md"
                onPress={handleContinue}
                disabled={!hasValue || !allChecksValid || isSubmitting}
                loading={isSubmitting}
                style={{
                    borderRadius: Spacing[2],
                    marginBottom: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
                }}
            />

            {/* Terms and Conditions Modal */}
            <AppModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Terms & Conditions"
                footer={
                    <GlassButton
                        variant="glass"
                        label="Continue"
                        fullWidth
                        onPress={handleModalContinue}
                        disabled={!acceptTerms || isSubmitting}
                        loading={isSubmitting}
                    />
                }
            >
                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: Spacing.md }}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                        We are committed to protecting your privacy and ensuring the security of your personal information. Please review our terms carefully.
                    </Typography>
                </ScrollView>

                <View style={{ marginTop: Spacing.lg }}>
                    <Controller
                        control={control}
                        name="acceptTerms"
                        render={({ field: { value, onChange } }) => (
                            <Pressable
                                onPress={() => onChange(!value)}
                                style={styles.termsCheckbox}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        {
                                            borderColor: value ? colors.primary : colors.border,
                                            backgroundColor: value ? colors.primary : 'transparent',
                                        },
                                    ]}
                                >
                                    {value && <CheckIcon width={14} height={14} color="#fff" />}
                                </View>
                                <Typography variant="body" style={{ flex: 1 }}>
                                    I accept the{' '}
                                    <ExternalLink style={{ color: colors.primary, fontWeight: 700 }} href={'https://cionde.com/terms-of-use'}>Terms & Conditions</ExternalLink>
                                    {' '}and{' '}
                                    <ExternalLink style={{ color: colors.primary, fontWeight: 700 }} href={'https://cionde.com/privacy-policy'}>Privacy Policy</ExternalLink>
                                </Typography>
                            </Pressable>
                        )}
                    />
                </View>
            </AppModal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
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
    termsCheckbox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
});