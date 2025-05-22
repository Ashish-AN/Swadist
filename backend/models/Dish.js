const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: String,
  price: String,
  category: String,
  image: String,
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
});

module.exports = mongoose.model("Dish", dishSchema);
