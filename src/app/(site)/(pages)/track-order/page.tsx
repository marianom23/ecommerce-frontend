import { GuestOrderTracker } from '@/components/Orders/GuestOrderTracker'
import Breadcrumb from '@/components/Common/Breadcrumb'

export const metadata = {
    title: 'Rastrear Orden | HorneroTech',
    description: 'Rastrea el estado de tu orden ingresando tu email y número de orden',
}

export default function TrackOrderPage() {
    return (
        <>
            <Breadcrumb title="Rastrear Orden" pages={["Rastrear Orden"]} />
            <section className="py-20 bg-gray-2">
                <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
                    <GuestOrderTracker />
                </div>
            </section>
        </>
    )
}
