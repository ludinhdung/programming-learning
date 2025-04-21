import apiClient from './apiClient';

export interface AdminTransaction {
    id: string;
    amount: number;
    type: 'REVENUE' | 'WITHDRAWAL';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    qrUrl: string;
    createdAt: string;
    instructor: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}

const adminService = {
    async getAllTransactions(): Promise<AdminTransaction[]> {
        const response = await apiClient.get('/admin/transactions');
        return response.data.data;
    },

    async getTransactionById(id: string): Promise<AdminTransaction> {
        const response = await apiClient.get(`/admin/transactions/${id}`);
        return response.data.data;
    },

    async updateTransactionStatus(
        id: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED'
    ): Promise<AdminTransaction> {
        const response = await apiClient.patch(`/admin/transactions/${id}/status`, { status });
        return response.data.data;
    }
};

export default adminService;
