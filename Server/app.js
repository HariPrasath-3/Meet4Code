const express  = require('express')
const app = express();
const server = require('http').createServer(app);
const cors  = require('cors');
const { log } = require('console');
const ACTIONS = require('./actions.js');

const PORT = 3007;
app.use(cors({
    origin:'*',
    methods: ['GET','POST']
}));
app.use(express.json());

const io = require('socket.io')(server, {
    cors: {
        origin:'*',
        methods: ['GET','POST']
    }
});

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, (userName, peerId, roomId, isInterviwer) => {
        console.log(userName +' joined '+ roomId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit(ACTIONS.JOINED, userName, socket.id, isInterviwer, peerId);
        socket.on('disconnect', () => {
            console.log(userName +' left '+ roomId);
            socket.broadcast.to(roomId).emit(ACTIONS.DISCONNECTED, socket.id, userName, peerId);
            socket.broadcast.to(roomId).emit(ACTIONS.HOST_DISCONNECTED, peerId);
            socket.leave();
        });
    });

    socket.on(ACTIONS.SHARE_DETAILS, (socketId, userName, peerId, isInterviwer) => {
        io.to(socketId).emit(ACTIONS.SHARE_DETAILS, userName, peerId, isInterviwer);
    });

    socket.on(ACTIONS.SYNC_CODE, (socketId, globalCode) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, globalCode);
    });

    socket.on(ACTIONS.SEND_MSG, (roomId, sender, msg) => {
        socket.broadcast.to(roomId).emit(ACTIONS.RECV_MSG, sender, msg);
    });

    socket.on(ACTIONS.CODE_CHANGE, (roomId, code) => {
        socket.broadcast.to(roomId).emit(ACTIONS.CODE_CHANGE, code);
    });

    socket.on(ACTIONS.LANG_CHANGE, (roomId, lang) => {
        socket.broadcast.to(roomId).emit(ACTIONS.UPDATE_LAN, lang);
    });    
})

server.listen(PORT, ()=> {
    console.log('Server is running on ' , PORT);
});
