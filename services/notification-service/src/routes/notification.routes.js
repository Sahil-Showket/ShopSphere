const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");

const {
    createNotification,
    getMyNotifications,
    getNotificationById,
    markNotificationAsRead
} = require(
    "../controllers/notification.controller"
);


router.post(
    "/",
    authenticateToken,
    createNotification
);


router.get(
    "/",
    authenticateToken,
    getMyNotifications
);


router.get(
    "/:id",
    authenticateToken,
    getNotificationById
);


router.patch(
    "/:id/read",
    authenticateToken,
    markNotificationAsRead
);


module.exports = router;