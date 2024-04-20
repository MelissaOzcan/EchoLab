/**
 * @file utils/helpers.js
 * @description This file contatins all helper functions.
 */

import { exec } from 'child_process';
import fs, { writeFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import redis from 'redis';

dotenv.config()
const client = redis.createClient();
client.connect().then(() => {});
/**
 * @function generateJWToken
 * @param {string} user
 * @return {token} Returns JWT token
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
    return token;
};


/**
 * @function runCodeInDocker
 * @param {string} language
 * @param {string} code
 * @description This function creates files for user code and runs the code in Docker containers.
 */
export const runCodeInDocker = async (language, code) => {
    const extensionMap = {
        'python': 'py',
        'node': 'js',
        'java': 'java',
        'cpp': 'cpp',
        'rust': 'rs'
    };

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const sshKeyPath = path.join(__dirname, '../utils/NoumanSSH.pem');
    const tempFileName = `code-${uuidv4()}.${extensionMap[language]}`;
    const localFilePath = path.join(__dirname, tempFileName);
    const remoteFilePath = `/home/ubuntu/${language}-runner/${tempFileName}`;

    try {
        // Check if the code already exists in Redis
        const cachedOutput = await client.get(code + "," + language);
        console.log("CachedOutput: " + cachedOutput)
        if (cachedOutput) {
            console.log("Returned from cache")
            return cachedOutput;
        }

        // Write user code to local file
        writeFileSync(localFilePath, code);

        const scpCommand = `scp -i ${sshKeyPath} ${localFilePath} ubuntu@18.188.93.195:${remoteFilePath}`;
        const sshCommand = `ssh -i ${sshKeyPath} ubuntu@18.188.93.195 'docker run --rm -v ${remoteFilePath}:/home/ubuntu/${language}-runner/code.py noumxn/${language}-runner'`;

        // Copy local file to the EC2 server
        await executeCommand(scpCommand);
        // Run Docker container on EC2 server
        const output = await executeCommand(sshCommand);

        // Store the output in Redis
        await client.set(code + "," + language, output);

        return output;
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    } finally {
        fs.unlinkSync(localFilePath);
    }
}

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}
