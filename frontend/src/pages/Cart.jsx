import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../components/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setCartQty } = useCart();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          const [cartRes, totalRes] = await Promise.all([
            axios.get(`https://swadist.onrender.com/api/cart/${user.userId}`),
            axios.get(
              `https://swadist.onrender.com/api/cart/${user.userId}/total`
            ),
          ]);
          const items = cartRes.data.items || [];
          setCartItems(items);
          setTotal(totalRes.data.totalPrice || 0);

          const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartQty(totalQty);
        } catch (err) {
          console.error("Error fetching cart:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    }
  }, [user, setCartQty]);

  const updateQuantity = async (dishId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const updatedItems = cartItems.map((item) => {
        const rawPrice = item.dishId?.price;
        const price =
          typeof rawPrice === "string"
            ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
            : rawPrice || 0;

        return {
          dishId: item.dishId._id,
          quantity: item.dishId._id === dishId ? newQuantity : item.quantity,
          price,
        };
      });

      await axios.put(`https://swadist.onrender.com/api/cart/${user.userId}`, {
        items: updatedItems,
      });

      const updatedTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const updatedQty = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCartItems((prev) =>
        prev.map((item) =>
          item.dishId._id === dishId ? { ...item, quantity: newQuantity } : item
        )
      );
      setTotal(updatedTotal);
      setCartQty(updatedQty);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (dishId) => {
    try {
      const updatedItems = cartItems.filter(
        (item) => item.dishId._id !== dishId
      );

      await axios.put(`https://swadist.onrender.com/api/cart/${user.userId}`, {
        items: updatedItems.map((item) => {
          const rawPrice = item.dishId?.price;
          const price =
            typeof rawPrice === "string"
              ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
              : rawPrice || 0;

          return {
            dishId: item.dishId._id,
            quantity: item.quantity,
            price,
          };
        }),
      });

      const updatedTotal = updatedItems.reduce((sum, item) => {
        const rawPrice = item.dishId?.price;
        const price =
          typeof rawPrice === "string"
            ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
            : rawPrice || 0;
        return sum + price * item.quantity;
      }, 0);

      const updatedQty = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCartItems(updatedItems);
      setTotal(updatedTotal);
      setCartQty(updatedQty);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(
        `https://swadist.onrender.com/api/cart/${user.userId}`
      );
      setCartItems([]);
      setTotal(0);
      setCartQty(0);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  return (
    <Container className="mt-5">
      <h3 style={{ color: "#e37000" }}>Your Cart</h3>
      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <div className="cart-empty"></div>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(({ dishId, quantity }) => {
                const rawPrice = dishId?.price;
                const price =
                  typeof rawPrice === "string"
                    ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
                    : rawPrice || 0;
                const subtotal = price * quantity;

                return (
                  <tr key={dishId._id}>
                    <td>{dishId.name}</td>
                    <td>₹{price.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => updateQuantity(dishId._id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </Button>{" "}
                      <span style={{ margin: "0 10px" }}>{quantity}</span>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => updateQuantity(dishId._id, quantity + 1)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                    </td>
                    <td>₹{subtotal.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(dishId._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <h5>
            Total:{" "}
            <span style={{ color: "#d9534f", fontWeight: "bold" }}>
              ₹{total.toFixed(2)}
            </span>
          </h5>
          <Button variant="outline-danger" onClick={clearCart}>
            Clear Cart
          </Button>{" "}
          <Button
            variant="success"
            className="ms-2"
            onClick={() => navigate("/dashboard/checkout")}
            disabled={loading || cartItems.length === 0}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </Container>
  );
}

export default Cart;
