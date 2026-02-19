const AuthService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

const AuthController = {
    register: asyncHandler(async (req, res) => {
        const { email, password, firstName, lastName, phone, dateOfBirth, role } = req.body;
        const result = await AuthService.register({ email, password, firstName, lastName, phone, dateOfBirth, role });
        res.status(201).json(result);
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    }),

    getProfile: asyncHandler(async (req, res) => {
        const profile = await AuthService.getProfile(req.user.id);
        res.json(profile);
    }),
};

module.exports = AuthController;
