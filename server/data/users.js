import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {users} from '../config/mongoCollections.js';
import { 
    parameterCheck, 
    strValidCheck, 
    usernameValidCheck, 
    passwordValidCheck, 
    emailValidCheck, 
    checkUsernameUnique, 
    checkEmailInUse 
} from '../utils/validate.js';
dotenv.config();

export const createUser = async (username, email, password) => {
    parameterCheck(username, email, password);
    strValidCheck(username, email, password);
    usernameValidCheck(username);
    emailValidCheck(email);
    passwordValidCheck(password);
    await checkUsernameUnique(username);
    await checkEmailInUse(email);
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
        username: username,
        email: email,
        password: hashedPassword,
    }
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw {status: 500, message: 'Internal Server Error'};
    }
    return newUser;
}

export const getUserByEmail = async (email) => {
    parameterCheck(email);
    strValidCheck(email);
    emailValidCheck(email);

    const userCollection = await users();
    const user = await userCollection.findOne({email: email});
    if (!user) {
        throw {status: 404, message: `No user with email: ${email}`};
    }
    return user;
}

export const getUserByUsername = async (username) => {
    parameterCheck(username);
    strValidCheck(username);
    username = username.trim().toLowerCase();

    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (!user) {
        throw {status: 404, message: `No user with username: ${username}`};
    }
    return user;
}

export const authenticateUser = async (email, password) => {
    parameterCheck(email, password);
    strValidCheck(email, password);
    emailValidCheck(email);
    email = email.trim().toLowerCase();

    const user = await getUserByEmail(email);
    const authentic = await bcrypt.compare(password, user.password);
    if (!authentic) { 
        throw {status: 401, message: 'Email and Password do not match'};
    } else {
        return user;
    }
}
