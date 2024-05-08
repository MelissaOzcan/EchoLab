/**
 * @file app.js
 * @description Starts server with HTTP and WebSocket connection.
 */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import { createServer } from 'https';
import { Server as SocketIOServer } from 'socket.io';
import configRoutes from './api/index.js';

dotenv.config();

const app = express();

const sslOptions = {
    key: fs.readFileSync('ssl/www_echolab_site.key'),
    cert: fs.readFileSync('ssl/www_echolab_site.crt'),
    ca: fs.readFileSync('ssl/www_echolab_site.ca-bundle')
};

const httpsServer = createServer(app, sslOptions);
const io = new SocketIOServer(httpsServer, {
    cors: {
        origin: '*'
    }
});

const corsOptions = {
    origin: `*`,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configRoutes(app);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinChannel', (channel) => {
        socket.join(channel);
        console.log(`User ${socket.id} joined channel ${channel}`);
    });

    socket.on('codeChange', ({ channel, code }) => {
        io.emit('codeUpdate', {channel, code});
    });

    socket.on('languageUpdate', ({ channel, language}) => {
        io.emit('languageUpdate', {channel, language});
    });

    socket.on('updateParticipants', ({ channel, participants }) => {
        io.emit('updateParticipants', {channel, participants});
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

httpsServer.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`We've got a server with HTTP and WebSocket on https://echolab.site:${process.env.PORT}/`);
});
