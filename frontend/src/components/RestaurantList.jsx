import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "../styles/RestaurantList.css";

function RestaurantList({ restaurants: propRestaurants = [] }) {
  const [restaurants, setRestaurants] = useState([]);
  const useFetched = propRestaurants.length === 0;

  useEffect(() => {
    if (useFetched) {
      axios
        .get("http://localhost:9090/api/restaurants")
        .then((res) => setRestaurants(res.data))
        .catch((err) => console.error("Failed to fetch restaurants", err));
    }
  }, [useFetched]);

  const allRestaurants = useFetched ? restaurants : propRestaurants;

  if (allRestaurants.length === 0) {
    return <p>No restaurants found.</p>;
  }

  return (
    <Container>
      <h3 className="mb-4 mt-5" style={{ color: "#e37000" }}>
        Popular Restaurants
      </h3>
      <Row>
        {allRestaurants.map((restaurant) => (
          <Col key={restaurant._id} md={3} className="mb-4">
            <Link
              to={`/dashboard/restaurants/${restaurant._id}`}
              className="text-decoration-none text-dark"
            >
              <Card className="restaurant-card mb-4">
                <div
                  className={`restaurant-image ${restaurant.name
                    .toLowerCase()
                    .replace(/\s/g, "-")}`}
                />
                <Card.Body>
                  <Card.Title>{restaurant.name}</Card.Title>
                  <Card.Text>
                    Cuisine: {restaurant.cuisine} <br />
                    Rating:{" "}
                    <FontAwesomeIcon
                      icon={faStar}
                      style={{ color: "#f4a261" }}
                    />{" "}
                    {restaurant.rating}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default RestaurantList;
