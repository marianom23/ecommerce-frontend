'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Order {
    id: number
    orderNumber: string
    status: string
    grandTotal: number
    createdAt: string
    // Agregar más campos según necesites
}

export const GuestOrderTracker = () => {
    const [email, setEmail] = useState('')
    const [orderNumber, setOrderNumber] = useState('')
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const trackOrder = async () => {
        if (!email || !orderNumber) {
            toast.error('Por favor ingresa email y número de orden')
            return
        }

        setLoading(true)
        setError('')
        setOrder(null)

        try {
            const res = await fetch(
                `/api/orders/guest?email=${encodeURIComponent(email)}&orderNumber=${encodeURIComponent(orderNumber)}`
            )

            if (!res.ok) {
                throw new Error('Orden no encontrada')
            }

            const data = await res.json()
            setOrder(data.data)
            toast.success('Orden encontrada')
        } catch (err: any) {
            setError('No se pudo encontrar la orden. Verifica tus datos.')
            toast.error('Orden no encontrada')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-1">
            <h2 className="text-2xl font-semibold mb-6">Rastrear Orden</h2>

            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                </div>

                <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                        Número de Orden
                    </label>
                    <input
                        id="orderNumber"
                        type="text"
                        placeholder="ORD-12345"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="w-full rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                </div>

                <button
                    onClick={trackOrder}
                    disabled={loading}
                    className="w-full bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-dark transition-colors disabled:opacity-60"
                >
                    {loading ? 'Buscando...' : 'Rastrear Orden'}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {order && (
                <div className="mt-6 p-6 border border-gray-3 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Detalles de la Orden</h3>
                    <div className="space-y-2">
                        <p><strong>Número:</strong> {order.orderNumber}</p>
                        <p><strong>Estado:</strong> {order.status}</p>
                        <p><strong>Total:</strong> ${order.grandTotal}</p>
                        <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
