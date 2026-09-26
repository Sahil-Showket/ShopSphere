const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const {
    createPayment,
    getMyPayments,
    getPaymentById
} = require("../controllers/payment.controller");


router.post(
    "/",
    authenticateToken,
    createPayment
);


router.get(
    "/",
    authenticateToken,
    getMyPayments
);


router.get(
    "/:id",
    authenticateToken,
    getPaymentById
);


module.exports = router;