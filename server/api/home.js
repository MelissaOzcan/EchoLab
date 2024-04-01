import { Router } from 'express';
import { createRoom, deleteRoom, getRoom } from '../data/rooms.js';
import { authorizeToken } from '../middleware/jwtAuthentication.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { idCheck, parameterCheck, strValidCheck } from '../utils/validate.js';

const router = Router();

router
    .post("/", apiLimiter, authorizeToken, async (req, res) => {
        const { username } = req.body;
        try {
            parameterCheck(username);
            strValidCheck(username);
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
        try {
            const newRoom = await createRoom(username);
            console.log(newRoom);
            if (!newRoom) throw { status: 500, message: "Internal Server Error." };
            return res.status(200).json({ newRoom });
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
    })
    .delete("/", apiLimiter, authorizeToken, async (req, res) => {
        const { id } = req.body;
        try {
            parameterCheck(id);
            strValidCheck(id);
            id = idCheck(id);
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
        try {
            const deletedRoom = await deleteRoom(id);
            if (!deletedRoom) {
                throw { status: 500, message: "Internal Server Error." };
            }
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
    });

router
    .post("/join", apiLimiter, authorizeToken, async (req, res) => {
        let { roomId } = req.body
        try {
            parameterCheck(roomId);
            strValidCheck(roomId);
            roomId = idCheck(roomId);
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
        try {
            const room = await getRoom(roomId);
            console.log(room);
            if (!room) throw { status: 500, message: "Internal Server Error." };
            return res.status(200).json({ room });
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
    });


export default router;
