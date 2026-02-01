'use client'

import Link from 'next/link'

export const GuestRegistrationBanner = ({ email }: { email: string }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold mb-2">
                ¿Querés ver todas tus compras?
            </h3>
            <p className="text-gray-700 mb-4">
                Registrate con <strong>{email}</strong> y vincularemos esta orden a tu cuenta.
            </p>
            <Link
                href={`/signup?email=${encodeURIComponent(email)}`}
                className="inline-block bg-blue text-white px-6 py-2 rounded-md hover:bg-blue-dark transition-colors"
            >
                Crear cuenta
            </Link>
        </div>
    )
}
