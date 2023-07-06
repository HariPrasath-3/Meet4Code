import React, {useEffect, useState, useRef} from 'react';
import { useLocation } from 'react-router-dom';
import ACTIONS from '../actions';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import 'materialize-css/dist/css/materialize.min.css';

// codemirror components
import { useCodeMirror } from '@uiw/react-codemirror';

// import languages 
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

// import themes 
import { githubDark } from '@uiw/codemirror-theme-github';
import { xcodeDark, xcodeLight } from '@uiw/codemirror-theme-xcode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';


const Editor = ({ socket, roomId, setglobalCode, globalCode }) => {
    const history = useLocation();
    const location = useLocation();
    const username = location?.state?.username;
    const [code, setCode] = useState();
    const [theme, setTheme] = useState(githubDark);
    const [extensions, setExtensions] = useState([javascript()])
    const [placeholder, setPlaceholder] = useState('Please enter the code.');
    const thememap = new Map();
    const langnMap = new Map();    
    const editor = useRef(null);

    const {setContainer} = useCodeMirror({
        container: editor.current,
        extensions,
        value: globalCode,
        theme,
        editable: true,
        height: `70vh`,
        width:`100%`,
        basicSetup:{
            foldGutter: false,
            dropCursor: false,
            indentOnInput: false,
        },
        options:{
            autoComplete:true,
            },
        placeholder : placeholder,
        style : {
            position: `relative`,
            zIndex: `999`,
            borderRadius: `10px`,
          },
        onChange:  (value) => {
            setglobalCode(value);
            socket.current?.emit(ACTIONS.CODE_CHANGE, roomId, value);
        }
    });

    const themeInit = () => {
        thememap.set("githubDark",githubDark)
        thememap.set("xcodeDark",xcodeDark)
        thememap.set("eclipse",eclipse)
        thememap.set("xcodeLight",xcodeLight)
        thememap.set("abcdef",abcdef)
        thememap.set("solarizedDark",solarizedDark)
    }

    const langInit = () => {
        langnMap.set('java', java)
        langnMap.set('cpp', cpp)
        langnMap.set('javascript', javascript)
        langnMap.set('python', python)
    }

    themeInit();
    langInit();

    const handleThemeChange = (event) => {
        setTheme(thememap.get(event.target.value));
    };

    const handleLanguageChange = (event) => {
        event.preventDefault();
        setExtensions([langnMap.get(event.target.value)()]);
        socket.current?.emit(ACTIONS.LANG_CHANGE, roomId, event.target.value)
    };

    const updateCode = (event) => {
        event.preventDefault();
        socket.current?.emit(ACTIONS.CODE_CHANGE, roomId, code);
    };

    const copyCode = (event) => {
        event.preventDefault();
        if (copy(roomId))
            toast.success('Session ID copied');
        else toast.error('Cannot copy to clipboard');
    };

    useEffect(() => {
        if(!editor.current) { 
            alert('error loading editor')
            history('/')
        }
        if(editor.current) {
            setContainer(editor.current)
        }

        socket.current?.on(ACTIONS.CODE_CHANGE, (data) => {
            if(data !==null && data!==null && data!=code) {
                setglobalCode(data);
            }   
        });

        socket.current?.on(ACTIONS.UPDATE_LAN, (lang) => {
            console.log(lang);
            setExtensions([langnMap.get(lang)()]);
        });

    },[editor.current, socket.current])

    return (
        <div className="col s7" style={{padding: '25px'}}>
            <div className='row'>
                <div className='col s6'>
                    <div className='input-field'>
                        <span>Theme:</span>
                        <select className='browser-default' onChange={handleThemeChange}>
                            <option default value={"githubDark"}>githubDark</option>
                            <option value={"eclipse"}>eclipse</option>
                            <option value={"xcodeLight"}>xcodeLight</option>
                            <option value={"xcodeDark"}>xcodeDark</option>
                            <option value={"solarizedDark"}>solarizedDark</option>
                            <option value={"abcdef"}>abcdef</option>
                        </select>
                    </div>
                </div>
                <div className='col s6'>      
                    <div className='input-field'>
                        <span>Language:</span>
                        <select className='browser-default' onChange={handleLanguageChange}>
                            <option default value={"javascript"}>javascript</option>
                            <option value={"java"}>java</option>
                            <option value={"cpp"}>cpp</option>
                            <option value={"python"}>python</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className='input-field'>
                <div ref={editor} className='ide' style={{marginBottom: "20px"}}></div>
            </div>
            {/* <div className='input-field'>
                <button className='btn waves-effect waves-light' style={{marginRight: '20px'}} onClick={updateCode}>Update Code</button>
                <button className='btn waves-effect waves-light' onClick={copyCode}>Copy Session Id</button>
            </div>   */}
        </div>          
    );
}

export default Editor;
