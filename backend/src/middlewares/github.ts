import axios, { AxiosResponse } from 'axios';
import { IGithubUser } from '../types/types';
import querystring from 'querystring';
import Logger from '../logs';

export const getGithubUser = async (code: string): Promise<[string, Promise<IGithubUser>]> => {
    let res: AxiosResponse;
    try {
        const url = `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`;
        res = await axios.post(url);
    }
    catch (err) {
        Logger.error(`Error fetching access token from GitHub: ${err}`);
        throw err;
    }
    const decoded = querystring.parse(res.data);
    const access_token = decoded.access_token as string;
    try {
        res = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return [access_token, res.data];
    }
    catch (err) {
        Logger.error(`Error getting user from GitHub: ${err}`);
        throw err;
    }
}
