const axios = require("axios");
const AppError = require("../utils/AppError");

const CART_SERVICE_URL =
    process.env.CART_SERVICE_URL || "http://localhost:3002";

const getCart = async (token) => {
    try {
        const response = await axios.get(
            `${CART_SERVICE_URL}/cart`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {
        if (error.response) {
            throw new AppError(
                error.response.data?.message || "Unable to retrieve cart",
                error.response.status
            );
        }

        throw new AppError(
            "Cart service unavailable",
            503
        );
    }
};

module.exports = {
    getCart
};