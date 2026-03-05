import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Media item type for posts
 */
export interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  duration?: number; // in seconds, for videos
}

/**
 * Post draft data
 */
export interface PostData {
  caption: string;
  media: MediaItem[];
  tags?: string[];
  categoryId?: string;
  location?: string;
  taggedPeople?: string[];
  priceMin?: number;
  priceMax?: number;
  availability?: 'in_stock' | 'made_to_order' | 'sold_out' | 'coming_soon';
  collection?: string;
}

/**
 * Post store interface
 */
interface PostStore extends PostData {
  // Setters
  setCaption: (caption: string) => void;
  setMedia: (media: MediaItem[]) => void;
  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;
  setTags: (tags: string[]) => void;
  setCategoryId: (categoryId: string) => void;
  setLocation: (location: string) => void;
  setTaggedPeople: (people: string[]) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setAvailability: (availability: PostData['availability']) => void;
  setCollection: (collection: string) => void;
  
  // Utility methods
  reset: () => void;
  hasMedia: () => boolean;
  getPostPayload: () => PostData;
}

const initialState: PostData = {
  caption: '',
  media: [],
  tags: [],
  categoryId: undefined,
  location: undefined,
  taggedPeople: [],
  priceMin: undefined,
  priceMax: undefined,
  availability: undefined,
  collection: undefined,
};

/**
 * Zustand store for post creation
 * Persists draft data to AsyncStorage
 */
export const usePostStore = create<PostStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCaption: (caption) => set({ caption }),
      setMedia: (media) => set({ media }),
      addMedia: (item) => set((state) => ({ media: [...state.media, item] })),
      removeMedia: (id) => set((state) => ({ media: state.media.filter((m) => m.id !== id) })),
      setTags: (tags) => set({ tags }),
      setCategoryId: (categoryId) => set({ categoryId }),
      setLocation: (location) => set({ location }),
      setTaggedPeople: (taggedPeople) => set({ taggedPeople }),
      setPriceRange: (priceMin, priceMax) => set({ priceMin, priceMax }),
      setAvailability: (availability) => set({ availability }),
      setCollection: (collection) => set({ collection }),
      
      reset: () => set(initialState),
      
      hasMedia: () => {
        const state = get();
        return state.media.length > 0;
      },
      
      getPostPayload: () => {
        const state = get();
        return {
          caption: state.caption,
          media: state.media,
          tags: state.tags,
          categoryId: state.categoryId,
          location: state.location,
          taggedPeople: state.taggedPeople,
          priceMin: state.priceMin,
          priceMax: state.priceMax,
          availability: state.availability,
          collection: state.collection,
        };
      },
    }),
    {
      name: 'fashionistar-post-draft',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
