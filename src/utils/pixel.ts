export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "PageView");
    }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options: any = {}, eventID?: { eventID: string }) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", name, options, eventID);
    }
};
