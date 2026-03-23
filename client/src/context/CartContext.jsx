import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) { setCart({ items: [] }); return; }
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, qty = 1) => {
    const { data } = await api.post('/cart', { productId, qty });
    setCart(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [] });
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.qty, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
