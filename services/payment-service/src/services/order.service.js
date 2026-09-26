const axios = require("axios");
const AppError = require("../utils/AppError");

const ORDER_SERVICE_URL =
    process.env.ORDER_SERVICE_URL ||
    "http://localhost:3003";

const getOrderById = async (orderId, token) => {
    try {

        const response = await axios.get(
            `${ORDER_SERVICE_URL}/orders/${orderId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {

        if (error.response) {

            if (error.response.status === 404) {
                throw new AppError(
                    "Order not found",
                    404
                );
            }

            if (error.response.status === 403) {
                throw new AppError(
                    "You are not allowed to access this order",
                    403
                );
            }

            throw new AppError(
                error.response.data?.message ||
                "Order service error",
                error.response.status
            );
        }

        throw new AppError(
            "Order service unavailable",
            503
        );
    }
};

const confirmOrderAfterPayment = async (orderId) => {
    try {
        const response = await axios.patch(
            `${ORDER_SERVICE_URL}/orders/${orderId}/confirm-payment`,
            {},
            {
                headers: {
                    "x-service-secret":
                        process.env.INTERNAL_SERVICE_SECRET
                }
            }
        );

        return response.data;

    } catch (error) {
        if (error.response) {
            throw new AppError(
                error.response.data?.message ||
                "Unable to confirm order",
                error.response.status
            );
        }

        throw new AppError(
            "Order service unavailable",
            503
        );
    }
};

module.exports = {
    getOrderById,
    confirmOrderAfterPayment
};