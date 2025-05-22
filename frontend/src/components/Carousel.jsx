import React from "react";
import { Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Carousel.css";

function CarouselComponent() {
  return (
    <Carousel
      className="home-carousel"
      interval={10000}
      pause="hover"
      prevIcon={
        <span className="carousel-icon">
          <FontAwesomeIcon icon={faChevronLeft} />
        </span>
      }
      nextIcon={
        <span className="carousel-icon">
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      }
    >
      <Carousel.Item>
        <div className="carousel-slide slide1"></div>
      </Carousel.Item>

      <Carousel.Item>
        <div className="carousel-slide slide2"></div>
      </Carousel.Item>

      <Carousel.Item>
        <div className="carousel-slide slide3"></div>
      </Carousel.Item>
    </Carousel>
  );
}
export default CarouselComponent;
