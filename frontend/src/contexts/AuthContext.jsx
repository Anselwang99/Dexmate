import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            authAPI
                .getMe()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Listen for storage changes in other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "token") {
                if (e.newValue) {
                    // Token changed in another tab, fetch new user data
                    authAPI
                        .getMe()
                        .then((res) => setUser(res.data))
                        .catch(() => {
                            localStorage.removeItem("token");
                            setUser(null);
                        });
                } else {
                    // Token removed in another tab
                    setUser(null);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        console.log("Login response:", res.data);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        console.log("User state set to:", res.data.user);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await authAPI.register({ name, email, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
