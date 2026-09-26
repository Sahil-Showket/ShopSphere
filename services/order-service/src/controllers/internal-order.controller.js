const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const confirmOrderAfterPayment = async (
    req,
    res,
    next
) => {
    try {
        const orderId = Number(req.params.id);

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {
            throw new AppError(
                "Invalid order ID",
                400
            );
        }

        const order =
            await prisma.order.findUnique({
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

        if (order.status === "CONFIRMED") {
            return res.status(200).json(order);
        }

        if (order.status !== "PENDING") {
            throw new AppError(
                `Order cannot be confirmed from status ${order.status}`,
                400
            );
        }

        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status: "CONFIRMED"
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
    confirmOrderAfterPayment
};