import mongoose, { Document } from 'mongoose';
export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    content: string;
    messageType: 'text' | 'image' | 'file';
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Message.d.ts.map