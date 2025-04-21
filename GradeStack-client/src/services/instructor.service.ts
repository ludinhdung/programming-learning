import api from './api'

export const bankService = {

    // Bank Information Management
    async createBankInfo(instructorId: string, bankInfo: { bankName: string; accountNumber: string; accountName: string }) {
        const response = await api.post(`/instructors/${instructorId}/bank-info`, bankInfo);
        return response.data;
    },

    async getBankInfo(instructorId: string) {
        const response = await api.get(`/instructors/${instructorId}/bank-info`);
        return response.data;
    },

    async updateBankInfo(instructorId: string, bankInfo: { bankName: string; accountNumber: string; accountName: string }) {
        const response = await api.put(`/instructors/${instructorId}/bank-info`, bankInfo);
        return response.data;
    },

    async deleteBankInfo(instructorId: string) {
        const response = await api.delete(`/instructors/${instructorId}/bank-info`);
        return response.data;
    },

    // Wallet Management
    async getInstructorWallet(instructorId: string) {
        const response = await api.get(`/instructors/${instructorId}/wallet`);
        return response.data;
    },

    async requestWithdrawal(instructorId: string, amount: number, accountNumber: string, accountHolder: string, bank: string) {
        const response = await api.post(`/instructors/${instructorId}/wallet/withdraw`, { amount, accountNumber, accountHolder, bank });
        return response.data;
    }
};

