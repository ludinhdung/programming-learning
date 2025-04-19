import { useEffect, useState } from "react";
import { instructorService } from "../../../services/api";
import { formatVND } from "../../../utils/formatCurrency";
import { TransactionList } from "./Transaction";
const Monetization = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setIsLoading(true);
        const user = localStorage.getItem("user");
        if (!user) {
          throw new Error("User not found");
        }
        const userData = JSON.parse(user);
        const instructorId = userData.id;
        const response = await instructorService.getInstructorWallet(
          instructorId
        );
        setWallet(response.data);
        console.log(response.data);

      } catch (error) {
        console.log("Error fetching wallet", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-2xl font-bold">Financial Dashboard</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
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
                formatVND(wallet?.balance)
              )}
            </h2>
            <p className="text-white/60 text-sm">Total Available</p>
          </div>
        </div>

        {/* Monthly Earnings Card */}
        <div className="bg-zinc-700 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            <span className="text-white/80 text-sm font-medium">
              Monthly Earnings
            </span>
          </div>
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-1">...</h2>
            <p className="text-green-500 text-sm flex items-center gap-1">
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
            <h2 className="text-3xl font-bold mb-1">0</h2>{" "}
            {/* Replace with actual student count */}
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

    </div>
  );
};

export default Monetization;
