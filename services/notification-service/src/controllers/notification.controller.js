const prisma =
    require("../config/prisma");

const AppError =
    require("../utils/AppError");

const {
    sendNotification
} = require("../services/notification.service");


const createNotification = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const {
            type,
            title,
            message
        } = req.body;


        if (
            typeof type !== "string" ||
            !type.trim()
        ) {
            throw new AppError(
                "Notification type is required",
                400
            );
        }


        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            throw new AppError(
                "Notification title is required",
                400
            );
        }


        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            throw new AppError(
                "Notification message is required",
                400
            );
        }


        const notification =
            await prisma.notification.create({
                data: {
                    userId,
                    type: type.trim(),
                    title: title.trim(),
                    message: message.trim()
                }
            });


        await sendNotification({
            type: notification.type,
            title: notification.title,
            message: notification.message
        });


        res.status(201).json(
            notification
        );

    } catch (error) {
        next(error);
    }
};


const getMyNotifications = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const notifications =
            await prisma.notification.findMany({
                where: {
                    userId
                },
                orderBy: {
                    createdAt: "desc"
                }
            });


        res.status(200).json({
            notifications
        });

    } catch (error) {
        next(error);
    }
};


const getNotificationById = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const notificationId =
            Number(req.params.id);


        if (
            !Number.isInteger(
                notificationId
            ) ||
            notificationId <= 0
        ) {
            throw new AppError(
                "Invalid notification ID",
                400
            );
        }


        const notification =
            await prisma.notification.findUnique({
                where: {
                    id: notificationId
                }
            });


        if (!notification) {
            throw new AppError(
                "Notification not found",
                404
            );
        }


        if (
            notification.userId !== userId
        ) {
            throw new AppError(
                "You are not allowed to access this notification",
                403
            );
        }


        res.status(200).json(
            notification
        );

    } catch (error) {
        next(error);
    }
};


const markNotificationAsRead = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const notificationId =
            Number(req.params.id);


        if (
            !Number.isInteger(
                notificationId
            ) ||
            notificationId <= 0
        ) {
            throw new AppError(
                "Invalid notification ID",
                400
            );
        }


        const notification =
            await prisma.notification.findUnique({
                where: {
                    id: notificationId
                }
            });


        if (!notification) {
            throw new AppError(
                "Notification not found",
                404
            );
        }


        if (
            notification.userId !== userId
        ) {
            throw new AppError(
                "You are not allowed to modify this notification",
                403
            );
        }


        const updatedNotification =
            await prisma.notification.update({
                where: {
                    id: notificationId
                },
                data: {
                    status: "READ"
                }
            });


        res.status(200).json(
            updatedNotification
        );

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createNotification,
    getMyNotifications,
    getNotificationById,
    markNotificationAsRead
};