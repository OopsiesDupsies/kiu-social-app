"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@kiu\.edu\.ge$/, 'Email must be a valid KIU email']
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    pin: {
        type: String,
        required: true,
        length: 4,
        match: [/^\d{4}$/, 'PIN must be exactly 4 digits']
    },
    major: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    startYear: {
        type: Number,
        required: true,
        min: 2020,
        max: new Date().getFullYear() + 5
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    friends: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    blockedUsers: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ friends: 1 });
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map