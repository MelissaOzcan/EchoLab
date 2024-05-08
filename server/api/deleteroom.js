/**
 * @file api/deleteroom.js
 * @description This route is for Deleting a Room using the Room's ID
 */

import { Router } from 'express';
import { deleteRoom } from '../data/rooms.js';
import { authorizeToken } from '../middleware/jwtAuthentication.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { idCheck, parameterCheck, strValidCheck } from '../utils/validate.js';

const router = Router();

router
    .delete("/:id", apiLimiter, authorizeToken, async (req, res) => {
        let { id } = req.params;
        try {
            parameterCheck(id);
            strValidCheck(id);
            id = idCheck(id);
        } catch (err) {
            return res.status(err.status || 500).json({ "error in param checking": err.message || "Internal Server Error." });
        }
        try {
            const deletedRoom = await deleteRoom(id);
            if (!deletedRoom) {
                throw { status: 500, message: "Internal Server Error." };
            }
            return res.status(200).json({ "message": "Room deleted successfully." });
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
    });

export default router;
