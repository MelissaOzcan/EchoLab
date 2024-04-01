import { getUserByUsername } from "./users.js";
import { rooms } from "../config/mongoCollections.js";
import { parameterCheck, strValidCheck, idCheck } from "../utils/validate.js";
import { ObjectId } from "mongodb";

export const createRoom = async (username) => {
    parameterCheck(username);
    strValidCheck(username);

    await getUserByUsername(username);

    const newRoom = {
        participants: [username],
        pythonCode: "",
        javaCode: "",
        nodeCode: "",
        cppCode: "",
        rustCode: ""
    }
    const roomCollection = await rooms();
    const insertInfo = await roomCollection.insertOne(newRoom);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw {status: 500, message: 'Internal Server Error'};
    }

    return await getRoom(insertInfo.insertedId.toString());
}

export const getRoom = async (id) => {
    parameterCheck(id);
    strValidCheck(id);
    id = idCheck(id);

    const roomCollection = await rooms();
    const room = await roomCollection.findOne({_id: new ObjectId(id)});
    if (!room) {
        throw {status: 404, message: `No room with ID: ${id}`};
    }
    return room;
}

export const updateRoom = async (id, lang, code) => {
    parameterCheck(id, lang, code);
    strValidCheck(id, lang, code);
    id = idCheck(id);

    const codeField = `${lang}Code`;

    const updateDoc = { 
        $set: { 
            [codeField]: code 
        } 
    };

    const roomCollection = await rooms();
    const room = await roomCollection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc
    );
    if (!room.matchedCount || !room.modifiedCount) {
        throw {status: 500, message: 'Unable to update the room.'};
    }

    return { updated: true };
}

export const joinRoom = async (id, username) => {
    parameterCheck(id, username);
    strValidCheck(id, username);
    id = idCheck(id);
    username = username.trim().toLowerCase();

    const roomCollection = await rooms();
    const room = await roomCollection.findOne({_id: id});

    await getUserByUsername(username);

    const updatedParticipants = room.participants.push(username);

    const updatedRoom = await roomCollection.findOneAndReplace(
        { _id: new ObjectId(id) }, 
        updatedParticipants, 
        { returnDocument: 'after' }
    );

    return updatedRoom;
}

export const deleteRoom = async (id) => {
    parameterCheck(id);
    strValidCheck(id);
    id = idCheck(id);

    const roomCollection = await rooms();
    const deletedRoom = await roomCollection.deleteOne({_id: new ObjectId(id)});

    if (!deletedRoom.acknowledged || deletedRoom.deletedCount !== 1){ 
        throw {status: 500, message: "Internal Server Error"};
    }
    
    return {deleted: true, id: id};
}
