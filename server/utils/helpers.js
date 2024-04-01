/**
 * @file utils/helpers.js
 * @description This file contatins all helper functions.
 */

import { exec } from 'child_process';
import { unlinkSync, writeFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function generateJWToken
 * @param {string} user
 * @return {JWT} Returns JWT token
 * @description This function creates a JWT token based on user details.
 */

export const generateJWToken = (user) => {
    const expiresIn = '2h'; // Token expiration time
    const payload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    console.log("\nToken Original Value: ", token);
    return token;
};

/**
 * @function runCodeInDocker
 * @param {string} language
 * @param {string} code
 * @description This function creates files for user code and runs the code in Docker containers.
 */

export const runCodeInDocker = async (language, code) => {
    return new Promise((resolve, reject) => {
        const extensionMap = {
            'python': 'py',
            'node': 'js',
            'java': 'java',
            'cpp': 'cpp',
            'rust': 'rs'
        };

        const fileExtension = extensionMap[language];
        if (!fileExtension) {
            return reject(new Error(`Unsupported language: ${language}`));
        }

        const tempFileName = `/tmp/code-${uuidv4()}.${fileExtension}`;
        writeFileSync(tempFileName, code);

        exec(`docker run --rm -v ${tempFileName}:/usr/src/app/code.${fileExtension} ${language}-runner`,
            (error, stdout, stderr) => {
                unlinkSync(tempFileName);

                if (error) {
                    return reject(error);
                }
                if (stderr) {
                    return reject(stderr);
                }
                resolve(stdout);
            }
        );
    });
}
