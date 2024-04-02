/**
 * @file utils/validation.js
 * @description This file contatins data validation functions.
 */

import EmailValidator from 'email-validator';
import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';

/**
 * @function parameterCheck
 * @param {...string} param
 * @throws {BadRequest} Throws Bad Request if any of the parameters passed in are undefined or null.
 * @description This function makes sure no parameters are undefined or null.
 */

export const parameterCheck = (...param) => {
    for (const i in param) {
        if (typeof param[i] === 'undefined' || param[i] === null)
            throw { status: 400, message: "An expected input value is undefined or null." };
    }
}

/**
 * @function strValidCheck
 * @param {...string} str
 * @throws {BadRequest} Throws Bad Request if any parameter is not of type string.
 * @throws {BadRequest} Throws Bad Request if any parameters are empty strings.
 * @description This function ensures all parameters are of type string and are not empty strings.
 */

export const strValidCheck = (...str) => {
    for (const i in str) {
        if (typeof str[i] !== 'string') {
            throw { status: 400, message: `Input is not a string.` };
        }
        if (str[i].trim().length === 0) {
            throw { status: 400, message: `Input can not be empty.` };
        }
    }
}

/**
 * @function idCheck
 * @param {string} id
 * @throws {BadRequest} Throws Bad Request if param is undefined.
 * @throws {BadRequest} Throws Bad Request if param is not of type string.
 * @throws {BadRequest} Throws Bad Request if param is just an empty string.
 * @throws {BadRequest} Throws Bad Request if param is not a valid MongoDB ObjectId.
 * @returns {id} trims the leading and trailing spaces before returning.
 * @description This function ensures id is a valid MongoDB ObjectID.
 */

export const idCheck = (id) => {
    if (!id) throw { status: 400, message: `You must provide an ID to search for.` };
    if (typeof id !== 'string') throw { status: 400, message: `ID must be of type string` };
    id = id.trim();
    if (id.length === 0)
        throw { status: 400, message: `ID can not be a string with just spaces.` };
    if (!ObjectId.isValid(id)) throw { status: 400, message: `ID is not a valid ObjectId.` };
    return id;
}

/**
 * @function emailValidCheck
 * @param {string} email
 * @throws {BadRequest} Throws Bad Request if email doesn't meet minimum requirements for a valid email address.
 * @returns {string} Returns email address after trimming spaces and converting to lowercase.
 * @description This function ensures email address passed in is valid.
 */

export const emailValidCheck = (email) => {
    const isValid = EmailValidator.validate(email);
    if (!isValid) throw { status: 400, message: `'${email}' is not a valid Email ID.` };

    return email.trim().toLowerCase()
}

/**
 * @function usernameValidCheck
 * @param {string} username
 * @throws {BadRequest} Throws Bad Request if username is shorter than 3 characters.
 * @throws {BadRequest} Throws Bad Request if username is longer than 20 characters.
 * @throws {BadRequest} Throws Bad Request if username contains anything other that 0-9, a-z, A-Z and _ (underscore).
 * @throws {BadRequest} Throws Bad Request if username does not start with an alphabet.
 * @description This function ensures username meets all required critia.
 */

export const usernameValidCheck = (username) => {
    if (username.length < 3) throw { status: 400, message: `'${username}' is shorter than 3 characters.` };
    if (username.length > 20) throw { status: 400, message: `'${username}' is longer than 20 characters.` };
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) throw { status: 400, message: `'${username}' should not contain only Alphabets, Numbers or Underscores.` };
    const regex2 = /[a-zA-Z]/;
    if (!regex2.test(username)) throw { status: 400, message: `'${username}' should contain at least one Alphabet.` };
}

/**
 * @function parameterCheck
 * @param {string} password
 * @throws {BadRequest} Throws Bad Request if password is shorter than 6 characters.
 * @throws {BadRequest} Throws Bad Request if password is longer than 20 characters.
 * @throws {BadRequest} Throws Bad Request if password does not contain at least 1 number.
 * @throws {BadRequest} Throws Bad Request if password does not contain at least 1 special character.
 * @throws {BadRequest} Throws Bad Request if password does not contain at least 1 upper case letter.
 * @throws {BadRequest} Throws Bad Request if password contains any spaces.
 * @description This function ensures password meets all required criteria.
 */

export const passwordValidCheck = (password) => {
    if (password.length < 6) throw { status: 400, message: `Password must be longer than 6 characters.` };
    if (password.length > 20) throw { status: 400, message: `Password can not be longer than 20 characters.` };
    const regex = /\d+/;
    if (!regex.test(password)) throw { status: 400, message: `Password must contain at least 1 number.` };
    const regex2 = /.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?].*/;
    if (!regex2.test(password)) throw { status: 400, message: `Password must contain at least 1 special character.` };
    if (!/[A-Z]/.test(password)) throw { status: 400, message: `Password must contain at least 1 Uppercase character.` };
    const regex3 = /^\S+$/;
    if (!regex3.test(password)) throw { status: 400, message: `Password can not contain spaces.` };
}

/**
 * @function checkUsernameUnique
 * @param {string} username
 * @throws {Confilct} Throws Conflict if username passed in is already used by an existing account.
 * @description This function ensures username passed in doesn't already exist.
 */

export const checkUsernameUnique = async (username) => {
    const userCollection = await users();
    const searchedUser = await userCollection.findOne({ username: username });
    if (searchedUser) throw { status: 409, message: `Username: ${username} is already in use.` }
}

/**
 * @function checkEmailInUse
 * @param {string} email
 * @throws {Conflict} Throws Conflict if email passed is is already used by an existing account.
 * @description This function ensures there are no duplicate emails in the Database.
 */

export const checkEmailInUse = async (email) => {
    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });
    if (user) {
        throw { status: 409, message: `Email ID: ${email} is already in use.` };
    }
}
