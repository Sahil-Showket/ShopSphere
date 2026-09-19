const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");

const {
    getCart,
    addToCart
} = require("../controllers/cart.controller");

router.get("/", authenticateToken, getCart);

router.post("/items", authenticateToken, addToCart);

module.exports = router;