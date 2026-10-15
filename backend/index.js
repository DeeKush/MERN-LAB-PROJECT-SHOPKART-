import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config();


const app = express();


// Middleware

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// Routes

app.use(
    "/customers",
    customerRoutes
);

app.use(
    "/products",
    productRoutes
);

app.use(
    "/wishlist",
    wishlistRoutes
);

app.use(
    "/cart",
    cartRoutes
);

app.use(
    "/orders",
    orderRoutes
);

// MongoDB connection

mongoose
    .connect(process.env.dbURL)
    .then(() => {
        console.log("DB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });


// Server

const PORT = process.env.PORT || 8088;

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});