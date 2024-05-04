import { Router } from "express";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { removeParticipant } from "../data/rooms.js";
import { parameterCheck, strValidCheck } from '../utils/validate.js';

const router = Router();

router
    .post("/", apiLimiter, async (req, res) => {
        const { roomId, username } = req.body;
        try {
            parameterCheck(roomId, username);
            strValidCheck(roomId, username);
        } catch (e) {
            return res.status(e.status).json({ "error": e.message });
        }
        try {
            if (!roomId || !username) {
                return res.status(400).json({ "error": "roomId and username are required." });
            }
            await removeParticipant(roomId, username);
            return res.status(200).json({ "message": "User removed from room." });
        } catch (err) {
            return res.status(err.status).json({ "error": err.message });
        }
    });

export default router;