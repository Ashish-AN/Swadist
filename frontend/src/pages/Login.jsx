import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:9090/api/login", formData);
      const user = {
        name: res.data.name,
        email: res.data.email,
        userId: res.data.userId,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.data.token);
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/dashboard/home");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };
  return (
    <div className="login-page">
      <Card className="login-card text-center">
        {message && (
          <Alert variant="success" className="text-center">
            {message}
          </Alert>
        )}
        <div className="login-logo" />
        {error && <p className="text-danger mb-3">{error}</p>}
        <h3 className="login-title mb-4" style={{ color: "#3c763d" }}>
          Login to Your Account
        </h3>
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button
            className="login-btn w-100"
            type="submit"
            style={{ backgroundColor: "#e37000", border: "none" }}
          >
            Log In
          </Button>
        </Form>
        <p className="signup-link">
          Don’t have an account? <a href="/register">Sign up</a>
        </p>
      </Card>
    </div>
  );
}
export default Login;
