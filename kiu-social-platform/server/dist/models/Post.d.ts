import mongoose, { Document } from 'mongoose';
export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    content: string;
    images?: string[];
    likes: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Post.d.ts.map