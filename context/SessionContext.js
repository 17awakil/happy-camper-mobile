import { createContext, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState({});

    return (
        <SessionContext.Provider value={{ sessionId, setSessionId }}>
            {children}
        </SessionContext.Provider>
    )
}

export default SessionContext;
