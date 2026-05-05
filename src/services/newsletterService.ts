import { api } from "@/lib/api";

const base = "/newsletter";

export type NewsletterSubscribeResponse = {
  email: string;
  alreadySubscribed: boolean;
};

export const newsletterService = {
  subscribe(email: string) {
    return api.post<NewsletterSubscribeResponse>(`${base}/subscribe`, { email });
  },
};
