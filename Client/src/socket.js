import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
      reconnectionAttempt: 'Infinity',
      timeout: 10000,
      transports: ['websocket'],
    };
    return io('http://localhost:3007', options);
  };