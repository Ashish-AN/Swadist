import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";
import "../styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faHome,
  faBox,
  faCartPlus,
  faHeadset,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "./CartContext";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const { cartQty, setCartQty } = useCart();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    const parsedUser = JSON.parse(loggedInUser);
    setUser(parsedUser);

    axios
      .get("http://localhost:9090/api/restaurants")
      .then((response) => setRestaurants(response.data))
      .catch((error) => console.error("Failed to fetch restaurants:", error));
    if (parsedUser) {
      axios
        .get(`http://localhost:9090/api/cart/${parsedUser.userId}`)
        .then((res) => {
          const items = res.data.items || [];
          const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartQty(totalQty);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setCartQty(0);
          } else {
            console.error("Failed to fetch cart quantity:", err);
          }
        });
    }
  }, []);

  const toCamelCase = (fullName) => {
    if (!fullName) return "Guest";
    const firstName = fullName.trim().split(" ")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const handleSocialClick = (e) => {
    e.preventDefault();
    alert("Social media integration is not implemented yet. Stay tuned!");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/dashboard/search-results?query=${searchTerm}`);
    }
  };

  const filteredRestaurants = restaurants.filter(
    (res) =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const shouldClear = sessionStorage.getItem("clearSearch") === "true";
    if (shouldClear) {
      setSearchTerm("");
      sessionStorage.removeItem("clearSearch");
    }
  }, [location]);

  return (
    <>
      <Navbar expand="lg" className="dashboard-navbar">
        <Container>
          <Navbar.Brand
            as={NavLink}
            to="/dashboard/home"
            className="d-flex align-items-center"
          >
            <div className="swadist-logo" />
            <span className="logo-name ">Swadist</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="swadist-navbar-nav" />

          <Navbar.Collapse id="swadist-navbar-nav">
            <Form
              className="d-flex search-form mx-auto"
              onSubmit={handleSearchSubmit}
              style={{ maxWidth: "500px", position: "relative" }}
            >
              <div className="input-group">
                <FormControl
                  type="search"
                  placeholder="Search for food, restaurants, etc."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" className="search-btn">
                  <FontAwesomeIcon icon={faSearch} size="lg" />
                </Button>
              </div>
            </Form>

            <Nav
              className="ms-auto align-items-center"
              accessKey={location.pathname}
            >
              <Nav.Link as={NavLink} to="/dashboard/home" end>
                <FontAwesomeIcon
                  icon={faHome}
                  style={{ marginRight: "4px", width: "20px", height: "20px" }}
                />
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/dashboard/orders" end>
                <FontAwesomeIcon
                  icon={faBox}
                  style={{ marginRight: "4px", width: "20px", height: "20px" }}
                />
                Orders
              </Nav.Link>
              <Nav.Link as={NavLink} to="/dashboard/cart" end>
                <FontAwesomeIcon
                  icon={faCartPlus}
                  style={{ marginRight: "4px", width: "20px", height: "20px" }}
                />
                Cart
                <span style={{ color: "#d9534f" }}>
                  {cartQty > 0 && <span>({cartQty})</span>}
                </span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/dashboard/support" end>
                <FontAwesomeIcon
                  icon={faHeadset}
                  style={{ marginRight: "4px", width: "20px", height: "20px" }}
                />
                Support
              </Nav.Link>
              <NavDropdown
                title={
                  <span>
                    <FontAwesomeIcon icon={faUser} className="profile-icon" />
                    <span style={{ marginLeft: "2px" }}>
                      {toCamelCase(user?.name || "Guest")}
                    </span>
                  </span>
                }
                id="profile-dropdown"
                align="end"
              >
                <NavDropdown.Item
                  onClick={() => navigate("/dashboard/profile")}
                >
                  View Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/login");
                  }}
                  style={{
                    color: "#DC143C",
                  }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="content-area mt-4">
        <Outlet context={[filteredRestaurants, searchTerm]} />
      </div>

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
    </>
  );
}

export default Dashboard;
