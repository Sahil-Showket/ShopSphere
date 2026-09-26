const crypto = require("crypto");

const processPayment = async (amount) => {
    // Mock payment processing
    const transactionId =
        `TXN-${crypto.randomUUID()}`;

    return {
        success: true,
        transactionId,
        amount
    };
};

module.exports = {
    processPayment
};