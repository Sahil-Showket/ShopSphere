const crypto = require("crypto");

const processPayment = async (amount) => {

    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new Error("Invalid payment amount");
    }

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