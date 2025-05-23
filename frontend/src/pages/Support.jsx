import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Accordion,
  Button,
  Form,
  Modal,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faCommentDots,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

const helpTopics = [
  {
    title: "Order Issues",
    description: "Problems with your recent order?",
    id: "order",
  },
  {
    title: "Delivery Status",
    description: "Track your delivery.",
    id: "delivery",
  },
  {
    title: "Payments & Refunds",
    description: "Payment issues or need a refund?",
    id: "payments",
  },
  {
    title: "Account Help",
    description: "Login or profile issues.",
    id: "account",
  },
  {
    title: "Missing Items",
    description: "Something missing from your order?",
    id: "missing",
  },
  {
    title: "Feedback & Suggestions",
    description: "We'd love your feedback!",
    id: "feedback",
  },
];

const faqs = [
  {
    question: "How do I cancel my order?",
    answer:
      "Go to your orders, select the order you want to cancel, and click on 'Cancel Order'. If the food is already being prepared, cancellation might not be possible.",
  },
  {
    question: "When will my order arrive?",
    answer:
      "Average delivery time is 30–45 minutes, but it may vary depending on location and traffic.",
  },
  {
    question: "How can I request a refund?",
    answer:
      "If there's a problem with your order, contact support through chat or email. Refunds are processed within 3–5 business days.",
  },
];

const Support = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleTopicClick = (topicId) => {
    const topic = helpTopics.find((t) => t.id === topicId);
    setSelectedTopic(topic);
    setShowModal(true);
  };

  const handleSubmitMessage = async () => {
    const isFeedback = selectedTopic?.id === "feedback";

    try {
      await axios.post("https://swadist.onrender.com/api/support/messages", {
        topic: selectedTopic.title,
        type: isFeedback ? "feedback" : "issue",
        name,
        email,
        phone,
        message,
      });

      setShowModal(false);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setAlertMessage(
        isFeedback
          ? "Thank you for your feedback!"
          : "Your message has been sent successfully!"
      );
    } catch (error) {
      console.error("Error submitting message:", error);
      setAlertMessage("Failed to send message. Please try again later.");
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const isFeedback = selectedTopic?.id === "feedback";

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4" style={{ color: "#e37000" }}>
        How can we help you?
      </h2>

      {alertMessage && (
        <Alert
          variant="success"
          onClose={() => setAlertMessage("")}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}

      <Row className="mb-5 g-4">
        {helpTopics.map((item, idx) => (
          <Col key={idx} xs={12} md={4}>
            <Card
              className="h-100 shadow-sm clickable"
              onClick={() => handleTopicClick(item.id)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center">
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  size="2x"
                  className="mb-3"
                  style={{ color: "#e37000" }}
                />
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h4 className="mb-3">Frequently Asked Questions</h4>
      <Accordion defaultActiveKey="0" className="mb-5">
        {faqs.map((faq, idx) => (
          <Accordion.Item eventKey={idx.toString()} key={idx}>
            <Accordion.Header>{faq.question}</Accordion.Header>
            <Accordion.Body>{faq.answer}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <h4 className="mb-3">Contact Us</h4>
      <Row className="text-center">
        <Col md={4} className="mb-3">
          <FontAwesomeIcon
            icon={faPhone}
            size="lg"
            className="mb-2"
            style={{ color: "#e37000" }}
          />
          <p>+91-6371308299</p>
        </Col>
        <Col md={4} className="mb-3">
          <FontAwesomeIcon
            icon={faEnvelope}
            size="lg"
            className="mb-2"
            style={{ color: "#e37000" }}
          />
          <p>support@swadist.com</p>
        </Col>
        <Col md={4} className="mb-3">
          <FontAwesomeIcon
            icon={faCommentDots}
            size="lg"
            className="mb-2"
            style={{ color: "#e37000" }}
          />
          <p>Live Chat (Coming Soon)</p>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isFeedback
              ? "We’d love your feedback!"
              : `Submit Your Issue: ${selectedTopic?.title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {isFeedback ? "Your Feedback" : "Describe the issue"}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={
                  isFeedback
                    ? "Tell us what you loved or what we can improve..."
                    : "Describe your issue in detail..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleSubmitMessage}
              disabled={
                !name.trim() ||
                !email.trim() ||
                !phone.trim() ||
                !message.trim()
              }
            >
              {isFeedback ? "Send Feedback" : "Submit"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Support;
