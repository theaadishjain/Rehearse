import axios from "axios"

/**
 * Single API client for the whole app. The backend URL comes from VITE_API_URL
 * (see Frontend/.env.example) instead of being hardcoded in every service file.
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
})

/**
 * Turns an axios error into a message that can be shown to the user.
 */
export async function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
    if (err?.response) {
        let data = err.response.data
        // Responses requested as blobs (e.g. the PDF download) carry JSON errors as a Blob.
        if (data instanceof Blob) {
            try { data = JSON.parse(await data.text()) } catch { data = null }
        }
        return data?.message || fallback
    }
    if (err?.request) {
        return "Can't reach the server. Check your internet connection and try again."
    }
    return fallback
}
