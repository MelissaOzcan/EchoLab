export function setupWebSocket(io) {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('joinChannel', (channel) => {
            socket.join(channel);
            console.log(`User ${socket.id} joined channel ${channel}`);
        });

        socket.on('codeChange', async ({ channel, code }) => {
            console.log(`Received codeChange event from user ${socket.id} in channel ${channel}. Code: ${code}`);

            socket.to(channel).emit('codeUpdate', { code });
            console.log(`Broadcasted codeUpdate event to channel ${channel}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}
export default setupWebSocket;