import jwt from 'jsonwebtoken';
import { writeFileSync, unlinkSync } from 'fs';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

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

export const runCodeInDocker = async (language, code) => {
    return new Promise((resolve, reject) => {
        const extensionMap = {
            'python': 'py',
            'node': 'js',
            'java': 'java',
            'cpp': 'cpp',
            'csharp': 'cs',
            'rust': 'rs',
            'r': 'r',
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
