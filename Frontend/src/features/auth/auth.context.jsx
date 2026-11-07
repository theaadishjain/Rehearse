import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    // true only while checking for an existing session when the app first loads
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMe()
            .then((data) => setUser(data.user))
            .catch(() => setUser(null)) // not logged in (401) is the normal case
            .finally(() => setLoading(false))
    }, [])

    return (
        <AuthContext.Provider value={{user,setUser,loading}} >
            {children}
        </AuthContext.Provider>
    )
}
