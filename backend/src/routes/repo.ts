import { Router } from 'express';
import { getZip, syncOldBackups } from '../controllers/repo';

const repoRouter = Router();

repoRouter.post('/zip', getZip);
repoRouter.post('/sync', syncOldBackups);

export default repoRouter;