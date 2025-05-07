import { useEffect, useState } from "react";
import { instructorService } from "../../../services/api";
import { formatVND } from "../../../utils/formatCurrency";
import { TransactionList } from "./Transaction";
import WithdrawalModal from "./Transaction/WithdrawalModal";
import { message } from "antd";
import BankInfoModal from "./BankInfoModal";
import { bankService } from "../../../services/instructor.service";

interface Wallet {
  balance: number;
  id: string;
  instructorId: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Monetization = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isBankInfoModalOpen, setIsBankInfoModalOpen] = useState(false);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const user = localStorage.getItem("user");
      if (!user) {
        throw new Error("User not found");
      }
      const userData = JSON.parse(user);
      const instructorId = userData.id;
      const response = await instructorService.getInstructorWallet(instructorId);
      setWallet(response.data);
    } catch (error) {
      console.error("Error fetching wallet", error);
      message.error("Failed to fetch wallet information");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankInfo = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        throw new Error("User not found");
      }
      const userData = JSON.parse(user);
      const instructorId = userData.id;
      const response = await bankService.getBankInfo(instructorId);
      setBankInfo(response.data);
    } catch (error) {
      console.error("Error fetching bank info", error);
    }
  };

  const handleWithdrawal = async (amount: number, accountNumber: string, accountHolder: string, bank: string) => {
    try {
      setIsWithdrawing(true);
      const user = localStorage.getItem("user");
      if (!user) {
        throw new Error("User not found");
      }
      const userData = JSON.parse(user);
      const instructorId = userData.id;

      await bankService.requestWithdrawal(instructorId, amount, accountNumber, accountHolder, bank);
      message.success("Withdrawal request submitted successfully");
      setIsWithdrawalModalOpen(false);
      fetchWallet(); // Refresh wallet data
    } catch (error: unknown) {
      console.error("Error processing withdrawal", error);
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCreateBankInfo = async (bankInfo: BankInfo) => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        throw new Error("User not found");
      }
      const userData = JSON.parse(user);
      const instructorId = userData.id;

      await bankService.createBankInfo(instructorId, bankInfo);
      message.success("Bank information added successfully");
      setIsBankInfoModalOpen(false);
      fetchBankInfo(); 
    } catch (error: unknown) {
      console.error("Error creating bank info", error);
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.message || "Failed to add bank information");
    }
  };

  const handleUpdateBankInfo = async (bankInfo: BankInfo) => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        throw new Error("User not found");
      }
      const userData = JSON.parse(user);
      const instructorId = userData.id;

      await bankService.updateBankInfo(instructorId, bankInfo);
      message.success("Bank information updated successfully");
      setIsBankInfoModalOpen(false);
      fetchBankInfo(); 
    } catch (error: unknown) {
      console.error("Error updating bank info", error);
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.message || "Failed to update bank information");
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchBankInfo();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-2xl font-bold">Financial Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsBankInfoModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {bankInfo ? "Update Bank Info" : "Add Bank Info"}
          </button>
          <button
            onClick={() => setIsWithdrawalModalOpen(true)}
            disabled={isLoading || !wallet?.balance || wallet?.balance <= 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M15 16H9M15 12H9M15 8H9" />
              </svg>
            </div>
            <span className="text-white/80 text-sm font-medium">
              Available Balance
            </span>
          </div>
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-1">
              {isLoading ? (
                <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
              ) : (
                formatVND(wallet?.balance || 0)
              )}
            </h2>
            <p className="text-white/60 text-sm">Total Available</p>
          </div>
        </div>

        {/* Bank Info Card */}
        <div className="bg-zinc-700 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white/80 text-sm font-medium">
              Bank Information
            </span>
          </div>
          <div className="text-white">
            {bankInfo ? (
              <>
                <h2 className="text-xl font-bold mb-2">{bankInfo.bankName}</h2>
                <p className="text-white/80 mb-1">Account: {bankInfo.accountNumber}</p>
                <p className="text-white/80">Name: {bankInfo.accountName}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">No Bank Information</h2>
                <p className="text-white/60 text-sm">Add your bank details to receive payments</p>
              </>
            )}
          </div>
        </div>

        {/* Total Students Card */}
        <div className="bg-zinc-700 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <span className="text-white/80 text-sm font-medium">
              Total Students
            </span>
          </div>
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-1">0</h2>
            <p className="text-purple-500 text-sm flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 15l7-7 7 7" />
              </svg>
              0% from last month
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <TransactionList />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        balance={wallet?.balance || 0}
        onSuccess={handleWithdrawal}
        isLoading={isWithdrawing}
        bankInfo={bankInfo}
      />

      {/* Bank Info Modal */}
      <BankInfoModal
        isOpen={isBankInfoModalOpen}
        onClose={() => setIsBankInfoModalOpen(false)}
        onSuccess={bankInfo ? handleUpdateBankInfo : handleCreateBankInfo}
        existingBankInfo={bankInfo}
      />
    </div>
  );
};

export default Monetization;
