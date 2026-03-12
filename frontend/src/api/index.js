import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
});

// Attach fresh Firebase ID token to every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401, sign out
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response?.status === 401) {
            await auth.signOut();
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
