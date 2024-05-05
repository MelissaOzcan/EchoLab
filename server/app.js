/**
 * @file app.js
 * @description Starts server with HTTP and WebSocket connection.
 */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import configRoutes from './api/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*'
    }
});

const corsOptions = {
    origin: `http://localhost:${process.env.CLIENT_PORT}`,
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

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

httpServer.listen(process.env.PORT, () => {
    console.log(`We've got a server with HTTP and WebSocket on http://localhost:${process.env.PORT}/`);
});
