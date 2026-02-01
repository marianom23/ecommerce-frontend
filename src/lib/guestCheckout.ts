import type { CartItem } from '@/types/cart'

export const isGuest = (user: any, token: string | null): boolean => {
    return !user || !token
}

// Por ahora retorna true (asumimos que se requiere shipping)
// TODO: Implementar cuando tengamos fulfillmentType en CartItem o en OrderItem
export const requiresShipping = (items: any[]): boolean => {
    // Si el array de items está vacío, no requiere shipping
    if (!items || items.length === 0) return false

    // Por defecto, asumimos que requiere shipping
    // En el futuro, aquí verificaremos item.fulfillmentType
    return true
}

export const getCheckoutFlow = (isGuest: boolean, requiresShip: boolean) => {
    return {
        showShipping: requiresShip,
        billingFormType: 'minimal' // Siempre mínimo ya que billing no requiere dirección
    }
}
