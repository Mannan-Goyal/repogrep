import { Router } from 'express';
import { oAuthCallback, checkAuth, logout } from '../controllers/github';

const githubRouter = Router();

githubRouter.get('/github', oAuthCallback);
githubRouter.get('/checkAuth', checkAuth);
githubRouter.post('/logout', logout);

export default githubRouter;