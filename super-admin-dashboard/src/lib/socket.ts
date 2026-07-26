import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const baseUrl = (import.meta as any)?.env?.VITE_BACKEND_URL || 'http://localhost:3001';
    socket = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Admin dashboard socket connected:', socket?.id);
      socket?.emit('join-admin-room');
    });

    socket.on('disconnect', () => {
      console.log('Admin dashboard socket disconnected');
    });
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
