import './App.css';
import React, {useCallback, useContext, useState, useEffect, createContext, useReducer} from 'react';
import {Route , BrowserRouter , Routes} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import RoomPage from './pages/RoomPage';

export const UserContext = createContext();

function App() {
  // const [state, dispatch] = useReducer(reducer, initialState);
    const [user, setUser] = useState(null);
        return (
        <UserContext.Provider value={{user, setUser}}>
            <div>
                <Toaster 
                    position='top-right'
                />
            </div>
            <BrowserRouter >
            <div className='App'>
                {/* <MyNavbar/> */}
                    <Routes>
                        <Route eaxct path="/" element={<HomePage/>} />
                        <Route eaxct path="/room/:roomId" element={<RoomPage/>} />
                        <Route path="*" element={<NotFound/>} />
                    </Routes>
                {/* </div> */}
            </div>
            </BrowserRouter>
        </UserContext.Provider>
    );
}

export default App;
