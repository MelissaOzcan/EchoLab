/**
 * @file api/compile.js
 * @description This route recieves user submitted code, and runs it in a Docker container.
 * The result is sent back to the client as a response.
 */

import { Router } from "express";
import { authorizeToken } from "../middleware/jwtAuthentication.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { runCodeInDocker } from "../utils/helpers.js";

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
            // Mock output for testing
            // const output = await runCodeInDocker(language, code);
            const output = "SUCCESS";

            res.status(200).json({ result: output });
        } catch (err) {
            res.status(500).json({ "error": err.toString() });
        }
    });

export default router;
