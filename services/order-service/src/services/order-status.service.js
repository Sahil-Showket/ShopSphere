const AppError = require("../utils/AppError");

const STATUS_TRANSITIONS = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: []
};

const validateStatusTransition = (currentStatus, newStatus) => {
    const allowedStatuses =
        STATUS_TRANSITIONS[currentStatus];

    if (!allowedStatuses) {
        throw new AppError(
            `Unknown current order status: ${currentStatus}`,
            500
        );
    }

    if (!allowedStatuses.includes(newStatus)) {
        throw new AppError(
            `Cannot change order status from ${currentStatus} to ${newStatus}`,
            400
        );
    }
};

module.exports = {
    validateStatusTransition
};