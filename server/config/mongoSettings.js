/**
 * @file config/mongoSettings.js
 * @description Settings file that connects application to local MongoDB database in 
 * development, and MongoDB Atlas in production
 */

import dotenv from 'dotenv';
import { __prod__ } from '../constants.js';
dotenv.config()

export const mongoConfig = {
    serverUrl: __prod__ ? process.env.MONGO_ATLAS_SERVER_URL : process.env.MONGO_SERVER_URL,
    database: process.env.MONGO_DATABASE_NAME
};
