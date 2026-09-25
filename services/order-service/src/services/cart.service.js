const axios = require("axios");

const CART_SERVICE_URL =
    process.env.CART_SERVICE_URL || "http://localhost:3002";

const getCart = async (token) => {
    const response = await axios.get(
        `${CART_SERVICE_URL}/cart`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

module.exports = {
    getCart
};