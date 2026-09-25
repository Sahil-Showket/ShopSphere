const axios = require("axios");
const AppError = require("../utils/AppError");

const PRODUCT_SERVICE_URL =
    process.env.PRODUCT_SERVICE_URL || "http://localhost:3000";

const getProductById = async (productId) => {
    try {
        const response = await axios.get(
            `${PRODUCT_SERVICE_URL}/products/${productId}`
        );

        return response.data.product;

    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                throw new AppError(
                    `Product ${productId} does not exist`,
                    404
                );
            }

            throw new AppError(
                error.response.data?.message || "Product service error",
                error.response.status
            );
        }

        throw new AppError(
            "Product service unavailable",
            503
        );
    }
};

module.exports = {
    getProductById
};