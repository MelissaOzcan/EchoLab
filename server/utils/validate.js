import EmailValidator from 'email-validator';
import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

export const parameterCheck = (...param) => {
  for (const i in param) {
    if (typeof param[i] === 'undefined' || param[i] === null)
      throw {status: 400, message: "An expected input value is undefined or null."}; 
  }
}

export const strValidCheck = (...str) => {
  for (const i in str) {
    if (typeof str[i] !== 'string') {
        throw {status: 400, message: `Input is not a string.`};
    }
    if (str[i].trim().length === 0) {
        throw {status: 400, message: `Input can not be empty.`};
    }
  }
}

export const idCheck = (id) => {
    if (!id) throw {status: 400, message: `You must provide an ID to search for.`};
    if (typeof id !== 'string') throw {status: 400, message: `ID must be of type string`};
    id = id.trim();
    if (id.length === 0)
        throw {status: 400, message: `ID can not be a string with just spaces.`};
    if (!ObjectId.isValid(id)) throw {status: 400, message: `ID is not a valid ObjectId.`};
    return id;
}

export const emailValidCheck = (email) => {
    const isValid = EmailValidator.validate(email);
    if (!isValid) throw {status: 400, message: `'${email}' is not a valid Email ID.`};

    return email.trim().toLowerCase()
}

export const usernameValidCheck = (username) => {
    if (username.length < 3) throw {status: 400, message: `'${username}' is shorter than 3 characters.`};
    if (username.length > 20) throw {status: 400, message: `'${username}' is longer than 20 characters.`};
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) throw {status: 400, message: `'${username}' should not contain only Alphabets, Numbers or Underscores.`};
    const regex2 = /[a-zA-Z]/;
    if (!regex2.test(username)) throw {status: 400, message: `'${username}' should contain at least one Alphabet.`};
}

export const passwordValidCheck = (password) => {
    if (password.length < 6) throw {status: 400, message: `Password must be longer than 6 characters.`};
    if (password.length > 20) throw {status: 400, message: `Password can not be longer than 20 characters.`};
    const regex = /\d+/;
    if (!regex.test(password)) throw {status: 400, message: `Password must contain at least 1 number.`};
    const regex2 = /.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?].*/;
    if (!regex2.test(password)) throw {status: 400, message: `Password must contain at least 1 special character.`};
    if (!/[A-Z]/.test(password)) throw {status: 400, message: `Password must contain at least 1 Uppercase character.`};
    const regex3 = /^\S+$/;
    if (!regex3.test(password)) throw {status: 400, message: `Password can not contain spaces.`};
}

export const checkUsernameUnique = async (username) => {
    const userCollection = await users();
    const searchedUser = await userCollection.findOne({username: username});
    if (searchedUser) throw {status: 409, message: `Username: ${username} is already in use.`}
}

export const checkEmailInUse = async (email) => {
    const userCollection = await users();
    const user = await userCollection.findOne({email: email});
    if (user) {
        throw {status: 409, message: `Email ID: ${email} is already in use.`};
    }
}
