import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    parentComment?: mongoose.Types.ObjectId;
    replies: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Comment.d.ts.map