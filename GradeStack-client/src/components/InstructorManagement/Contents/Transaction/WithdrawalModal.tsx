import React, { useState } from 'react';
import { formatVND } from '../../../../utils/formatCurrency';

interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onSuccess: (amount: number, accountNumber: string, accountHolder: string, bank: string) => void;
    isLoading: boolean;
    bankInfo: BankInfo | null;
}

const WithdrawalModal = ({
    isOpen,
    onClose,
    balance,
    onSuccess,
    isLoading,
    bankInfo
}: WithdrawalModalProps) => {
    const [amount, setAmount] = useState("");
    const [error, setError] = useState<string>('');

    if (!isOpen) return null;

    const validateAmount = (value: number): string => {
        if (!value) return 'Please enter withdrawal amount';
        if (value > balance) return 'Amount exceeds available balance';
        if (value < 100000) return 'Minimum withdrawal amount is 100,000 VND';
        return '';
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setAmount(value.toString());
        setError(validateAmount(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        const validationError = validateAmount(numericAmount);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!bankInfo) {
            setError("Bank information is missing");
            return;
        }

        setError('');
        onSuccess(numericAmount, bankInfo.accountNumber, bankInfo.accountName, bankInfo.bankName);
        setAmount('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Request Withdrawal</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Balance Display */}
                <div className="mb-6 p-4 bg-zinc-700/50 rounded-lg">
                    <div className="text-gray-400 mb-2">Available Balance</div>
                    <div className="text-2xl font-bold text-white">{formatVND(balance)}</div>
                </div>

                {/* Bank Information */}
                {bankInfo ? (
                    <div className="mb-6 p-4 bg-zinc-700/50 rounded-lg">
                        <div className="text-gray-400 mb-2">Bank Information</div>
                        <div className="space-y-1">
                            <div className="text-white">
                                <span className="text-gray-400">Bank:</span> {bankInfo.bankName}
                            </div>
                            <div className="text-white">
                                <span className="text-gray-400">Account Number:</span> {bankInfo.accountNumber}
                            </div>
                            <div className="text-white">
                                <span className="text-gray-400">Account Holder:</span> {bankInfo.accountName}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-zinc-700/50 rounded-lg text-red-500">
                        Please add your bank information before requesting a withdrawal
                    </div>
                )}

                {/* Withdrawal Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Withdrawal Amount
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter amount"
                                min="0"
                                max={balance}
                                step="0.01"
                                required
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>




                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !!error || parseFloat(amount) <= 0 || parseFloat(amount) > balance || !bankInfo}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalModal; 