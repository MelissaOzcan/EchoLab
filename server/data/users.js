/**
 * @file data/users.js
 * @description CRUD for users collection.
 */

import { ObjectId } from "mongodb";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { users } from '../config/mongoCollections.js';
import {
    checkEmailInUse, checkUsernameUnique, emailValidCheck, parameterCheck, passwordValidCheck, strValidCheck,
    usernameValidCheck
} from '../utils/validate.js';
dotenv.config();

/**
 * @function createUser
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @return {object} Returns new User object
 * @throws {InternalServerError} Throws ISR if MongoDB insertOne() fails 
 * @description This function creates a new user using given username, email and password.
 */

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
        throw { status: 500, message: 'Internal Server Error' };
    }
    return newUser;
}

/**
 * @function getUserByEmail
 * @param {string} email
 * @return {object} Returns a User object corrosponding to the email passed in as argument.
 * @throws {NotFound} Throws Not Found if no user with given email is found.
 * @description This function finds a user with given email ID.
 */

export const getUserByEmail = async (email) => {
    parameterCheck(email);
    strValidCheck(email);
    emailValidCheck(email);

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });
    if (!user) {
        throw { status: 404, message: `No user with email: ${email}` };
    }
    return user;
}

/**
 * @function getUserByUsername
 * @param {string} username
 * @return {object} Returns a User object corrosponding to the username passed in as argument.
 * @throws {NotFound} Throws Not Found if no user with given username is found.
 * @description This function finds a user with given username.
 */

export const getUserByUsername = async (username) => {
    parameterCheck(username);
    strValidCheck(username);
    username = username.trim().toLowerCase();

    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) {
        throw { status: 404, message: `No user with username: ${username}` };
    }
    return user;
}

/**
 * @function authenticateUser
 * @param {string} email
 * @param {string} password
 * @return {object} Returns User object.
 * @throws {Unauthorized} Throws Unauthorized if email and password combination does not
 * match Database records
 * @description This is used to authenticate users trying to log into their accounts.
 */

export const authenticateUser = async (email, password) => {
    parameterCheck(email, password);
    strValidCheck(email, password);
    emailValidCheck(email);
    email = email.trim().toLowerCase();

    const user = await getUserByEmail(email);
    const authentic = await bcrypt.compare(password, user.password);
    if (!authentic) {
        throw { status: 401, message: 'Email and Password do not match' };
    } else {
        return user;
    }
}


/**
 * @function deleteUser
 * @param {string} id
 * @return {object} Returns object indicating User is deleted
 * @throws {InternalServerError} Throws ISR if MongoDB deleteOne() fails 
 * @description This function deletes user with given ID.
 */

export const deleteUser = async (username) => {
    try {
        parameterCheck(username);
        strValidCheck(username);
        console.log("deleteUser1")
        let user = await getUserByUsername(username);

        const userCollection = await users();
        const deletedUser = await userCollection.deleteOne({ _id: new ObjectId(user._id) });
        console.log("deleteUser2")

        if (!deletedUser.acknowledged || deletedUser.deletedCount !== 1) {
            throw { status: 500, message: "Internal Server Error" };
        }
        console.log("deleteUser3")

        return { deleted: true};
    } catch (err) {
        throw { status: 500, message: err.message };
    }
}
