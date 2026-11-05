import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: string; // product _id or slug
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  image: string;
  category?: string;
  stock?: number;
}

interface WishlistState {
  items: WishlistItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (newItem) => set((state) => {
        const exists = state.items.some((i) => i.id === newItem.id || i.slug === newItem.slug);
        if (exists) return state;
        return { items: [newItem, ...state.items] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id && i.slug !== id)
      })),

      toggleWishlist: (item) => {
        const state = get();
        const exists = state.items.some((i) => i.id === item.id || i.slug === item.slug);
        if (exists) {
          state.removeItem(item.id);
          toast.success('Removed from Wishlist', { icon: '💔' });
          return false;
        } else {
          state.addItem(item);
          toast.success('Added to Wishlist', { icon: '❤️' });
          return true;
        }
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id || i.slug === id);
      },

      clearWishlist: () => set({ items: [] }),

      getTotalItems: () => get().items.length,
    }),
    {
      name: 'ruporong-wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
