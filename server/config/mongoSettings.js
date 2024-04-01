import { __prod__ } from '../constants.js';
import dotenv from 'dotenv';
dotenv.config()

export const mongoConfig = {
    serverUrl: __prod__ ? process.env.MONGO_ATLAS_SERVER_URL : process.env.MONGO_SERVER_URL,
    database: process.env.MONGO_DATABASE_NAME
};
