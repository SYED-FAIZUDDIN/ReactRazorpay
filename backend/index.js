const express = require("express");
const Razorpay = require("Razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT; // port number for the server

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

/*
  To create a order for razorpay
  - Send a POST request to the "/orders" endpoint with 
    the required parameters (amount, currency, receipt, etc.)
*/
app.post("/orders", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const options = req.body;
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).send("Error");
    }
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
});

/*
  To validate the transaction
  - Send a POST request to the "/orders/validate" endpoint with 
    the required parameters (razorpay_payment_id, razorpay_order_id, razorpay_signature)
*/
app.post("/orders/validate", async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest != razorpay_signature) {
    return res.status(400).json({ message: "Transaction is not legit!" });
  }
  return res.json({
    message: "success",
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
