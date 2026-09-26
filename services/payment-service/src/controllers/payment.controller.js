const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const {
    processPayment
} = require("../services/payment.service");

const {
    getOrderById
} = require("../services/order.service");

const createPayment = async (req, res, next) => {
    try {

        const userId = req.user.userId;

        const {
            orderId
        } = req.body;

        const parsedOrderId = Number(orderId);

        if (
            !Number.isInteger(parsedOrderId) ||
            parsedOrderId <= 0
        ) {
            throw new AppError(
                "Invalid order ID",
                400
            );
        }

        /*
         * Get the real order from Order Service.
         * We intentionally DO NOT accept amount
         * from the client.
         */

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            throw new AppError(
                "Authorization header missing",
                401
            );
        }

        const token =
            authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(
                "Token missing",
                401
            );
        }

        const order =
            await getOrderById(
                parsedOrderId,
                token
            );

        /*
         * Extra ownership check.
         */

        if (order.userId !== userId) {
            throw new AppError(
                "You are not allowed to pay for this order",
                403
            );
        }

        /*
         * Prevent payment for cancelled orders.
         */

        if (order.status === "CANCELLED") {
            throw new AppError(
                "Cannot pay for a cancelled order",
                400
            );
        }

        /*
         * Prevent paying an already delivered order.
         */

        if (order.status === "DELIVERED") {
            throw new AppError(
                "Order has already been completed",
                400
            );
        }

        const existingPayment =
            await prisma.payment.findUnique({
                where: {
                    orderId: parsedOrderId
                }
            });

        if (existingPayment) {
            throw new AppError(
                "Payment already exists for this order",
                409
            );
        }

        /*
         * IMPORTANT:
         * Amount comes from Order Service.
         */

        const amount = order.total;

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new AppError(
                "Invalid order total",
                500
            );
        }

        const paymentResult =
            await processPayment(amount);

        const payment =
            await prisma.payment.create({
                data: {
                    userId,
                    orderId: parsedOrderId,
                    amount,
                    status: paymentResult.success
                        ? "SUCCESS"
                        : "FAILED",
                    transactionId:
                        paymentResult.transactionId
                }
            });

        res.status(201).json(payment);

    } catch (error) {
        next(error);
    }
};


const getMyPayments = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const payments =
            await prisma.payment.findMany({
                where: {
                    userId
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

        res.status(200).json({
            payments
        });

    } catch (error) {
        next(error);
    }
};


const getPaymentById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const paymentId = Number(req.params.id);

        if (
            !Number.isInteger(paymentId) ||
            paymentId <= 0
        ) {
            throw new AppError(
                "Invalid payment ID",
                400
            );
        }

        const payment =
            await prisma.payment.findUnique({
                where: {
                    id: paymentId
                }
            });

        if (!payment) {
            throw new AppError(
                "Payment not found",
                404
            );
        }

        if (payment.userId !== userId) {
            throw new AppError(
                "You are not allowed to access this payment",
                403
            );
        }

        res.status(200).json(payment);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createPayment,
    getMyPayments,
    getPaymentById
};