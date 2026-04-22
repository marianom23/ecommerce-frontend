"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState, Suspense } from "react";
import * as pixel from "@/utils/pixel";
import { useAuth } from "@/hooks/useAuth";

const MetaPixelComponent = () => {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user } = useAuth();

    useEffect(() => {
        if (!loaded) return;
        pixel.pageview();
    }, [pathname, searchParams, loaded]);

    if (!pixel.FB_PIXEL_ID) {
        console.warn("Meta Pixel ID not found");
        return null;
    }

    // Manual Advanced Matching Data
    // https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching/
    const advancedMatching = user ? {
        em: user.email?.toLowerCase(),
        fn: user.firstName?.toLowerCase(),
        ln: user.lastName?.toLowerCase(),
        ph: user.phone?.toString(),
        external_id: user.id?.toString(),
    } : {};

    // Remove undefined/null values
    const cleanAdvancedMatching = Object.fromEntries(
        Object.entries(advancedMatching).filter(([_, v]) => v != null)
    );

    return (
        <>
            <Script
                id="fb-pixel-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${pixel.FB_PIXEL_ID}', ${JSON.stringify(cleanAdvancedMatching)});
                        fbq('track', 'PageView');
                    `,
                }}
                onReady={() => {
                    console.log('Meta Pixel loaded with ID:', '${pixel.FB_PIXEL_ID}');
                    setLoaded(true);
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${pixel.FB_PIXEL_ID}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    );
};

const MetaPixel = () => {
    return (
        <Suspense fallback={null}>
            <MetaPixelComponent />
        </Suspense>
    );
};

export default MetaPixel;

