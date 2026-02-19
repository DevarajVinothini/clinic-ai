const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');

const AuthService = {
    async register({ email, password, firstName, lastName, phone, dateOfBirth, role }) {
        const existing = await UserModel.findByEmail(email);
        if (existing) {
            throw new AppError('Email already registered', 409);
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await UserModel.create({
            email, passwordHash, role, firstName, lastName, phone, dateOfBirth,
        });

        const token = this._generateToken(user);
        return {
            token,
            user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
        };
    },

    async login(email, password) {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = this._generateToken(user);
        return {
            token,
            user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
        };
    },

    async getProfile(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            dateOfBirth: user.date_of_birth,
        };
    },

    _generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: `${user.first_name} ${user.last_name}` },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    },
};

module.exports = AuthService;
