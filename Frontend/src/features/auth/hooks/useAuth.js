import { useContext, useState } from "react";
import { AuthContext } from "../authContext";
import { login, register, logout } from "../services/auth.api";
import { getErrorMessage } from "../../../lib/api";


export const useAuth = () => {

    const { user, setUser, loading } = useContext(AuthContext)
    const [ submitting, setSubmitting ] = useState(false)
    const [ error, setError ] = useState("")


    /** @returns {Promise<boolean>} whether login succeeded */
    const handleLogin = async ({ email, password }) => {
        setSubmitting(true)
        setError("")
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return true
        } catch (err) {
            setError(await getErrorMessage(err, "Login failed. Please try again."))
            return false
        } finally {
            setSubmitting(false)
        }
    }

    /** @returns {Promise<boolean>} whether registration succeeded */
    const handleRegister = async ({ username, email, password }) => {
        setSubmitting(true)
        setError("")
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return true
        } catch (err) {
            setError(await getErrorMessage(err, "Registration failed. Please try again."))
            return false
        } finally {
            setSubmitting(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch {
            // Even if the request fails, forget the user locally.
        } finally {
            setUser(null)
        }
    }

    return { user, loading, submitting, error, handleRegister, handleLogin, handleLogout }
}
