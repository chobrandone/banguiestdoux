'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '@/lib/utils';
import type { CartItem, Product } from '@/types';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM';    payload: { product: Product; quantity?: number; size?: string; color?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QTY';  payload: { productId: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD';        payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const { product, quantity = 1, size, color } = action.payload;
      const existing = state.items.find(
        (i) => i.product._id === product._id && i.size === size && i.color === color
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product._id === product._id && i.size === size && i.color === color
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
          isOpen: true,
        };
      }
      return { ...state, items: [...state.items, { product, quantity, size, color }], isOpen: true };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product._id !== action.payload.productId) };

    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.product._id === action.payload.productId
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };

    case 'CLEAR':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  /* Persist & restore cart */
  useEffect(() => {
    const saved = storage.get('bed_cart') as CartItem[] | null;
    if (saved) dispatch({ type: 'LOAD', payload: saved });
  }, []);

  useEffect(() => {
    storage.set('bed_cart', state.items);
  }, [state.items]);

  const addItem = (product: Product, quantity = 1, size?: string, color?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size, color } });
    toast.success(`${product.name} ajouté au panier`);
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQty = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } });
  };

  const clearCart  = () => dispatch({ type: 'CLEAR' });
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const openCart   = () => dispatch({ type: 'OPEN_CART' });
  const closeCart  = () => dispatch({ type: 'CLOSE_CART' });

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen,
      itemCount, total,
      addItem, removeItem, updateQty, clearCart,
      toggleCart, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
