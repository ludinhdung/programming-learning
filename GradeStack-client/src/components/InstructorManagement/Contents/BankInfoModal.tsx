import { useState, useEffect, ChangeEvent } from "react";
import { fetchBankList } from "../../../services/api";

interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

interface BankInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (bankInfo: BankInfo) => void;
    existingBankInfo: BankInfo | null;
}

const BankInfoModal = ({ isOpen, onClose, onSuccess, existingBankInfo }: BankInfoModalProps) => {
    const [formData, setFormData] = useState<BankInfo>({
        bankName: "",
        accountNumber: "",
        accountName: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<BankInfo>>({});
    const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    useEffect(() => {
        const loadBanks = async () => {
            try {
                setIsLoadingBanks(true);
                const banks = await fetchBankList();
                setBankList(banks);
            } catch (error) {
                console.error('Error loading banks:', error);
            } finally {
                setIsLoadingBanks(false);
            }
        };

        if (isOpen) {
            loadBanks();
        }
    }, [isOpen]);

    useEffect(() => {
        if (existingBankInfo) {
            setFormData(existingBankInfo);
        } else {
            setFormData({
                bankName: "",
                accountNumber: "",
                accountName: ""
            });
        }
        setErrors({});
    }, [existingBankInfo]);

    const validateForm = () => {
        const newErrors: Partial<BankInfo> = {};

        if (!formData.bankName.trim()) {
            newErrors.bankName = "Bank name is required";
        }

        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = "Account number is required";
        } else if (!/^[0-9]+$/.test(formData.accountNumber)) {
            newErrors.accountNumber = "Account number must contain only numbers";
        }

        if (!formData.accountName.trim()) {
            newErrors.accountName = "Account holder name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            await onSuccess(formData);
        } catch (error) {
            console.error("Form submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof BankInfo]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        {existingBankInfo ? "Update Bank Information" : "Add Bank Information"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Bank Name
                        </label>
                        <select
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                            disabled={isLoadingBanks}
                        >
                            <option value="">Select your bank</option>
                            {bankList.map((bank) => (
                                <option key={bank.code} value={bank.name}>
                                    {bank.name}
                                </option>
                            ))}
                        </select>
                        {isLoadingBanks && (
                            <p className="mt-2 text-sm text-gray-400">Loading banks...</p>
                        )}
                        {errors.bankName && (
                            <p className="mt-2 text-sm text-red-500">{errors.bankName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Account Number
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter account number"
                            required
                        />
                        {errors.accountNumber && (
                            <p className="mt-2 text-sm text-red-500">{errors.accountNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Account Holder Name
                        </label>
                        <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleChange}
                            className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter account holder name"
                            required
                        />
                        {errors.accountName && (
                            <p className="mt-2 text-sm text-red-500">{errors.accountName}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="text-gray-400 text-sm bg-zinc-700/30 p-4 rounded-lg">
                        <p className="font-medium mb-2">Note:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Please ensure all bank information is accurate</li>
                            <li>Account number must contain only numbers</li>
                            <li>This information will be used for withdrawals</li>
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
                            disabled={isSubmitting || Object.keys(errors).length > 0}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Processing...' : (existingBankInfo ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BankInfoModal; 