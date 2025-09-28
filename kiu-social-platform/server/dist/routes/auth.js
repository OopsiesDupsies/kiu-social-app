"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Register
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().matches(/^[a-zA-Z0-9._%+-]+@kiu\.edu\.ge$/),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('pin').isLength({ min: 4, max: 4 }).isNumeric(),
    (0, express_validator_1.body)('major').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('dateOfBirth').isISO8601(),
    (0, express_validator_1.body)('startYear').isInt({ min: 2020, max: new Date().getFullYear() + 5 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, firstName, lastName, username, password, pin, major, dateOfBirth, startYear } = req.body;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                username,
                password: hashedPassword,
                pin,
                major,
                dateOfBirth: new Date(dateOfBirth),
                startYear
            }
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                major: user.major,
                startYear: user.startYear
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                major: user.major,
                startYear: user.startYear,
                profilePicture: user.profilePicture
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Quick login with PIN
router.post('/quick-login', auth_1.authenticateToken, auth_1.authenticatePIN, async (req, res) => {
    try {
        const user = req.user;
        // Update last seen
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() }
        });
        res.json({
            message: 'Quick login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                major: user.major,
                startYear: user.startYear,
                profilePicture: user.profilePicture
            }
        });
    }
    catch (error) {
        console.error('Quick login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Verify token
router.get('/verify', auth_1.authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
//# sourceMappingURL=auth.js.map