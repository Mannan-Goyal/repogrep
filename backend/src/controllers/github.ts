import { RequestHandler } from "express";
import { get } from "lodash";
import { getGithubUser } from "../middlewares/github";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Logger from "../logs";

export const COOKIE_NAME = "user-jwt";

export const oAuthCallback: RequestHandler = async (req, res) => {
    try {
        const code = get(req, "query.code") as string;
        const path = get(req, "query.path", "/") as string;
        if (!code) {
            Logger.error("No Code was Provided for the OAuth Callback");
            return res.status(400).json({ message: "No code provided" });
        }
        const [accesstoken, user] = await getGithubUser(code);
        //TODO: Figure out how to fix this hacky solution
        async function store() {
            try {
                const value = await user;
                await User.findOneAndUpdate({ username: value.login }, {
                    username: value.login,
                    access_token: accesstoken
                });
            } catch (err) {
                Logger.error("Error storing user in database " + err);
                res.status(500).json({ message: "Error storing user in database" });
            }
        }
        store();
        const token = jwt.sign(user, process.env.JWT_SECRET as string)
        res.cookie(COOKIE_NAME, token, { httpOnly: true, domain: "localhost" });
        res.redirect(`http://localhost:3000${path}`);
    }
    catch (err) {
        Logger.error("Error in OAuth Callback " + err);
        res.status(500).json({ message: "Error in OAuth Callback" });
    }
}

export const checkAuth: RequestHandler = async (req, res) => {
    try {
        const cookie = get(req, `cookies[${COOKIE_NAME}]`);
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET as string);
        if (decoded) {
            res.json(decoded);
        }
        else {
            res.json({ message: "You are not logged in" });
        }
    } catch (err) {
        Logger.error("Error checking authentication " + err);
        res.send("You are not logged in");
    }
}

export const logout: RequestHandler = async (req, res) => {
    try {
        res.clearCookie(COOKIE_NAME);
        res.json({ message: "Logged out successfully" });
    }
    catch (err) {
        Logger.error("Error logging out " + err);
        res.status(500).json({ message: "Error logging out" });
    }
}