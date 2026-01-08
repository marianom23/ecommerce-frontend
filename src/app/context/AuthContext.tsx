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
                localStorage.removeItem('auth_token');
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Sincronizar token desde cookie a localStorage (para OAuth)
    useEffect(() => {
        const syncTokenFromCookie = async () => {
            if (typeof window !== 'undefined' && user) {
                const storedToken = localStorage.getItem('auth_token');

                // Si hay usuario autenticado pero no hay token en localStorage
                if (!storedToken) {
                    console.log('🔑 Usuario autenticado sin token en localStorage (OAuth flow)');
                    try {
                        const tokenData = await authService.getToken();
                        if (tokenData?.token) {
                            localStorage.setItem('auth_token', tokenData.token);
                            console.log('✅ Token sincronizado desde cookie a localStorage');
                        }
                    } catch (error) {
                        console.warn('⚠️ No se pudo obtener token:', error);
                    }
                }
            }
        };

        syncTokenFromCookie();
    }, [user]);

    useEffect(() => {
        // Verificar si hay token en localStorage antes de hacer la petición
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
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
