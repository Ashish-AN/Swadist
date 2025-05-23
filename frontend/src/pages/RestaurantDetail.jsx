import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../components/CartContext";
import "../styles/RestaurantDetail.css";

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const { setCartQty } = useCart();
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

  useEffect(() => {
    axios
      .get(`https://swadist.onrender.com/api/dishes?restaurantId=${id}`)
      .then((res) => {
        setDishes(res.data);
      })

      .catch((err) => console.error(err));

    axios
      .get(`https://swadist.onrender.com/api/restaurants/${id}`)
      .then((res) => setRestaurant(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="restaurant-detail-container container mt-4">
      {message && (
        <Alert
          variant="success"
          onClose={() => setMessage("")}
          dismissible
          className="mb-4"
        >
          {message}
        </Alert>
      )}
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
        <FontAwesomeIcon icon={faLeftLong} style={{ marginRight: "2px" }} />{" "}
        Back
      </Button>

      {restaurant && (
        <div className="restaurant-header mb-4">
          <h2>{restaurant.name}</h2>
          <p className="text-muted">{restaurant.cuisine}</p>
        </div>
      )}

      <Row>
        {dishes.map((dish) => (
          <Col md={3} key={dish._id}>
            <Card className="dish-card mb-4">
              <div
                className={`dish-image ${dish.name
                  .toLowerCase()
                  .replace(/\s/g, "-")}`}
              />
              <Card.Body>
                <Card.Title>{dish.name}</Card.Title>
                <Card.Text className="price">{dish.price}</Card.Text>
                <Card.Text className={dish.isVeg ? "veg" : "non-veg"}>
                  {dish.isVeg ? "🌱 Veg" : "🍗 Non-Veg"}
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
    </div>
  );
}

export default RestaurantDetail;
