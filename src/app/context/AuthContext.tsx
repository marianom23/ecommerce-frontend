"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";

interface AuthContextType {
    user: any;
    loading: boolean;
    isAuthenticated: boolean;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    refreshAuth: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await authService.me();
            setUser(res);
        } catch (error) {
            // Token inválido/expirado - limpiar localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Verificar si hay token en localStorage antes de hacer la petición
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                // Token existe, validar con backend
                fetchUser();
            } else {
                // Intentar hacer una petición por si hay cookie (OAuth)
                fetchUser();
            }
        } else {
            fetchUser();
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                refreshAuth: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
