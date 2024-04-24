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
import setupWebSocket from './sockets/socketManager.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'], 
    credentials: true // If you're using cookies or other credentials
}));

io.use((socket, next) => {
    const origin = socket.handshake.headers.origin;
    if (origin && (origin === 'http://localhost:5173' || origin === `http://localhost:${process.env.CLIENT_PORT}`)) {
        return next();
    }
    return next(new Error('Invalid CORS origin'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configRoutes(app);
setupWebSocket(io);
io.listen(5173);

httpServer.listen(process.env.PORT, () => {
    console.log(`We've got a server with HTTP and WebSocket on http://localhost:${process.env.PORT}/`);
});
