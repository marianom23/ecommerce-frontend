"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import * as analytics from "@/utils/analytics";

const GoogleAnalyticsComponent = () => {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!analytics.GA_MEASUREMENT_ID || !loaded) return;

    const query = searchParams.toString();
    analytics.pageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams, loaded]);

  if (!analytics.GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analytics.GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${analytics.GA_MEASUREMENT_ID}', { send_page_view: false });
          `,
        }}
      />
    </>
  );
};

const GoogleAnalytics = () => (
  <Suspense fallback={null}>
    <GoogleAnalyticsComponent />
  </Suspense>
);

export default GoogleAnalytics;
