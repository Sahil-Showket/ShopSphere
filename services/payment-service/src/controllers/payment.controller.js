const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const {
    processPayment
} = require("../services/payment.service");

const createPayment = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const {
            orderId,
            amount
        } = req.body;

        const parsedOrderId = Number(orderId);
        const parsedAmount = Number(amount);

        if (
            !Number.isInteger(parsedOrderId) ||
            parsedOrderId <= 0
        ) {
            throw new AppError(
                "Invalid order ID",
                400
            );
        }

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {
            throw new AppError(
                "Invalid payment amount",
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

        const paymentResult =
            await processPayment(parsedAmount);

        const payment =
            await prisma.payment.create({
                data: {
                    userId,
                    orderId: parsedOrderId,
                    amount: parsedAmount,
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