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

    // Instructor Statistics
};

export const instructorService = {
    // Statistics
    async getInstructorStatistics(instructorId: string, courseId?: string, dateRange: '7d' | '30d' | 'all' = 'all') {
        const response = await api.get(`/instructors/${instructorId}/statistics`, {
            params: {
                courseId,
                dateRange
            }
        });
        return response.data;
    },

    // Get statistics for all courses
    async getAllCoursesStatistics(instructorId: string, dateRange: '7d' | '30d' | 'all' = 'all') {
        return this.getInstructorStatistics(instructorId, undefined, dateRange);
    },

    // Get statistics for a specific course
    async getCourseStatistics(instructorId: string, courseId: string, dateRange: '7d' | '30d' | 'all' = 'all') {
        return this.getInstructorStatistics(instructorId, courseId, dateRange);
    }
};

