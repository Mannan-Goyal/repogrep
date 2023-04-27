import { RequestHandler } from "express";
import axios from "axios";
import { get } from "lodash";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import cron from "node-cron";
import stream from "stream";
import fs from 'fs';
import path from 'path';
import User from "../models/user";
import { COOKIE_NAME } from "./github";
import Backup from "../models/backup";
import { IGithubUser, IBackup, IUser } from "../types/types";
import Logger from "../logs";

const cloudBackup = async (repo_name: string, repo_owner: string, branch: string) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        const pass = new stream.PassThrough();
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Key: `${repo_name}@${branch}_${repo_owner}.zip`,
            Body: pass
        };
        return {
            writeStream: pass,
            uploadFinished: s3.upload(params).promise()
        }
    }
    catch (err) {
        Logger.error("Error in cloud backup " + err);
    }
}

const fileBackup = async (repo_name: string, repo_owner: string, branch: string, token: string) => {
    try {
        const backup_path = path.resolve(__dirname, '..', '..', 'backup', `${repo_name}@${branch}_${repo_owner}.zip`);
        const response = await axios({
            method: 'GET',
            url: `http://api.github.com/repos/${repo_owner}/${repo_name}/zipball/${branch}`,
            responseType: 'stream',
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Github-Api-Version': "2022-11-28",
                Accept: "application/vnd.github+json"
            }
        });
        response.data.pipe(fs.createWriteStream(backup_path));
        const { writeStream, uploadFinished } = <{ writeStream: any; uploadFinished: Promise<any>; }>await cloudBackup(repo_name, repo_owner, branch);
        response.data.pipe(writeStream);
        uploadFinished.then(() => {
            Logger.info(`Uploaded ${repo_name}@${branch}_${repo_owner}.zip to AWS S3`);
        })
    }
    catch (err) {
        Logger.error("Error in file backup " + err);
    }
}

export const syncOldBackups: RequestHandler = async (req, res) => {
    try {
        const cookie = get(req, `cookies[${COOKIE_NAME}]`);
        try {
            const decoded: IGithubUser = jwt.verify(cookie, process.env.JWT_SECRET as string) as IGithubUser;
            if (decoded) {
                const user = <IUser>await User.findOne({ username: decoded.login });
                const backups = <IBackup[]>await Backup.find({ username: user.username });
                backups.forEach((backup: IBackup) => {
                    cron.schedule(backup.schedule_string, () => {
                        Logger.info(`Backing up ${backup.repo_owner}/${backup.repo_name} at ${new Date().toLocaleString()}`);
                        fileBackup(backup.repo_name, backup.repo_owner, backup.branch, user.access_token);
                    });
                }
                );
                return res.status(200).json({ message: "Synced old backups" });
            }
        } catch (err) {
            res.status(400).json({ message: "You are not logged in" });
        }
    }
    catch (err) {
        Logger.error("Error in sync old backups " + err);
        res.status(400).json({ message: "Error in syncing old backups" });
    }
};

export const getZip: RequestHandler = async (req, res) => {
    try {
        const { repo_name, repo_owner, branch, crontime } = req.body;
        const cookie = get(req, `cookies[${COOKIE_NAME}]`);
        try {
            const decoded: IGithubUser = jwt.verify(cookie, process.env.JWT_SECRET as string) as IGithubUser;
            if (decoded) {
                const user = await User.findOne({ username: decoded.login });
                cron.schedule(crontime, () => {
                    Logger.info(`Backing up ${repo_owner}/${repo_name} at ${new Date().toLocaleString()}`);
                    fileBackup(repo_name, repo_owner, branch, user?.access_token as string);
                });
                Backup.create(<IBackup>{
                    username: decoded.login,
                    repo_name,
                    repo_owner,
                    branch,
                    schedule_string: crontime
                })
                fileBackup(repo_name, repo_owner, branch, user?.access_token as string);
                return res.json({ message: 'File Backup Successful' });
            }
        } catch (err) {
            res.status(400).json({ message: "You are not logged in" });
        }
    }
    catch (err) {
        Logger.error("Error in get zip " + err);
        res.status(400).json({ message: "Error in get zip" });
    }
}