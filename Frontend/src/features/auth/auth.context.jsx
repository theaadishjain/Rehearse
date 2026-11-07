import { useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
import { AuthContext } from "./authContext";
import { api } from "../../lib/api";


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

    // The login lasts 24 hours. When it runs out (or the user logged out in another tab), the
    // server answers 401: forget the user so the app sends them back to log in, instead of
    // showing a logged-in page where every action fails.
    useEffect(() => {
        const interceptor = api.interceptors.response.use(undefined, (err) => {
            const url = err.config?.url || ""
            if (err.response?.status === 401 && !url.startsWith("/api/auth/")) setUser(null)
            return Promise.reject(err)
        })
        return () => api.interceptors.response.eject(interceptor)
    }, [])

    return (
        <AuthContext.Provider value={{user,setUser,loading}} >
            {children}
        </AuthContext.Provider>
    )
}
