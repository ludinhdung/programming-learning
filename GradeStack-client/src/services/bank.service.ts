import { Bank } from '../types/bank';

interface BankApiResponse {
    code: string;
    data: Array<{
        shortName: string;
        bin: string;
        code: string;
    }>;
}

export const fetchBankList = async (): Promise<Bank[]> => {
    try {
        const response = await fetch('https://api.vietqr.io/v2/banks');
        const data: BankApiResponse = await response.json();

        if (data.code === '00') {
            return data.data.map((bank) => ({
                name: bank.shortName,
                code: bank.bin,
                bin: bank.bin
            }));
        }
        throw new Error('Failed to fetch bank list');
    } catch (error) {
        console.error('Error fetching bank list:', error);
        throw error;
    }
};

