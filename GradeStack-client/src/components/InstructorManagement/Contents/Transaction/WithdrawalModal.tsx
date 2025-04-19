import React, { useState } from 'react';
import { formatVND } from '../../../../utils/formatCurrency';
import { instructorService } from '../../../../services/api';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onSuccess: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, balance, onSuccess }) => {
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const validateAmount = (value: number): string => {
        if (!value) return 'Please enter withdrawal amount';
        if (value > balance) return 'Amount exceeds available balance';
        if (value < 100000) return 'Minimum withdrawal amount is 100,000 VND';
        return '';
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
        setAmount(value || 0);
        setError(validateAmount(value || 0));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateAmount(amount);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            const user = localStorage.getItem("user");
            if (!user) throw new Error("User not found");

            const userData = JSON.parse(user);
            await instructorService.requestWithdrawal(userData.id, amount);

            setAmount(0);
            onSuccess();
            onClose();
        } catch {
            setError('Failed to submit withdrawal request');
        } finally {
            setLoading(false);
        }
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

                {/* Withdrawal Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Withdrawal Amount
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formatVND(amount)}
                                onChange={handleAmountChange}
                                className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter amount"
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="text-gray-400 text-sm bg-zinc-700/30 p-4 rounded-lg">
                        <p className="font-medium mb-2">Note:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Minimum withdrawal amount: 100,000 VND</li>
                            <li>Processing time: 1-3 business days</li>
                            <li>Withdrawal requests cannot be cancelled once submitted</li>
                        </ul>
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
                            disabled={loading || !!error || amount <= 0}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalModal; 