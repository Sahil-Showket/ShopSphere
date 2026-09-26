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


const {
    cancelOrder
} = require("../controllers/order-cancel.controller");


const requireInternalService =
    require("../middleware/internal.middleware");

const {
    confirmOrderAfterPayment
} = require("../controllers/internal-order.controller");

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

router.patch(
    "/:id/confirm-payment",
    requireInternalService,
    confirmOrderAfterPayment
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

router.patch(
    "/:id/cancel",
    authenticateToken,
    cancelOrder
);




module.exports = router;