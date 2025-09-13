import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    displayName: string;
    email: string;
    accessToken: string;
    refreshToken: string;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    accessToken: { type: String, required: false },
});

export default mongoose.model<IUser>('User', UserSchema);
