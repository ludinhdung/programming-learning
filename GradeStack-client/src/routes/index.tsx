import { createBrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import Overview from '../pages/AdminDashboard/components/Overview';
import Transactions from '../pages/AdminDashboard/components/Transactions';
import SupporterManagement from '../pages/AdminDashboard/components/SupporterManagement';
import WithdrawalRequests from '../pages/AdminDashboard/components/WithdrawalRequests';

export const router = createBrowserRouter([
    {
        path: '/admin',
        element: <AdminDashboard />,
        children: [
            {
                index: true,
                element: <Overview />,
            },
            {
                path: 'transactions',
                element: <Transactions />,
            },
            {
                path: 'supporters',
                element: <SupporterManagement />,
            },
            {
                path: 'withdrawals',
                element: <WithdrawalRequests />,
            },
        ],
    },
]); 