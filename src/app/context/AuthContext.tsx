"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { resetCart } from "@/redux/features/cart-slice";
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
    const dispatch = useDispatch();
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
                // Token existe, validar con backend (si fallara por expirado, el interceptor lo renueva)
                fetchUser();
            } else {
                // No hay token, aseguramos que el estado sea no autenticado
                setLoading(false);
            }
        } else {
            // En servidor no hacemos fetchUser (esperamos a cliente)
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleLogout = () => {
            console.log("🔒 Evento auth:logout recibido. Limpiando sesión...");
            setUser(null);
            dispatch(resetCart()); // Resetear estado de Redux Cart
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
            }
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [dispatch]);

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
