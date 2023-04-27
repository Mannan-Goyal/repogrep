import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose, { ConnectOptions } from 'mongoose';
import githubRouter from './routes/github';
import repoRouter from './routes/repo';
import Logger from './logs';

dotenv.config({ path: __dirname + '/config/.env' })

const app: Application = express();
const port = process.env.PORT || 3001;

mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGO_URI as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions)
    .then(() => Logger.debug("Database connected!"))
    .catch(err => Logger.error("Error connecting to DB" + err));

app.use(cors({
    origin: `${process.env.CLIENT_URL}`,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', githubRouter);
app.use('/repo', repoRouter);
app.listen(port, () => Logger.debug(`Server is listening on port ${port}!`));