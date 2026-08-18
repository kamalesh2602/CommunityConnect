import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('userInfo');
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

    const login = async (role, credentials) => {
        try {
            const endpoint = role === 'volunteer' ? '/volunteer/login' : '/ngo/login';
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, credentials);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (role, userData) => {
        try {
            const endpoint = role === 'volunteer' ? '/volunteer/register' : '/ngo/register';
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, userData);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const updateUser = (updatedData) => {
        const updated = { ...user, ...updatedData };
        setUser(updated);
        localStorage.setItem('userInfo', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
