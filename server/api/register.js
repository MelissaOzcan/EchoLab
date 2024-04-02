/**
 * @file api/login.js
 * @description This is the authorization route. Creates users.
 */

import { Router } from "express";
import { createUser } from "../data/users.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import {
    checkEmailInUse, checkUsernameUnique, emailValidCheck, parameterCheck, passwordValidCheck, strValidCheck,
    usernameValidCheck
} from '../utils/validate.js';

const router = Router();


router
    .post("/", apiLimiter, async (req, res) => {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        try {
            parameterCheck(username, email, password);
            strValidCheck(username, email, password);
            usernameValidCheck(username);
            emailValidCheck(email);
            passwordValidCheck(password);
            await checkEmailInUse(email);
            await checkUsernameUnique(username);
        } catch (err) {
            return res.status(err.status).json({ "error": err.message });
        }

        try {
            const newUser = await createUser(username, email, password);
            return res.status(200).json(newUser);
        } catch (err) {
            return res.status(err.status).json({ "error": err.message });
        }
    })

export default router;
