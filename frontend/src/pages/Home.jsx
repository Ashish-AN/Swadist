import React from "react";
import CarouselComponent from "../components/Carousel";
import RestaurantList from "../components/RestaurantList";
import DishList from "../components/DishList";

function Home() {
  return (
    <div>
      <CarouselComponent />
      <RestaurantList />
      <DishList />
    </div>
  );
}

export default Home;
