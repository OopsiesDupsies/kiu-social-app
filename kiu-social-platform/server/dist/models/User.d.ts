import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    pin: string;
    major: string;
    dateOfBirth: Date;
    startYear: number;
    profilePicture?: string;
    bio?: string;
    friends: mongoose.Types.ObjectId[];
    blockedUsers: mongoose.Types.ObjectId[];
    isActive: boolean;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map