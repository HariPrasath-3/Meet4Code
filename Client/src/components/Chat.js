import React, {useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../actions';

const Chat = ({socket, roomId, userName}) => {
    const [msg, setmsg] = useState('');
    useEffect(() => {
        socket.current?.on(ACTIONS.RECV_MSG, (sender, msg) => {
            console.log(sender, msg);
            addRecvMsg(msg, sender);
        });
    },[socket.current]);

    const handleChange = (e) => {
        setmsg(e.target.value);
    };

    const handleSend = (event) => {
        event.preventDefault();
        if(msg.length==0) return;        
        socket.current?.emit(ACTIONS.SEND_MSG, roomId, userName, msg);
        addSendMsg(msg);
        setmsg('');
    };

    const addRecvMsg = (msg, name='Unknown') => {
        const element = 
        `<div class='receive'>
            <div class='msg'>
                <span class='senderName' >${name}: </span>${msg}
            </div>
        </div>`;
        const newDiv = document.createElement('div');
        newDiv.innerHTML = element;
        newDiv.setAttribute('class', 'msg-container');
        const par = document.getElementById('msg-div');
        par?.appendChild(newDiv);  
        par.scrollTop = par.scrollHeight;
    };

    const addSendMsg = (msg) => {
        const element = 
        `<div class='send'>
            <div class='msg'>
                <span class='senderName' >You: </span>${msg}
            </div>
        </div>`;
        const newDiv = document.createElement('div');
        newDiv.innerHTML=element;
        newDiv.setAttribute('class', 'msg-container');        
        const par = document.getElementById('msg-div');
        par?.appendChild(newDiv);
        par.scrollTop = par.scrollHeight;
    };

    return (
        <div className="card-panel" style={{height: '320px'}}>
            <div className="display-container" style={{ height: '55%'}}> 
                <div id="msg-div" style={{maxHeight: '100%', overflowY: 'auto'}}></div>            
            </div>
            <div className="send-container" style={{ height: '45%'}}>
                <div className="input-field">
                <input
                    type="text"
                    id="message-input"
                    placeholder="Enter message"
                    name="msg"
                    value={msg}
                    onChange={handleChange}
                    className="validate"
                />
                </div>
                <button type="submit" className="waves-effect waves-light btn" style={{margin: '0px'}} onClick={handleSend}>
                    Send
                    <i className="material-icons right">send</i>
                </button>
            </div>
        </div>
    );
}

export default Chat;