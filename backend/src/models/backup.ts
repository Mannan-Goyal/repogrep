import mongoose from 'mongoose';
import { IBackup } from '../types/types';

const { Schema } = mongoose;

const BackupSchema = new Schema<IBackup>({
    username: {
        type: String,
        required: [true, 'Username is required'],
    },
    repo_name: {
        type: String,
        required: [true, 'Repository Name is required'],
    },
    repo_owner: {
        type: String,
        required: [true, 'Repository Owner is required'],
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
    },
    schedule_string: {
        type: String,
        required: [true, 'Schedule String is required'],
    }
});

const Backup = mongoose.model<IBackup>('backups', BackupSchema);
export default Backup;
