const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");

const {
    createOrder
} = require("../controllers/order.controller");

router.post(
    "/",
    authenticateToken,
    createOrder
);

module.exports = router;