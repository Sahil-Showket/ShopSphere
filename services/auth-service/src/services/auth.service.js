const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function registerUser(email, password) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    return user;
}

async function loginUser(email, password) {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    return user;
}

module.exports = {
    registerUser,
    loginUser
};