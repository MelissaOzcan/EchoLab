/**
 * @file api/compile.js
 * @description This route recieves user submitted code, and runs it in a Docker container.
 * The result is sent back to the client as a response.
 */

import { Router } from "express";
import { authorizeToken } from "../middleware/jwtAuthentication.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { runCodeInDocker } from "../utils/helpers.js";
import { redisConfig } from "../config/redisSettings.js";
import redis from 'redis';
import crypto from 'crypto';

const client = redis.createClient(redisConfig);
client.connect().then(() => {});

const router = Router();

const langOptions = new Set(["python", "cpp", "node", "rust", "java"]);

router
    .post("/:language", apiLimiter, authorizeToken, async (req, res) => {
        const { code } = req.body;
        const { language } = req.params;

        if (!langOptions.has(language)) {
            return res.status(400).json({ "error": `'${language}' is not available.` });
        }

        const hash = crypto.createHash('sha256').update(code + language).digest('hex');

        try {
            let output;
            const cachedOutput = await client.get(hash);
            if (cachedOutput) {
                output = cachedOutput;
            }
            else{
                output = await runCodeInDocker(language, code);
                await client.set(hash, output);
            }
            

            res.status(200).json({ result: output });
        } catch (err) {
            res.status(500).json({ "error": err.toString() });
        }
    });

export default router;
