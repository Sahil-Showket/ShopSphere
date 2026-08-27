const jwt = require("jsonwebtoken");

function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}

module.exports = {
    generateToken
};