import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartQty, setCartQty] = useState(0);

  return (
    <CartContext.Provider value={{ cartQty, setCartQty }}>
      {children}
    </CartContext.Provider>
  );
};
