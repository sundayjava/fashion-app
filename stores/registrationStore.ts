import type { PhoneValue } from '@/components/ui/PhoneInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Registration data stored across multiple screens
 */
export interface RegistrationData {
  // Step 1: Email or Phone
  email?: string;
  phone?: PhoneValue;
  isBusiness?: boolean; // Optional field to indicate if user is registering as a business
  
  // Step 2: User details
  firstName?: string;
  lastName?: string;
  username?: string;
  
  // Step 3: Password
  password?: string;
  
  // Step 4: Additional info (optional)
  dob?: Date;
  bio?: string;
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
  setLastName: (lastName: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setDob: (dob: Date) => void;
  setBio: (bio: string) => void;
  
  // Utility methods
  reset: () => void;
  hasEmailOrPhone: () => boolean;
  getRegistrationPayload: () => Partial<RegistrationData>;
}

const initialState: RegistrationData = {
  email: undefined,
  phone: undefined,
  firstName: undefined,
  lastName: undefined,
  username: undefined,
  password: undefined,
  dob: undefined,
  bio: undefined,
  isBusiness: undefined,
};

/**
 * Zustand store for multi-step registration flow
 * Persists data to AsyncStorage so users can resume registration
 */
export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setEmail: (email) => set({ email, phone: undefined }), // Clear phone when setting email
      setPhone: (phone) => set({ phone, email: undefined }), // Clear email when setting phone
      setIsBusiness: (isBusiness) => set({ isBusiness }), // Set business flag
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setUsername: (username) => set({ username }),
      setPassword: (password) => set({ password }),
      setDob: (dob) => set({ dob }),
      setBio: (bio) => set({ bio }),
      
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
          lastName: state.lastName,
          username: state.username,
          password: state.password,
          dob: state.dob,
          bio: state.bio,
          isBusiness: state.isBusiness,
        };
      },
    }),
    {
      name: 'fashionistar-registration',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
