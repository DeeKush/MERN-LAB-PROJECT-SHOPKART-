import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required." });
    }

    const requiredFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    for (const field of requiredFields) {
      const value = shippingAddress[field];
      if (!value || String(value).trim() === "") {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }

    if (!/^[6-9]\d{9}$/.test(String(shippingAddress.phone).trim())) {
      return res.status(400).json({ success: false, message: "Enter 10 digits, starting with 6, 7, 8, or 9." });
    }

    if (!/^\d{6}$/.test(String(shippingAddress.pincode).trim())) {
      return res.status(400).json({ success: false, message: "Pincode must contain 6 digits." });
    }

    const customer = await Customer.findById(req.user._id).populate("cart.product");
    if (!customer || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product._id || cartItem.product);
      if (!product) {
        return res.status(400).json({ success: false, message: "One or more products are no longer available." });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Razorpay Test API keys are not configured yet. Add your Razorpay key and secret in backend/.env to enable checkout.",
      });
    }

    const newOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: String(newOrder._id),
    });

    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Order creation failed.", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification data." });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      order.status = "PENDING_PAYMENT";
      await order.save();
      return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const user = await Customer.findById(req.user._id);
    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Payment verification failed.", error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load orders.", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not allowed to access this order." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load order.", error: error.message });
  }
};
