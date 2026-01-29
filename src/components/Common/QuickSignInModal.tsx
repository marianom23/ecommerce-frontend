'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { authService } from '@/services/authService'

interface QuickSignInModalProps {
    isOpen: boolean
    onClose: () => void
}

export function QuickSignInModal({ isOpen, onClose }: QuickSignInModalProps) {
    const router = useRouter()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError('')
        setLoading(true)

        try {
            await authService.oauthCallback({
                idToken: credentialResponse.credential,
                provider: 'GOOGLE'
            })

            // Token ya guardado, redirigir al carrito
            window.location.href = '/cart'
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Error al iniciar sesión con Google')
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('Error al iniciar sesión con Google')
        setLoading(false)
    }

    const handleEmailSignIn = () => {
        onClose()
        router.push('/signin')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Inicia sesión para continuar
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <p className="text-center text-gray-600 text-sm">
                        Necesitas estar autenticado para proceder con el pago
                    </p>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {/* Botón de Google con overlay */}
                    <div className="relative w-full">
                        {/* Visual Button */}
                        <div className="flex w-full justify-center items-center gap-3 rounded-md border border-gray-300 bg-white p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                            </svg>
                            <span className="font-medium">Continuar con Google</span>
                        </div>

                        {/* Functional Overlay - Invisible but Clickable */}
                        <div className="absolute inset-0 opacity-0 z-10 overflow-hidden flex justify-center items-center">
                            <div className="w-full h-full scale-[1.5] origin-center opacity-0 cursor-pointer">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    width="500"
                                    theme="outline"
                                    size="large"
                                    text="signin_with"
                                    shape="rectangular"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divisor */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">O</span>
                        </div>
                    </div>

                    {/* Botón de Email */}
                    <button
                        onClick={handleEmailSignIn}
                        disabled={loading}
                        className="w-full h-12 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-60"
                    >
                        Iniciar sesión con email
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-2">
                        ¿No tienes cuenta?{' '}
                        <button
                            onClick={() => {
                                onClose()
                                router.push('/signup')
                            }}
                            className="text-blue hover:underline font-medium"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
