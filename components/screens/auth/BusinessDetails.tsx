import { BackButton, ControlledDOB, ControlledInput, GlassButton, ScreenWrapper, Typography } from '@/components/ui'
import { Spacing } from '@/constants'
import { isIOS } from '@/constants/spacing'
import { useRegistrationStore } from '@/stores/registrationStore'
import { BusinessRegisterFormValues, businessRegisterSchema } from '@/utils/validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Keyboard, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native'

export const BusinessDetails = () => {
    const router = useRouter();

    // Zustand selectors - read values
    const storedBusinessName = useRegistrationStore((state) => state.businessName);
    const storedFirstName = useRegistrationStore((state) => state.firstName);
    const storedLastName = useRegistrationStore((state) => state.lastName);
    const storedDob = useRegistrationStore((state) => state.dob);
    const isBusiness = useRegistrationStore((state) => state.isBusiness);
    
    // Zustand selectors - setter methods
    const setBusinessName = useRegistrationStore((state) => state.setBusinessName);
    const setFirstName = useRegistrationStore((state) => state.setFirstName);
    const setLastName = useRegistrationStore((state) => state.setLastName);
    const setDob = useRegistrationStore((state) => state.setDob);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm<BusinessRegisterFormValues>({
        resolver: yupResolver(businessRegisterSchema) as any,
        defaultValues: {
            businessName: isBusiness ? (storedBusinessName || '') : '',
            firstName: storedFirstName || '',
            lastName: storedLastName || '',
            dob: storedDob || undefined,
        },
        mode: 'onChange', // Real-time validation for better UX
    });

    const businessName = watch('businessName');
    const firstName = watch('firstName');
    const lastName = watch('lastName');
    const dob = watch('dob');

    // Clear businessName from both store and form when user is not a business owner
    useEffect(() => {
        if (!isBusiness) {
            if (storedBusinessName) {
                setBusinessName(''); // Clear from store
            }
            setValue('businessName', ''); // Clear from form
        }
    }, [isBusiness, storedBusinessName, setBusinessName, setValue]);

    // Check if all required fields have values
    // Business name is only required if user is a business owner
    const hasValue = isBusiness
        ? !!businessName?.trim() && !!firstName?.trim() && !!lastName?.trim() && !!dob
        : !!firstName?.trim() && !!lastName?.trim() && !!dob;

    const handleContinue = async (data: BusinessRegisterFormValues) => {
        // Save data to Zustand store using selectors
        // Only save businessName if user is a business owner
        if (isBusiness) {
            setBusinessName(data.businessName || '');
        } else {
            setBusinessName(''); // Clear business name if not a business
        }
        
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setDob(data.dob);
        
        router.push('/otp');
    };

    const handleModalContinue = async () => {
        await handleSubmit(handleContinue)();
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
                        <Typography variant='h3'>{isBusiness ? 'Brand' : 'Personal'} Details</Typography>
                        <View />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Typography
                            variant='title'
                            align='center'
                            style={{
                                opacity: 0.7,
                                paddingHorizontal: isIOS ? Spacing.md : Spacing.lg,
                                marginBottom: Spacing['3xl']
                            }}
                        >
                            {isBusiness ? 'This is how customers will recognize and find your brand.' : 'This is the name that will appear on your profile and orders.'}
                        </Typography>

                        <View style={{ width: '100%', flexDirection: 'column', gap: Spacing.lg }} pointerEvents="box-none">
                            {isBusiness && <ControlledInput
                                control={control}
                                name="businessName"
                                label="Business Name"
                                placeholder="Your business name"
                                autoCapitalize="words"
                                autoCorrect={false}
                            />}
                            <ControlledInput
                                control={control}
                                name="firstName"
                                label="First Name"
                                placeholder="Your first name"
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                            <ControlledInput
                                control={control}
                                name="lastName"
                                label="Last Name"
                                placeholder="Your last name"
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                            <ControlledDOB
                                control={control}
                                name="dob"
                                label="Date of birth"
                                hint="Must be at least 10 years old"
                            />
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            <GlassButton
                onPress={handleModalContinue}
                variant="glass"
                label="Continue"
                fullWidth
                size='md'
                style={{
                    borderRadius: Spacing[2],
                    marginBottom: Platform.OS === 'android' ? Spacing.xl : Spacing.md
                }}
                disabled={!hasValue || isSubmitting}
            />
        </ScreenWrapper>
    )
}