import type { PhoneValue } from '@/components/ui/PhoneInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Registration data stored across multiple screens
 */
export interface RegistrationData {
  email?: string;
  phone?: PhoneValue;
  isBusiness?: boolean;
  registrationMethod?: 'email' | 'phone';
  firstName?: string;
  lastName?: string;
  password?: string;
  businessName?: string;
  dob?: Date;
}

/**
 * Registration store interface
 */
interface RegistrationStore extends RegistrationData {
  // Setters for each field
  setEmail: (email: string) => void;
  setPhone: (phone: PhoneValue) => void;
  setFirstName: (firstName: string) => void;
  setIsBusiness: (isBusiness: boolean) => void;
  setBusinessName: (businessName: string) => void;
  setRegistrationMethod: (method: 'email' | 'phone') => void;
  setLastName: (lastName: string) => void;
  setPassword: (password: string) => void;
  setDob: (dob: Date) => void;
  
  // Utility methods
  reset: () => void;
  hasEmailOrPhone: () => boolean;
  getRegistrationPayload: () => Partial<RegistrationData>;
}

const initialState: RegistrationData = {
  email: undefined,
  phone: undefined,
  firstName: undefined,
  registrationMethod: undefined,
  lastName: undefined,
  password: undefined,
  dob: undefined,
  isBusiness: undefined,
  businessName: undefined,
};

/**
 * Zustand store for multi-step registration flow
 * Persists data to AsyncStorage so users can resume registration
 */
export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setEmail: (email) => set({ email, phone: undefined, registrationMethod: 'email' }), // Clear phone when setting email
      setPhone: (phone) => set({ phone, email: undefined, registrationMethod: 'phone' }), // Clear email when setting phone
      setIsBusiness: (isBusiness) => set({ isBusiness }), // Set business flag
      setRegistrationMethod: (method) => set({ registrationMethod: method }),
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setPassword: (password) => set({ password }),
      setDob: (dob) => set({ dob }),
      setBusinessName: (businessName) => set({ businessName }),
      
      reset: () => set(initialState),
      
      hasEmailOrPhone: () => {
        const state = get();
        return !!(state.email?.trim() || state.phone?.full);
      },
      
      getRegistrationPayload: () => {
        const state = get();
        return {
          email: state.email,
          phone: state.phone,
          firstName: state.firstName,
          registrationMethod: state.registrationMethod,
          lastName: state.lastName,
          password: state.password,
          dob: state.dob,
          isBusiness: state.isBusiness,
          businessName: state.businessName,
        };
      },
    }),
    {
      name: 'fashionistar-registration',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
