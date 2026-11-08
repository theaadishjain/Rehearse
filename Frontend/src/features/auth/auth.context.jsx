import { useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
import { AuthContext } from "./authContext";
import { api } from "../../lib/api";
import ServerWakingBanner from "../../components/ServerWakingBanner";

// A warm server answers in well under a second, so anything slower is a cold start
const SLOW_START_MS = 3000


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    // true only while checking for an existing session when the app first loads
    const [loading, setLoading] = useState(true)
    // true when that first check is slow, which almost always means the backend was asleep
    // (Render's free plan) and is starting up
    const [waking, setWaking] = useState(false)

    useEffect(() => {
        // This first request is also what wakes the backend, as soon as the site opens
        const slowTimer = setTimeout(() => setWaking(true), SLOW_START_MS)
        getMe()
            .then((data) => setUser(data.user))
            // Not logged in (401) is the normal case, and user already starts as null. Don't set
            // it to null here: during a slow start the visitor may log in before this answers,
            // and that would log them straight back out.
            .catch(() => {})
            .finally(() => {
                clearTimeout(slowTimer)
                setWaking(false)
                setLoading(false)
            })
        return () => clearTimeout(slowTimer)
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
        <AuthContext.Provider value={{user,setUser,loading,waking}} >
            {children}
            {waking && <ServerWakingBanner />}
        </AuthContext.Provider>
    )
}
