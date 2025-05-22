import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Form,
  Pagination,
} from "react-bootstrap";
import jsPDF from "jspdf";
import "../styles/Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9090/api/orders/${user.userId}`
      );
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user.userId]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.put(`http://localhost:9090/api/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  const downloadInvoice = (order) => {
    const doc = new jsPDF();

    const logoImg = new Image();
    logoImg.src = `${window.location.origin}/logo.png`;

    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", 150, 10, 40, 40);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Swadist Order Invoice", 20, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Order ID: ${order._id}`, 20, 35);
      doc.text(`Name: ${order.name}`, 20, 43);
      doc.text(`Address: ${order.address}`, 20, 51);
      doc.text(`Phone: ${order.phone}`, 20, 59);
      doc.text(`Payment ID: ${order.paymentId || "N/A"}`, 20, 67);
      doc.text(`Status: ${order.status}`, 20, 75);
      doc.text(
        `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        20,
        83
      );

      let y = 95;
      doc.setFont("helvetica", "bold");
      doc.text("Dish", 20, y);
      doc.text("Qty", 100, y);
      doc.text("Subtotal", 130, y);
      doc.setLineWidth(0.1);
      doc.line(20, y + 2, 180, y + 2);

      doc.setFont("helvetica", "normal");
      order.items.forEach((item) => {
        y += 10;
        const dish = item.dishId?.name || "Unknown Dish";
        const qty = item.quantity;
        const rawPrice = item.dishId?.price;
        const price =
          typeof rawPrice === "string"
            ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
            : rawPrice || 0;
        const subtotal = price * qty;

        doc.text(dish, 20, y);
        doc.text(String(qty), 100, y);
        doc.text(`Rs. ${subtotal.toFixed(2)}`, 130, y);
      });

      y += 15;
      doc.setFont("helvetica", "bold");
      doc.text(`Total: Rs. ${order.total.toFixed(2)}`, 20, y);

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Thank you for ordering with Swadist!", 20, 285);

      doc.save(`invoice_${order._id}.pdf`);
    };
  };

  const applyDateFilter = () => {
    axios
      .get(`http://localhost:9090/api/orders/${user.userId}`)
      .then((res) => {
        let filtered = res.data;
        if (startDate) {
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) >= new Date(startDate)
          );
        }
        if (endDate) {
          filtered = filtered.filter(
            (order) => new Date(order.createdAt) <= new Date(endDate)
          );
        }
        const sorted = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      })
      .catch((err) => console.error("Error filtering orders:", err));
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="mt-5">
      <h3 style={{ color: "#e37000" }}>Your Orders</h3>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>
        <Col md={4} className="d-flex align-items-end gap-2">
          <Button variant="outline-primary" onClick={applyDateFilter}>
            Apply Filter
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              fetchOrders();
            }}
          >
            Reset
          </Button>
        </Col>
      </Row>

      {orders.length === 0 ? (
        <div className="orders-not-found"></div>
      ) : (
        <>
          {currentOrders.map((order, idx) => (
            <Card key={order._id} className="mb-4">
              <Card.Body>
                <Row className="mb-3 justify-content-between align-items-center">
                  <Col>
                    <h5 className="mb-0" style={{ color: "#e37000" }}>
                      Order #{indexOfFirstOrder + idx + 1}
                    </h5>
                    <small className="text-muted">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </small>
                  </Col>
                  <Col md="auto">
                    <Badge
                      bg={
                        order.status === "Delivered"
                          ? "success"
                          : order.status === "Cancelled"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {order.status}
                    </Badge>
                  </Col>
                </Row>

                <hr />

                <Row className="mb-3">
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Name:</strong> {order.name || "-"}
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {order.phone || "-"}
                    </p>
                    <p className="mb-1">
                      <strong>Address:</strong> {order.address || "-"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Payment ID:</strong> {order.paymentId || "N/A"}
                    </p>
                    <p className="mb-1">
                      <strong>Total:</strong> ₹{order.total}
                    </p>
                  </Col>
                </Row>

                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Dish</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.dishId?.name || "Unknown Dish"}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => downloadInvoice(order)}
                  >
                    Download Invoice
                  </Button>

                  {order.status === "Pending" && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}

          {totalPages > 1 && (
            <Pagination>
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
}

export default Orders;
