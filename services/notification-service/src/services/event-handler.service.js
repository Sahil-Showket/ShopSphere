const prisma = require("../config/prisma");

const handlePaymentSuccess = async (data) => {

    const {
        userId,
        orderId,
        amount,
        transactionId
    } = data;

    const existing =
        await prisma.notification.findFirst({
            where: {
                userId,
                type: "PAYMENT_SUCCESS",
                message: {
                    contains:
                        `Order #${orderId}`
                }
            }
        });

    if (existing) {
        console.log(
            `Notification already exists for payment of order ${orderId}`
        );

        return;
    }

    const notification =
        await prisma.notification.create({
            data: {
                userId,
                type: "PAYMENT_SUCCESS",
                title: "Payment Successful",
                message:
                    `Payment of ₹${amount} for Order #${orderId} was successful. Transaction ID: ${transactionId}`
            }
        });

    console.log(
        "Payment notification created:",
        notification.id
    );
};


const handleOrderConfirmed = async (data) => {

    const {
        userId,
        orderId
    } = data;

    const existing =
        await prisma.notification.findFirst({
            where: {
                userId,
                type: "ORDER_CONFIRMED",
                message: {
                    contains:
                        `Order #${orderId}`
                }
            }
        });

    if (existing) {
        console.log(
            `Notification already exists for order ${orderId}`
        );

        return;
    }

    const notification =
        await prisma.notification.create({
            data: {
                userId,
                type: "ORDER_CONFIRMED",
                title: "Order Confirmed",
                message:
                    `Your Order #${orderId} has been confirmed.`
            }
        });

    console.log(
        "Order confirmation notification created:",
        notification.id
    );
};


const handleEvent = async (event) => {

    switch (event.eventType) {

        case "payment.success":
            await handlePaymentSuccess(
                event.data
            );
            break;

        case "order.confirmed":
            await handleOrderConfirmed(
                event.data
            );
            break;

        default:
            console.log(
                `Ignoring unsupported event: ${event.eventType}`
            );
    }
};


module.exports = {
    handleEvent
};