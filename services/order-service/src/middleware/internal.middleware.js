const AppError = require("../utils/AppError");

const requireInternalService = (req, res, next) => {
    const serviceSecret =
        req.headers["x-service-secret"];

    if (!serviceSecret) {
        return next(
            new AppError(
                "Service authentication required",
                401
            )
        );
    }

    if (
        serviceSecret !==
        process.env.INTERNAL_SERVICE_SECRET
    ) {
        return next(
            new AppError(
                "Invalid service credentials",
                403
            )
        );
    }

    next();
};

module.exports = requireInternalService;