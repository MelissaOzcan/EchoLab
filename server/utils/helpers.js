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

dotenv.config()

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
    const sshKeyPath = path.join(__dirname, '../.ssh/DockerDaemonKey.pem');
    const tempFileName = `code-${uuidv4()}.${extensionMap[language]}`;
    const localFilePath = path.join(__dirname, tempFileName);
    const remoteFilePath = `/home/ubuntu/EchoLab/docker/${language}-runner/${tempFileName}`;

    try {
        // Write user code to local file
        writeFileSync(localFilePath, code);

        const scpCommand = `scp -o StrictHostKeyChecking=no -i ${sshKeyPath} ${localFilePath} ubuntu@18.219.85.188:${remoteFilePath}`;
        const sshCommand = `ssh -o StrictHostKeyChecking=no -i ${sshKeyPath} ubuntu@18.219.85.188 'docker run --rm -v ${remoteFilePath}:` + 
            `/home/ubuntu/EchoLab/docker/${language}-runner/code.${extensionMap[language]} noumxn/${language}-runner'`;

        // Copy local file to the EC2 server
        await executeCommand(scpCommand);
        // Run Docker container on EC2 server
        const output = await executeCommand(sshCommand);
        return output;
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    } finally {
        const deleteCommand = `ssh -o StrictHostKeyChecking=no -i ${sshKeyPath} ubuntu@18.219.85.188 'rm -f ${remoteFilePath}'`;
        await executeCommand(deleteCommand);
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
