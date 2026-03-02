import { MeasurementField } from '@/types';
import { create } from 'zustand';

/**
 * Measurement store for current measurement being created/edited
 * In-memory only - data is cleared when app closes
 */
interface MeasurementStore {
  // Current state
  fields: MeasurementField[];
  unit: string;
  
  // Actions
  setFields: (fields: MeasurementField[]) => void;
  addField: (name: string) => void;
  removeField: (id: string) => void;
  updateFieldValue: (id: string, value: string) => void;
  setUnit: (unit: string) => void;
  reset: () => void;
  
  // Utility
  hasFields: () => boolean;
  fieldExists: (name: string) => boolean;
}

const initialState = {
  fields: [],
  unit: 'in',
};

export const useMeasurementStore = create<MeasurementStore>()((set, get) => ({
  ...initialState,
  
  setFields: (fields) => set({ fields }),
  
  addField: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    const exists = get().fields.find(
      (f) => f.name.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) return; // Let component handle toast
    
    set((state) => ({
      fields: [...state.fields, { 
        id: Date.now().toString() + Math.random(), 
        name: trimmed, 
        value: '' 
      }],
    }));
  },
  
  removeField: (id) => {
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
    }));
  },
  
  updateFieldValue: (id, value) => {
    set((state) => ({
      fields: state.fields.map((f) => 
        f.id === id ? { ...f, value } : f
      ),
    }));
  },
  
  setUnit: (unit) => set({ unit }),
  
  reset: () => set(initialState),
  
  hasFields: () => get().fields.length > 0,
  
  fieldExists: (name) => {
    return !!get().fields.find(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );
  },
}));
