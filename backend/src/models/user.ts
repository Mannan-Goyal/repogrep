import mongoose from 'mongoose';
import { IUser } from '../types/types';

const { Schema } = mongoose;

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
    },
    access_token: {
        type: String,
        required: [true, 'Access Token is required'],
    },
});

const User = mongoose.model<IUser>('users', UserSchema);
export default User;
