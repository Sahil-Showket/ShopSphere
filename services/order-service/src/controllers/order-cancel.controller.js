const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const cancelOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new AppError(
                "Invalid order ID",
                400
            );
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                items: true
            }
        });

        if (!order) {
            throw new AppError(
                "Order not found",
                404
            );
        }

        if (order.userId !== userId) {
            throw new AppError(
                "You are not allowed to cancel this order",
                403
            );
        }

        if (
            order.status !== "PENDING" &&
            order.status !== "CONFIRMED"
        ) {
            throw new AppError(
                `Order cannot be cancelled when status is ${order.status}`,
                400
            );
        }

        const cancelledOrder =
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status: "CANCELLED"
                },
                include: {
                    items: true
                }
            });

        res.status(200).json(cancelledOrder);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    cancelOrder
};