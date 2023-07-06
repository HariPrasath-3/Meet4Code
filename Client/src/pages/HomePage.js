import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import ShortUniqueId from 'short-unique-id';
import toast from 'react-hot-toast';
import copy from 'copy-to-clipboard';
import 'materialize-css/dist/css/materialize.min.css';

const HomePage = () => {
    const Suid = new ShortUniqueId();
    const history = useNavigate();
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const [userName, setUserName] = useState();
    const [roomId, setRoomId] = useState(null);
    const [isInterviewer, setIsInterviewer] = useState(false);

    const generateRoomId = (event) => {
        event.preventDefault();
        let code  = Suid(10);
        setRoomId(code);
        if (copy(code))
            toast.success('Room ID copied');
        else toast.error('Cannot copy to clipboard');
    };

    const handleRoomIdChange = (event) => {
        event.preventDefault();
        const input = event.target.value;        
        setRoomId(input);
    };

    const handleNameChange = (event) => {
        event.preventDefault();
        let name = event.target.value;
        setUserName(name);
    };

    const joinRoom = (event) => {
        event.preventDefault();
        if(!roomId  || roomId.length==0) {
            toast('Please generate or fill the room ID', {icon: '❕'});
            return;
        }
        if(!userName || userName.length==0) {
            toast.error("Name field is empty");
            return;
        }
        if (roomId && !alphanumericRegex.test(roomId)) {
            toast('Please enter alphanumeric code');
            setRoomId('');
            return;
        }
        if(roomId.length>10) {
            toast('Enter only 10 character room ID');
            setRoomId('');
            return;
        }
        toast.success('Joining new Call');
        history(`/room/${roomId}`, {
            state: {
                username: userName,
                interviewer:isInterviewer,
            }
        });
    };

    return (        
        <div className="row">
            <div className="col s12" style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '100px'
            }}>
                <div className="card">
                    <div className="card-content">
                        <span className="card-title">Welcome to Meet4Code</span>
                        <div className="input-field">
                            <input
                                type="text"
                                placeholder="#uniqueId"
                                value={roomId}
                                onChange={handleRoomIdChange}
                            />
                            <button className="waves-effect waves-light btn" onClick={generateRoomId}>Generate</button>
                        </div>
                        <div className="input-field">
                            <input
                                type="text"
                                placeholder="Enter your good Name"
                                value={userName}
                                onChange={handleNameChange}
                            />
                        </div>
                        <p>
                            <label>
                            <input
                                type="checkbox"
                                className="filled-in"
                                checked={isInterviewer}
                                onChange={() => setIsInterviewer(!isInterviewer)}
                            />
                            <span>Is Interviewer</span>
                            </label>
                        </p>
                        <div className="input-field">
                            <button className="waves-effect waves-light btn" onClick={joinRoom}>Join Call</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;