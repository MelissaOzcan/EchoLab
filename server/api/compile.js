/**
 * @file api/compile.js
 * @description This route recieves user submitted code, and runs it in a Docker container.
 * The result is sent back to the client as a response.
 */

import { Router } from "express";
import { authorizeToken } from "../middleware/jwtAuthentication.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { runCodeInDocker } from "../utils/helpers.js";
import redis from 'redis';

const client = redis.createClient();
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

        try {
            let output;
            // Check if the code already exists in Redis
            const cachedOutput = await client.get(code + "," + language);
            if (cachedOutput) {
                console.log("Returned from cache")
                output = cachedOutput;
            }
            else{
                // Mock output for testing
                // const output = "SUCCESS";
                output = await runCodeInDocker(language, code);
                await client.set(code + "," + language, output);
            }
            

            res.status(200).json({ result: output });
        } catch (err) {
            res.status(500).json({ "error": err.toString() });
        }
    });

export default router;
