import { Router } from "express";
import { authorizeToken } from "../middleware/jwtAuthentication.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { getRoom, updateRoom } from "../data/rooms.js";
import { idCheck, parameterCheck, strValidCheck } from "../utils/validate.js";

const router = Router();

router
    .get("/:id", apiLimiter, authorizeToken, async (req, res) => {
        let {id} = req.params;
        try {
            parameterCheck(id);
            strValidCheck(id);
            id = idCheck(id);
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
        try {
            const room = await getRoom(id);

            return res.status(200).json({room: room});
        } catch (err) {
            console.log(err);
            return res.status(400).json({ "error": `'${lang}' is not available.` });
        }
    })
    .post("/:id", apiLimiter, authorizeToken, async (req, res) => {
        console.log("HIIII");
        let {id} = req.params;
        const {code, lang} = req.body
        try {
            parameterCheck(id, code, lang);
            strValidCheck(id, code, lang);
            id = idCheck(id);
        } catch (err) {
            return res.status(err.status || 500).json({ "error": err.message || "Internal Server Error." });
        }
        try {
            const room = await updateRoom(id, lang, code);

            return res.status(200).json({room: room});
        } catch (err) {
            console.log(err);
            return res.status(400).json({ "error": `'${lang}' is not available.` });
        }
    });

export default router;
