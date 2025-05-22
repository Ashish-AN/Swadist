import React from "react";
import ReactDom from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.jsx";
import { CartProvider } from "./components/CartContext.jsx";

const root = ReactDom.createRoot(document.getElementById("root"));
root.render(
  <CartProvider>
    <App />
  </CartProvider>
);
