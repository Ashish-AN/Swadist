import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import "../styles/Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const { name, email, password, confirmPassword } = formData;
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const res = await axios.post(
        "http://localhost:9090/api/register",
        formData
      );

      setFormData({
        name: "",
        email: "",
        password: "",
      });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  return (
    <div className="register-page">
      <Card className="register-card text-center">
        {message && (
          <Alert variant="success" className="text-center">
            {message}
          </Alert>
        )}
        <div className="register-logo" />
        {error && <p className="text-danger mb-3">{error}</p>}
        <h3 className="register-title mb-4" style={{ color: "#3c763d" }}>
          Create an Account
        </h3>
        <Form className="register-form" onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button
            className="register-btn w-100"
            type="submit"
            style={{ backgroundColor: "#e37000", border: "none" }}
          >
            Sign Up
          </Button>
        </Form>
        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </Card>
    </div>
  );
}

export default Register;
