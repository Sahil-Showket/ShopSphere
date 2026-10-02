const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Auth Service API", () => {

    describe("GET /health", () => {

        test("should return service health", async () => {
            const response = await request(app)
                .get("/health");

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                service: "auth-service",
                status: "UP"
            });
        });

    });

    describe("POST /auth/register", () => {

        test("should reject registration when email is missing", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send({
                    password: "Test@12345"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.message).toBe(
                "Email and password are required"
            );
        });

        test("should reject registration when password is missing", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send({
                    email: "test@example.com"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.message).toBe(
                "Email and password are required"
            );
        });

        test("should register a new user", async () => {
            const email = `jest-${Date.now()}@example.com`;

            const response = await request(app)
                .post("/auth/register")
                .send({
                    email,
                    password: "Test@12345"
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.message).toBe(
                "User registered successfully"
            );

            expect(response.body.user).toHaveProperty("id");
            expect(response.body.user.email).toBe(email);
            expect(response.body.user).toHaveProperty("role");
            expect(response.body.user).not.toHaveProperty("passwordHash");
        });

        test("should reject duplicate email", async () => {
            const email = `duplicate-${Date.now()}@example.com`;

            await request(app)
                .post("/auth/register")
                .send({
                    email,
                    password: "Test@12345"
                });

            const response = await request(app)
                .post("/auth/register")
                .send({
                    email,
                    password: "Test@12345"
                });

            expect(response.statusCode).toBe(500);

            expect(response.body.message).toBe(
                "User already exists"
            );
        });

    });

    describe("POST /auth/login", () => {

        const loginEmail = `login-${Date.now()}@example.com`;
        const loginPassword = "Test@12345";

        beforeAll(async () => {
            await request(app)
                .post("/auth/register")
                .send({
                    email: loginEmail,
                    password: loginPassword
                });
        });

        test("should login with valid credentials", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: loginEmail,
                    password: loginPassword
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.message).toBe(
                "Login successful"
            );

            expect(response.body).toHaveProperty("token");
            expect(typeof response.body.token).toBe("string");
        });

        test("should reject incorrect password", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: loginEmail,
                    password: "WrongPassword123"
                });

            expect(response.statusCode).toBe(500);

            expect(response.body.message).toBe(
                "Invalid email or password"
            );
        });

        test("should reject missing login fields", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: loginEmail
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.message).toBe(
                "Email and password are required"
            );
        });

    });

    describe("GET /auth/me", () => {

        let token;

        beforeAll(async () => {
            const email = `me-${Date.now()}@example.com`;
            const password = "Test@12345";

            await request(app)
                .post("/auth/register")
                .send({
                    email,
                    password
                });

            const loginResponse = await request(app)
                .post("/auth/login")
                .send({
                    email,
                    password
                });

            token = loginResponse.body.token;
        });

        test("should return authenticated user with valid token", async () => {
            const response = await request(app)
                .get("/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.message).toBe(
                "You are authenticated"
            );

            expect(response.body.user).toHaveProperty("userId");
            expect(response.body.user).toHaveProperty("email");
            expect(response.body.user).toHaveProperty("role");
        });

        test("should reject request without token", async () => {
            const response = await request(app)
                .get("/auth/me");

            expect(response.statusCode).toBe(401);

            expect(response.body.message).toBe(
                "Access token required"
            );
        });

        test("should reject malformed authorization header", async () => {
            const response = await request(app)
                .get("/auth/me")
                .set("Authorization", "InvalidToken");

            expect(response.statusCode).toBe(401);

            expect(response.body.message).toBe(
                "Invalid authorization format"
            );
        });

        test("should reject invalid JWT", async () => {
            const response = await request(app)
                .get("/auth/me")
                .set(
                    "Authorization",
                    "Bearer invalid.jwt.token"
                );

            expect(response.statusCode).toBe(401);

            expect(response.body.message).toBe(
                "Invalid or expired token"
            );
        });

    });

    describe("GET /auth/admin", () => {

        let userToken;

        beforeAll(async () => {
            const email = `user-${Date.now()}@example.com`;
            const password = "Test@12345";

            await request(app)
                .post("/auth/register")
                .send({
                    email,
                    password
                });

            const loginResponse = await request(app)
                .post("/auth/login")
                .send({
                    email,
                    password
                });

            userToken = loginResponse.body.token;
        });

        test("should reject request without token", async () => {
            const response = await request(app)
                .get("/auth/admin");

            expect(response.statusCode).toBe(401);

            expect(response.body.message).toBe(
                "Access token required"
            );
        });

        test("should reject normal user with 403", async () => {
            const response = await request(app)
                .get("/auth/admin")
                .set(
                    "Authorization",
                    `Bearer ${userToken}`
                );

            expect(response.statusCode).toBe(403);

            expect(response.body.message).toBe(
                "Access denied"
            );
        });

        test("should reject invalid JWT", async () => {
            const response = await request(app)
                .get("/auth/admin")
                .set(
                    "Authorization",
                    "Bearer invalid.jwt.token"
                );

            expect(response.statusCode).toBe(401);

            expect(response.body.message).toBe(
                "Invalid or expired token"
            );
        });

    });

});