import React, {useState, useRef, useEffect} from "react";
import { initSocket } from '../socket';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Peer } from 'peerjs'
import Editor from '../components/Editor';
import VideoStream from "../components/VideoStream";
import Chat from "../components/Chat";
import ACTIONS from "../actions";
import toast from 'react-hot-toast';
import 'materialize-css/dist/css/materialize.min.css';

const RoomPage = () => {
    const location = useLocation();
    const history = useNavigate();
    const { roomId } = useParams(null);
    const [myPeerId, setMyPeerId] = useState();
    const [globalCode, setglobalCode] = useState(`Hello World`);
    const [stream, setstream] = useState();
    const socket = useRef(null);
    const myVideo = useRef();

    const myName = location.state?.username;
    const isInterviewer = location.state?.interviewer?true:false; 
    const peerIdToUsername = {};
    const peerIdToCall = {};
    const peerIdToIsIntv = {};
    
    var dataStream = null;
    var peer = null;

    const handleErrors = (err) => {
        console.log('socket error', err);
        toast.error('Socket connection failed, try again later.');
        history('/');
        return;
    }

    const init = async (videoStream) => {
        try {
            socket.current = await initSocket();
            socket.current.on('connect_error', (err) => handleErrors(err));
            socket.current.on('connect_failed', (err) => handleErrors(err));

            peer = new Peer();      

            peer.on('open', (id) => {
                setMyPeerId(id);
                // Join the room
                socket.current.emit(ACTIONS.JOIN, myName, id, roomId, isInterviewer);
            });

            // Call is created after Details are shared.
            socket.current.on(ACTIONS.SHARE_DETAILS, (userName, peerId, isInterviwer) => {
                peerIdToUsername[peerId] = userName;
                peerIdToIsIntv[peerId] = isInterviwer;
                console.log(userName, isInterviwer);
                const call = peer.call(peerId, videoStream);
                call.on('stream', (remoteStream) => {
                    addVideo(remoteStream, peerId, userName, isInterviwer);
                });
                call.on('close', () => {
                    const element = document.getElementById(peerId);
                    element?.remove();
                });
                peerIdToCall[peerId] = call;
            });

            // Answer the call
            peer.on('call', (call) => {
                call.answer(videoStream);
                call.on('stream', (remoteStream) => {
                    addVideo(remoteStream, call.peer, peerIdToUsername[call.peer], peerIdToIsIntv[call.peer]);
                });
                socket.current.on(ACTIONS.HOST_DISCONNECTED, (peerId) => {
                    if(call.peer == peerId)call.close();
                });
                call.on('close', () => {
                    console.log('in close');
                    const element = document.getElementById(call.peer);
                    if(element)console.log('Element Found');
                    element?.remove();
                });                
            });            

            // Respond to new user joined by sharing your details.
            socket.current.on(ACTIONS.JOINED, (userName, socketId, isInterviwer, peerId) => {
                if(isInterviwer)toast.success('Interviewer Joined');
                else toast.success(`${userName} joined the room.`);
                peerIdToUsername[peerId] = userName;
                peerIdToIsIntv[peerId] = isInterviwer;
                socket.current.emit(ACTIONS.SYNC_CODE, socketId, globalCode);                
                socket.current.emit(ACTIONS.SHARE_DETAILS, socketId, myName, peer.id, isInterviewer);
            });

            // Listening for disconnected.
            socket.current.on(ACTIONS.DISCONNECTED, (socketId, username, peerId) => {
                toast.success(`${username} left the room.`);
                if(peerIdToCall[peerId])peerIdToCall[peerId].close();                
                delete peerIdToCall[peerId];
            });

        } catch (error) {
            handleErrors(error);
        }        
    }

    const handleLeave = () => {
        history('/');
    };

    const addVideo = (stream, peerID, userName, isInterviwer) => {
        const peerVideoGrid = document.getElementById('peerVideoGrid');
        const peerVideoContainer = document.createElement('div');
        peerVideoContainer.setAttribute('class', 'card-panel');
        peerVideoContainer.setAttribute('id', peerID);
        peerVideoContainer.style.height = '230px';
        peerVideoContainer.style.width = '90%';
        peerVideoContainer.style.margin = "auto";
        peerVideoContainer.style.marginBottom = "15px";
        if(isInterviwer)peerVideoContainer.style.border = '2px solid #ff3300';
        const video = document.createElement('video');
        video.setAttribute('class', 'card-content');
        video.srcObject = stream;
        video.muted = true;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        video.style.height = '80%';
        video.style.width = '100%'
        video.style.border = '1px solid #000';
        video.style.borderRadius = '5%';
        video.style.margin = 'auto';
        video.style.marginBottom = "10px";
        const span = document.createElement('span');
        span.setAttribute('class', 'card-title');
        span.style.display = 'block';
        span.innerText = userName;
        peerVideoContainer.append(video);
        peerVideoContainer.append(span);
        const exist = document.getElementById(peerID)
        if(exist) return;
        peerVideoGrid.append(peerVideoContainer);
    };

    useEffect(() => {   
        navigator?.mediaDevices?.getUserMedia({video : true, audio : true})
        .then(videoStream => {
            dataStream = videoStream;
            myVideo.current.srcObject = videoStream;
            // initialize socket connection...
            init(videoStream);
        })
        .catch((error) => {
            console.log(error);
            alert('Camera permissions nedded to proceed with the Call');
        });

        return () => {
            console.log('Disconnected!!');
            if (dataStream) {
                const tracks = dataStream.getTracks();
                tracks.forEach((track) => track.stop());
            }
            socket.current?.removeAllListeners();
            socket.current?.disconnect();
        };   
    }, []);

    return (
        <div className="row">
            <Editor 
                socket={socket}
                roomId={roomId}                    
                globalCode = {globalCode}
                setglobalCode = {setglobalCode}
            />
            <VideoStream/>
            <div className="col" style={{paddingTop: '30px', width: '260px'}}>               
                <div className="card-panel" style={{height: '200px'}}>
                    <video ref={myVideo} className="card-content" style={{height: "80%", width: "100%", border: "1px solid #000", borderRadius: "5%"}} muted autoPlay playsInline/>
                    <div className="card-action" style={{height: "20%", padding: "10px"}}>
                        <span className="card-title">{myName}</span>
                    </div>
                </div>                                       
                <Chat
                    socket = {socket}
                    roomId = {roomId}
                    userName = {myName}
                />
                <button type="submit" className="waves-effect waves-light orange darken-4 btn" style={{display: 'block', margin: 'auto', width: '80%'}} onClick={handleLeave}>
                    Leave
                </button>
            </div>            
        </div>
    )
}

export default RoomPage