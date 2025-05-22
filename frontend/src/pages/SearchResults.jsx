import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Button } from "react-bootstrap";
import DishList from "../components/DishList";
import RestaurantList from "../components/RestaurantList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import "../styles/SearchResults.css";

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const [resRes, dishRes] = await Promise.all([
        axios.get("http://localhost:9090/api/restaurants"),
        axios.get("http://localhost:9090/api/dishes"),
      ]);
      const resFiltered = resRes.data.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
      );
      const dishFiltered = dishRes.data.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase())
      );

      setRestaurants(resFiltered);
      setDishes(dishFiltered);
    };
    fetchResults();
  }, [query]);

  return (
    <div className="container">
      <h3>Search Results for "{query}"</h3>
      <Button
        variant="secondary"
        onClick={() => {
          sessionStorage.setItem("clearSearch", "true");
          navigate(-1);
        }}
        className="mb-4"
      >
        <FontAwesomeIcon icon={faLeftLong} style={{ marginRight: "2px" }} />{" "}
        Back
      </Button>
      {restaurants.length === 0 && dishes.length === 0 ? (
        <div className="no-result"></div>
      ) : (
        <>
          {restaurants.length > 0 && (
            <>
              <Row>
                <RestaurantList restaurants={restaurants} />
              </Row>
            </>
          )}
          {dishes.length > 0 && (
            <>
              <Row>
                <DishList dishes={dishes} />
              </Row>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
