const express =
    require("express");

const router =
    express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
} = require("../controllers/cart.controller");

router.get(
    "/",
    authenticateToken,
    getCart
);

router.post(
    "/items",
    authenticateToken,
    addToCart
);

router.patch(
    "/items/:productId",
    authenticateToken,
    updateCartItem
);

router.delete(
    "/items/:productId",
    authenticateToken,
    removeCartItem
);

module.exports = router;