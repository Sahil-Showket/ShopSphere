const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const VALID_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
];

const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new AppError(
                "Invalid order ID",
                400
            );
        }

        if (!VALID_STATUSES.includes(status)) {
            throw new AppError(
                "Invalid order status",
                400
            );
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            }
        });

        if (!order) {
            throw new AppError(
                "Order not found",
                404
            );
        }

        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                status
            },
            include: {
                items: true
            }
        });

        res.status(200).json(updatedOrder);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateOrderStatus
};