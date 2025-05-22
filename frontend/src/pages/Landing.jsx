import React from "react";
import { Container, Navbar, Nav, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

function Landing() {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate("/login");
  };

  const handleSocialClick = (e) => {
    e.preventDefault();
    alert("Social media integration is not implemented yet. Stay tuned!");
  };

  return (
    <div className="landing-page">
      <Navbar expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <div className="nav-logo" />
            <span className="brand-name ms-2">Swadist</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto nav-links">
              <Link className="nav-link" to="/register">
                <Button className="sign-up-btn">Sign Up</Button>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="hero-section">
        <Row className="align-items-center">
          <Col md={6}>
            <h1 className="hero-title">Delicious Food Delivered to You</h1>
            <p className="hero-subtext">
              Enjoy the authentic taste of India from the comfort of your home —
              fast, fresh, and full of flavor with Swadist.
            </p>
            <Button className="order-btn" onClick={handleOrderNow}>
              Order Now
              <FontAwesomeIcon
                icon={faAngleRight}
                style={{ marginLeft: "8px" }}
              />
            </Button>
          </Col>
          <Col md={6}>
            <div className="hero-image" />
          </Col>
        </Row>
      </Container>
      <Container className="featured-section py-5">
        <h2 className="section-title mb-4">Popular Dishes</h2>
        <Row>
          {[
            "Paneer Tikka",
            "Butter Chicken",
            "Veg Biryani",
            "Masala Dosa",
            "Chole Bhature",
            "Rajma Chawal",
          ].map((dish, idx) => (
            <Col md={4} key={idx} className="mb-4">
              <div className="dish-card">
                <div className={`dish-image dish-image${idx + 1}`} />
                <h5 className="mt-3">{dish}</h5>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <footer className="footer text-center py-4">
        <p>© 2025 Swadist. All rights reserved.</p>
        <div>
          <a href="#" onClick={handleSocialClick} className="mx-2">
            <FontAwesomeIcon icon={faFacebook} size="lg" />
          </a>
          |
          <a href="#" onClick={handleSocialClick} className="mx-2">
            <FontAwesomeIcon
              icon={faInstagram}
              size="lg"
              style={{ color: "#DD2A7B" }}
            />
          </a>
          |
          <a href="#" onClick={handleSocialClick} className="mx-2">
            <FontAwesomeIcon
              icon={faXTwitter}
              size="lg"
              style={{ color: "black" }}
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
export default Landing;
