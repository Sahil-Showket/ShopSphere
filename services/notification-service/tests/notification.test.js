const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../src/services/notification.service", () => ({
    sendNotification: jest.fn()
}));

const {
    sendNotification
} = require("../src/services/notification.service");

const app = require("../src/server");

const prisma =
    require("../src/config/prisma");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "shopsphere_super_secret_change_later";

const userId = 999;

const otherUserId = 1000;

const token = jwt.sign(
    {
        userId,
        email: "notification-test@example.com",
        role: "user"
    },
    JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

const otherUserToken = jwt.sign(
    {
        userId: otherUserId,
        email: "other-user@example.com",
        role: "user"
    },
    JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

const authHeader =
    `Bearer ${token}`;

describe("Notification Service API", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    afterAll(async () => {

        await prisma.notification.deleteMany({
            where: {
                userId: {
                    in: [
                        userId,
                        otherUserId
                    ]
                }
            }
        });

        await prisma.$disconnect();
    });


    // ----------------------------------------
    // HEALTH
    // ----------------------------------------

    test(
        "GET /health should return service health",
        async () => {

            const response =
                await request(app)
                    .get("/health");

            expect(response.statusCode)
                .toBe(200);

            expect(response.body)
                .toEqual({
                    service:
                        "notification-service",

                    status:
                        "UP"
                });
        }
    );


    // ----------------------------------------
    // ROOT
    // ----------------------------------------

    test(
        "GET / should return service message",
        async () => {

            const response =
                await request(app)
                    .get("/");

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.message)
                .toBe(
                    "ShopSphere Notification Service"
                );
        }
    );


    // ----------------------------------------
    // AUTHENTICATION
    // ----------------------------------------

    test(
        "GET /notifications should reject missing authorization",
        async () => {

            const response =
                await request(app)
                    .get("/notifications");

            expect(response.statusCode)
                .toBe(401);

            expect(response.body.message)
                .toBe(
                    "Authorization header missing"
                );
        }
    );


    test(
        "GET /notifications should reject invalid token",
        async () => {

            const response =
                await request(app)
                    .get("/notifications")
                    .set(
                        "Authorization",
                        "Bearer invalid-token"
                    );

            expect(response.statusCode)
                .toBe(401);

            expect(response.body.message)
                .toBe(
                    "Invalid or expired token"
                );
        }
    );


    // ----------------------------------------
    // CREATE NOTIFICATION
    // ----------------------------------------

    test(
        "POST /notifications should create notification",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: "ORDER",
                        title: "Order Confirmed",
                        message:
                            "Your order has been confirmed"
                    });

            expect(response.statusCode)
                .toBe(201);

            expect(response.body.userId)
                .toBe(userId);

            expect(response.body.type)
                .toBe("ORDER");

            expect(response.body.title)
                .toBe("Order Confirmed");

            expect(response.body.message)
                .toBe(
                    "Your order has been confirmed"
                );

            expect(response.body.status)
                .toBe("UNREAD");

            expect(sendNotification)
                .toHaveBeenCalledTimes(1);

            expect(sendNotification)
                .toHaveBeenCalledWith({
                    type: "ORDER",
                    title: "Order Confirmed",
                    message:
                        "Your order has been confirmed"
                });
        }
    );


    test(
        "POST /notifications should reject missing type",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        title: "Test",
                        message: "Test message"
                    });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Notification type is required"
                );
        }
    );


    test(
        "POST /notifications should reject empty type",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: "   ",
                        title: "Test",
                        message: "Test message"
                    });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Notification type is required"
                );
        }
    );


    test(
        "POST /notifications should reject missing title",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: "ORDER",
                        message: "Test message"
                    });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Notification title is required"
                );
        }
    );


    test(
        "POST /notifications should reject empty title",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: "ORDER",
                        title: "   ",
                        message: "Test message"
                    });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Notification title is required"
                );
        }
    );


    test(
        "POST /notifications should reject missing message",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: "ORDER",
                        title: "Test"
                    });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Notification message is required"
                );
        }
    );


    test(
        "POST /notifications should reject empty message",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: "ORDER",
                        title: "Test",
                        message: "   "
                    });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Notification message is required"
                );
        }
    );


    test(
        "POST /notifications should trim notification fields",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    )
                    .send({
                        type: " ORDER ",
                        title: " Order Created ",
                        message:
                            " Order created successfully "
                    });

            expect(response.statusCode)
                .toBe(201);

            expect(response.body.type)
                .toBe("ORDER");

            expect(response.body.title)
                .toBe("Order Created");

            expect(response.body.message)
                .toBe(
                    "Order created successfully"
                );
        }
    );


    // ----------------------------------------
    // GET MY NOTIFICATIONS
    // ----------------------------------------

    test(
        "GET /notifications should return current user's notifications",
        async () => {

            const response =
                await request(app)
                    .get("/notifications")
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(200);

            expect(
                Array.isArray(
                    response.body.notifications
                )
            ).toBe(true);

            expect(
                response.body.notifications.length
            ).toBeGreaterThan(0);

            response.body.notifications.forEach(
                (notification) => {

                    expect(
                        notification.userId
                    ).toBe(userId);

                }
            );
        }
    );


    // ----------------------------------------
    // GET BY ID
    // ----------------------------------------

    test(
        "GET /notifications/:id should return user's notification",
        async () => {

            const notification =
                await prisma.notification.create({
                    data: {
                        userId,
                        type: "TEST",
                        title: "Test Notification",
                        message:
                            "Test notification message"
                    }
                });

            const response =
                await request(app)
                    .get(
                        `/notifications/${notification.id}`
                    )
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.id)
                .toBe(notification.id);

            expect(response.body.userId)
                .toBe(userId);

            expect(response.body.type)
                .toBe("TEST");
        }
    );


    test(
        "GET /notifications/:id should reject invalid notification ID",
        async () => {

            const response =
                await request(app)
                    .get(
                        "/notifications/abc"
                    )
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Invalid notification ID"
                );
        }
    );


    test(
        "GET /notifications/:id should return 404 for missing notification",
        async () => {

            const response =
                await request(app)
                    .get(
                        "/notifications/999999999"
                    )
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(404);

            expect(response.body.message)
                .toBe(
                    "Notification not found"
                );
        }
    );


    test(
        "GET /notifications/:id should prevent another user from accessing notification",
        async () => {

            const notification =
                await prisma.notification.create({
                    data: {
                        userId,
                        type: "PRIVATE",
                        title: "Private Notification",
                        message: "Private message"
                    }
                });

            const response =
                await request(app)
                    .get(
                        `/notifications/${notification.id}`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${otherUserToken}`
                    );

            expect(response.statusCode)
                .toBe(403);

            expect(response.body.message)
                .toBe(
                    "You are not allowed to access this notification"
                );
        }
    );


    // ----------------------------------------
    // MARK AS READ
    // ----------------------------------------

    test(
        "PATCH /notifications/:id/read should mark notification as read",
        async () => {

            const notification =
                await prisma.notification.create({
                    data: {
                        userId,
                        type: "ORDER",
                        title: "Unread Notification",
                        message:
                            "Please read this notification"
                    }
                });

            expect(notification.status)
                .toBe("UNREAD");

            const response =
                await request(app)
                    .patch(
                        `/notifications/${notification.id}/read`
                    )
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.id)
                .toBe(notification.id);

            expect(response.body.status)
                .toBe("READ");
        }
    );


    test(
        "PATCH /notifications/:id/read should reject invalid notification ID",
        async () => {

            const response =
                await request(app)
                    .patch(
                        "/notifications/abc/read"
                    )
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe(
                    "Invalid notification ID"
                );
        }
    );


    test(
        "PATCH /notifications/:id/read should return 404 for missing notification",
        async () => {

            const response =
                await request(app)
                    .patch(
                        "/notifications/999999999/read"
                    )
                    .set(
                        "Authorization",
                        authHeader
                    );

            expect(response.statusCode)
                .toBe(404);

            expect(response.body.message)
                .toBe(
                    "Notification not found"
                );
        }
    );


    test(
        "PATCH /notifications/:id/read should prevent another user from modifying notification",
        async () => {

            const notification =
                await prisma.notification.create({
                    data: {
                        userId,
                        type: "PRIVATE",
                        title: "Private Notification",
                        message:
                            "Private message"
                    }
                });

            const response =
                await request(app)
                    .patch(
                        `/notifications/${notification.id}/read`
                    )
                    .set(
                        "Authorization",
                        `Bearer ${otherUserToken}`
                    );

            expect(response.statusCode)
                .toBe(403);

            expect(response.body.message)
                .toBe(
                    "You are not allowed to modify this notification"
                );
        }
    );


    // ----------------------------------------
    // CREATE AUTH
    // ----------------------------------------

    test(
        "POST /notifications should reject missing authorization",
        async () => {

            const response =
                await request(app)
                    .post("/notifications")
                    .send({
                        type: "ORDER",
                        title: "Test",
                        message: "Test message"
                    });

            expect(response.statusCode)
                .toBe(401);

            expect(response.body.message)
                .toBe(
                    "Authorization header missing"
                );
        }
    );

});