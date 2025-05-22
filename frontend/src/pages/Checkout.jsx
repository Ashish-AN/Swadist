import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { setCartQty } = useCart();
  const navigate = useNavigate();

  const shippingCharge = 50;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const savedPayment = localStorage.getItem("swadist_payment");
    if (savedPayment) {
      setPaymentSuccess(true);
      setPaymentDetails(JSON.parse(savedPayment));
    }

    axios
      .get(`http://localhost:9090/api/cart/${user.userId}`)
      .then((res) => setCart(res.data.items || []));
    axios
      .get(`http://localhost:9090/api/cart/${user.userId}/total`)
      .then((res) => setTotal(res.data.totalPrice || 0));
  }, [user.userId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePayment = async () => {
    try {
      const res = await axios.post(
        "http://localhost:9090/api/payment/create-order",
        {
          amount: total + shippingCharge,
        }
      );

      const { order } = res.data;

      const options = {
        key: "rzp_test_0FB1QBDERFsUJi",
        amount: order.amount,
        currency: order.currency,
        name: "Swadist Food",
        description: "Order Payment",
        order_id: order.id,
        handler: function (response) {
          const paymentInfo = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          };

          setPaymentSuccess(true);
          setPaymentDetails(paymentInfo);
          localStorage.setItem("swadist_payment", JSON.stringify(paymentInfo));
        },
        prefill: {
          name: form.name,
          contact: form.phone,
          email: user.email || "",
        },
        theme: {
          color: "#e37000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentSuccess) {
      alert("Please complete the payment first.");
      return;
    }
    if (!form.name || !form.address || !form.phone) {
      alert("Please fill in all shipping details.");
      return;
    }

    try {
      await axios.post("http://localhost:9090/api/orders", {
        userId: user.userId,
        ...form,
        items: cart,
        total: total + shippingCharge,
        ...paymentDetails,
      });

      await axios.delete(`http://localhost:9090/api/cart/${user.userId}`);
      setCart([]);
      setCartQty(0);
      localStorage.removeItem("swadist_payment");
      setOrderPlaced(true);

      setTimeout(() => {
        navigate("/dashboard/orders");
      }, 2000);
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4" style={{ color: "#e37000" }}>
        Checkout
      </h3>
      {orderPlaced && (
        <Alert variant="success">
          Order placed successfully! Redirecting...
        </Alert>
      )}
      {paymentSuccess && !orderPlaced && (
        <Alert variant="success">
          Payment successful! Please place your order now.
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: "#3c763d", fontWeight: "bold" }}>
          Order Summary
        </Card.Header>
        <Card.Body>
          <Table borderless responsive>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(({ dishId, quantity }) => {
                const rawPrice = dishId?.price;
                const price =
                  typeof rawPrice === "string"
                    ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
                    : rawPrice || 0;
                const subtotal = price * quantity;

                return (
                  <tr key={dishId._id}>
                    <td>{dishId.name}</td>
                    <td>{quantity}</td>
                    <td>₹{subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <hr />
          <p>Subtotal: ₹{total.toFixed(2)}</p>
          <p>Shipping: ₹{shippingCharge}</p>
          <h5 style={{ color: "#d9534f" }}>
            Total: ₹{(total + shippingCharge).toFixed(2)}
          </h5>

          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-primary"
              onClick={() => navigate("/dashboard/cart")}
              disabled={paymentSuccess}
            >
              Modify Cart
            </Button>
            <Button
              variant="success"
              onClick={handlePayment}
              disabled={paymentSuccess}
            >
              Proceed to Payment
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header style={{ backgroundColor: "#3c763d", fontWeight: "bold" }}>
          Shipping Details
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Delivery Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                placeholder="Complete Address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Mobile No."
                value={form.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              className="w-100"
              style={{ backgroundColor: "#e37000", border: "none" }}
              type="button"
              onClick={handlePlaceOrder}
              disabled={!paymentSuccess}
            >
              Place Order
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Checkout;
