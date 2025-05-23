import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "./CartContext";
import { Card, Row, Col, Container, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "../styles/DishList.css";

function DishList({ dishes: propDishes = [] }) {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const { setCartQty } = useCart();

  const useFetched = propDishes.length === 0;

  useEffect(() => {
    if (useFetched) {
      axios
        .get("https://swadist.onrender.com/api/dishes")
        .then((res) => setDishes(res.data))
        .catch((err) => console.error("Failed to fetch dishes", err));
    }
  }, [useFetched]);

  const allDishes = useFetched ? dishes : propDishes;

  const limitedDishes = allDishes
    .filter((_, index) => index % 2 === 0 && index <= 14)
    .slice(0, 8);

  const addToCart = async (dish) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setMessage("Login required to add items to cart");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    const price =
      typeof dish.price === "string"
        ? parseFloat(dish.price.replace(/[^\d.]/g, ""))
        : dish.price;
    const restaurantId =
      typeof dish.restaurantId === "object"
        ? dish.restaurantId._id
        : dish.restaurantId;

    try {
      await axios.post("https://swadist.onrender.com/api/cart", {
        userId: user.userId,
        restaurantId,
        dishId: dish._id,
        quantity: 1,
        price,
      });
      const res = await axios.get(
        `https://swadist.onrender.com/api/cart/${user.userId}`
      );
      const items = res.data.items || [];
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartQty(totalQty);

      setMessage(`${dish.name} added to cart`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessage("Failed to add to cart");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (allDishes.length === 0) {
    return <p>No dishes found.</p>;
  }

  return (
    <Container>
      {message && (
        <Alert variant="success" className="text-center">
          {message}
        </Alert>
      )}
      <h3 className="mb-4 mt-5" style={{ color: "#e37000" }}>
        Popular Dishes
      </h3>

      <Row>
        {limitedDishes.map((dish) => (
          <Col md={3} key={dish._id}>
            <Card className="dish-card mb-4">
              <div
                className={`dish-image ${dish.name
                  .toLowerCase()
                  .replace(/\s/g, "-")}`}
              />
              <Card.Body>
                <Card.Title>{dish.name}</Card.Title>
                <Card.Text>
                  Category: {dish.category}
                  <br /> Price:
                  <span style={{ color: "#d9534f", fontWeight: "bold" }}>
                    {dish.price}
                  </span>
                </Card.Text>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => addToCart(dish)}
                  style={{ marginLeft: "90%" }}
                >
                  <FontAwesomeIcon icon={faPlus} size="lg" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default DishList;
