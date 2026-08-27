const authService = require("../services/auth.service");
const { generateToken } = require("../utils/jwt");

async function register(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await authService.registerUser(
            email,
            password
        );

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await authService.loginUser(
            email,
            password
        );

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login
};