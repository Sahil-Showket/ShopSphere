const axios = require("axios");

const PRODUCT_SERVICE_URL =
    process.env.PRODUCT_SERVICE_URL ||
    "http://localhost:3000";

const getProductById = async (productId) => {

    const response = await axios.get(
        `${PRODUCT_SERVICE_URL}/products/${productId}`,
        {
            timeout: 5000
        }
    );

    return response.data;
};

module.exports = {
    getProductById
};