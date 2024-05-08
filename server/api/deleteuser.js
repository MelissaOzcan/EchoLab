/**
 * @file api/deleteuser.js
 * @description This route is for Deleting a user using the user's ID
 */
import { Router } from 'express';
import { deleteUser } from '../data/users.js';
import { authorizeToken } from '../middleware/jwtAuthentication.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { parameterCheck, strValidCheck } from '../utils/validate.js';

const router = Router();

router
    .delete("/:username", apiLimiter, authorizeToken, async (req, res) => {
        console.log("try1")
        let { username } = req.params; // users cannot have duplicate usernames
        try {
            parameterCheck(username);
            strValidCheck(username);
        } catch (err) {
            return res.status(err.status || 500).json({ "error in param checking": err.message || "Internal Server Error." });
        }
        try {
            console.log("try2")
            const deleteduser = await deleteUser(username);
            if (!deleteduser) {
                throw { status: 500, message: "Internal Server Error." };
            }
            console.log("try3")
            return res.status(200).json({ "message": "user deleted successfully." });
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
    });

export default router;
