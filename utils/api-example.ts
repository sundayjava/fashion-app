/**
 * EXAMPLE: How to reset Zustand store after backend submission
 * 
 * This file demonstrates the pattern for:
 * 1. Collecting all registration data from Zustand
 * 2. Submitting to your backend API
 * 3. Resetting the store after successful registration
 * 
 * Use this pattern in your final registration screen
 */

import { useRegistrationStore } from '@/stores/registrationStore';

// Example: Final registration screen component
export const ExampleFinalRegistrationScreen = () => {
  // Get data and reset function from store
  const getRegistrationPayload = useRegistrationStore((state) => state.getRegistrationPayload);
  const resetStore = useRegistrationStore((state) => state.reset);
  
  const handleFinalSubmit = async () => {
    try {
      // 1. Get all collected data from Zustand
      const registrationData = getRegistrationPayload();
      
      console.log('Submitting to backend:', registrationData);
      
      // 2. Submit to your backend API
      const response = await fetch('https://your-api.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();
      
      console.log('Registration successful:', data);
      
      // 3. ✅ IMPORTANT: Reset Zustand store after successful registration
      resetStore();
      
      // 4. Navigate to success screen or home
      // router.replace('/(app)/(auth)/success');
      // or
      // router.replace('/(app)/(tabs)');
      
    } catch (error) {
      console.error('Registration error:', error);
      // Show error message to user
      // Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };
  
  return (
    // Your final screen UI with submit button
    // <GlassButton label="Complete Registration" onPress={handleFinalSubmit} />
    null
  );
};

/**
 * Alternative: If you want to manually reset specific fields only
 */
export const ExamplePartialReset = () => {
  const setEmail = useRegistrationStore((state) => state.setEmail);
  const setPhone = useRegistrationStore((state) => state.setPhone);
  const setPassword = useRegistrationStore((state) => state.setPassword);
  
  const clearSensitiveData = () => {
    // Clear only password after submission (keep other data)
    setPassword('');
    
    // Or clear multiple fields
    setEmail('');
    setPhone(undefined as any);
  };
  
  return null;
};

/**
 * Key Points:
 * 
 * ✅ Call resetStore() AFTER successful backend response
 * ✅ DON'T reset before API call (in case of network errors)
 * ✅ Use try-catch to handle errors gracefully
 * ✅ Consider showing loading states during submission
 * ✅ Navigate to success/home screen after reset
 * 
 * The form clearing on screen leave is handled by useFocusEffect
 * in individual screen components (already implemented in EmailPhone.tsx)
 */
