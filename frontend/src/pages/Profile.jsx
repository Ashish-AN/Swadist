import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Image,
  Alert,
  Modal,
} from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    dob: "",
    gender: "",
    profilePic: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState({ message: "", variant: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`https://swadist.onrender.com/api/users/${user.userId}`)
      .then((res) => {
        setUserData(res.data);
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          dob: res.data.dob || "",
          gender: res.data.gender || "",
          profilePic: res.data.profilePic || null,
        });
      })
      .catch((err) =>
        setAlert({ message: "Error fetching user data", variant: "danger" })
      );
  }, [user.userId]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", variant: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, profilePic: file });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "profilePic") {
        if (value && typeof value !== "string") {
          formData.append("profilePic", value);
        }
      } else {
        formData.append(key, value);
      }
    });
    try {
      await axios.put(
        `https://swadist.onrender.com/api/users/${user.userId}`,
        formData
      );
      setAlert({ message: "Profile updated successfully", variant: "success" });
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setAlert({
        message: err?.response?.data?.message || "Server error",
        variant: "danger",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(
          `https://swadist.onrender.com/api/users/${user.userId}`
        );
        localStorage.clear();
        window.location.href = "/";
      } catch (err) {
        console.error("Error deleting account:", err);
        setAlert({ message: "Error deleting account", variant: "danger" });
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({ message: "Passwords do not match", variant: "danger" });
      return;
    }
    try {
      await axios.put(
        `https://swadist.onrender.com/api/users/${user.userId}/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }
      );
      setAlert({
        message: "Password updated successfully",
        variant: "success",
      });
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setAlert({
        message: err?.response?.data?.message || "Failed to change password",
        variant: "danger",
      });
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow-sm">
        <h4 className="text-center mb-4" style={{ color: "#e37000" }}>
          Profile Overview
        </h4>

        {alert.message && (
          <Alert
            variant={alert.variant}
            onClose={() => setAlert({ message: "", variant: "" })}
            dismissible
          >
            {alert.message}
          </Alert>
        )}

        <div className="d-flex justify-content-center mb-4">
          {form.profilePic && typeof form.profilePic === "string" ? (
            <Image
              src={`https://swadist.onrender.com/uploads/${form.profilePic}`}
              roundedCircle
              width={100}
              height={100}
            />
          ) : form.profilePic && typeof form.profilePic !== "string" ? (
            <Image
              src={URL.createObjectURL(form.profilePic)}
              roundedCircle
              width={100}
              height={100}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "#f68b1f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            >
              {getInitials(form.name)}
            </div>
          )}
        </div>

        {!editMode ? (
          <>
            <Row className="text-center mb-3">
              <Col md={6} className="mb-2">
                <h5 className="mb-1">
                  <strong>Name:</strong>
                </h5>
                <p>{userData.name}</p>
              </Col>
              <Col md={6} className="mb-2">
                <h5 className="mb-1">
                  <strong>Email:</strong>
                </h5>
                <p className="text-muted">{userData.email}</p>
              </Col>
            </Row>

            <div className="d-flex justify-content-between">
              <Button variant="warning" onClick={() => setEditMode(true)}>
                <FaEdit className="me-2" />
                Edit Profile
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </Button>
            </div>
          </>
        ) : (
          <Form encType="multipart/form-data">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={userData.email} disabled />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Upload Profile Picture</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <div>
                <Button variant="primary" onClick={handleSubmit}>
                  Save Changes
                </Button>{" "}
                <Button
                  variant="secondary"
                  className="ms-2"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
              <div>
                <Button
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
                <Button variant="outline-danger" onClick={handleDelete}>
                  Delete Account
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Card>

      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordChange}>
            Update Password
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Profile;
