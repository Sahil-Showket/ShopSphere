const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
    createOrder,
    getMyOrders,
    getOrderById
} = require("../controllers/order.controller");

const {
    updateOrderStatus
} = require("../controllers/order-status.controller");


router.post(
    "/",
    authenticateToken,
    createOrder
);


router.get(
    "/",
    authenticateToken,
    getMyOrders
);


router.get(
    "/:id",
    authenticateToken,
    getOrderById
);


router.patch(
    "/:id/status",
    authenticateToken,
    requireAdmin,
    updateOrderStatus
);


module.exports = router;