import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('adminInfo');
    };

    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminInfo');
        if (storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (e) {
                localStorage.removeItem('adminInfo');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
