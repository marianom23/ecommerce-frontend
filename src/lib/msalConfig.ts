// lib/msalConfig.ts
import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
    auth: {
        clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || 'common'}`,
        redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);
