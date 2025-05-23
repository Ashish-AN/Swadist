const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const User = require("../models/user");
const { register, login } = require("../controllers/authController");
const Restaurant = require("../models/Restaurant");
const Dish = require("../models/Dish");
const Cart = require("../models/Cart");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const SupportMessage = require("../models/SupportMessage");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
});

router.put("/users/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      phone: req.body.phone || "",
      dob: req.body.dob || "",
      gender: req.body.gender || "",
    };

    if (req.file) {
      updateData.profilePic = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
});
router.put("/users/:id/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Current password is incorrect" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

router.post("/register", register);
router.post("/login", login);

router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
});

router.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant", error });
  }
});

router.get("/dishes", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const filter = restaurantId ? { restaurantId } : {};
    const dishes = await Dish.find(filter).populate("restaurantId");
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dishes" });
  }
});

router.get("/cart/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.dishId"
    );
    if (!cart) {
      return res.status(200).json({ items: [], totalPrice: 0 });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
});

router.post("/cart", async (req, res) => {
  const { userId, restaurantId, dishId, quantity, price } = req.body;
  const numericPrice =
    typeof price === "string"
      ? parseFloat(price.replace(/[^\d.]/g, ""))
      : price;

  if (!userId || !dishId || !quantity || isNaN(numericPrice)) {
    return res.status(400).json({ message: "Invalid cart input" });
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      restaurantId,
      items: [{ dishId, quantity, price: numericPrice }],
      totalPrice: numericPrice * quantity,
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.dishId.toString() === dishId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ dishId, quantity, price: numericPrice });
    }
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  await cart.save();
  res.status(200).json(cart);
});

router.put("/cart/:userId", async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { items },
      { new: true }
    );

    if (!cart) return res.status(200).json({ items: [], totalPrice: 0 });

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error });
  }
});

router.delete("/cart/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart", error });
  }
});

router.get("/cart/:userId/total", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.dishId"
    );
    if (!cart) return res.status(200).json({ totalPrice: 0 });

    const totalPrice = cart.items.reduce((total, item) => {
      const rawPrice = item.dishId?.price;
      const price =
        typeof rawPrice === "string"
          ? parseFloat(rawPrice.replace(/[^\d.]/g, ""))
          : rawPrice || 0;
      return total + price * item.quantity;
    }, 0);

    res.status(200).json({ totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error calculating total price", error });
  }
});

router.post("/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Order failed", error: err });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ message: "Failed to place order", error: err });
  }
});

router.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate(
      "items.dishId"
    );
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err });
  }
});
router.put("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Cancel failed", error: err });
  }
});
router.post("/support/messages", async (req, res) => {
  const { topic, type, name, email, phone, message } = req.body;

  if (!topic || !type || !name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newMessage = new SupportMessage({
      topic,
      type,
      name,
      email,
      phone,
      message,
    });

    await newMessage.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

module.exports = router;
