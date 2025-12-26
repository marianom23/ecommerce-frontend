import { api } from "@/lib/api";

export type BankAccount = {
    id: number;
    bankName: string;
    holderName: string;
    cuil: string;
    accountType: string;
    cbu: string;
    alias: string;
    accountNumber: string;
    active: boolean;
};

export const bankAccountService = {
    getAll() {
        return api.get<BankAccount[]>("/bank-accounts");
    },
};
