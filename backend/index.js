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
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));

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

const PORT = 8088

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});