import { useEffect, useState } from 'react';
import { instructorService } from '../../../services/instructor.service';
import { formatCurrency } from '../../../utils/formatCurrency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
}

interface EnrollmentByMonth {
  enrolledAt: string;
  _count: number;
}

interface Statistics {
  totalCourses: number;
  totalEnrollments: number;
  totalEarnings: number;
  totalRatings: number;
  averageRating: number;
  recentTransactions: Transaction[];
  enrollmentsByMonth: EnrollmentByMonth[];
  dateRange: '7d' | '30d' | 'all';
}

const Overview = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      const userData = localStorage.getItem('user');
      const instructorId = userData ? JSON.parse(userData).id : null;

      if (!instructorId) {
        setError('Instructor ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await instructorService.getAllCoursesStatistics(instructorId, dateRange);
        setStatistics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [dateRange]);

  // Prepare data for charts
  const enrollmentData = {
    labels: statistics?.enrollmentsByMonth.map(item =>
      new Date(item.enrolledAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Enrollments',
        data: statistics?.enrollmentsByMonth.map(item => item._count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const earningsData = {
    labels: statistics?.recentTransactions.map(item =>
      new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Earnings',
        data: statistics?.recentTransactions.map(item => item.amount) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const ratingData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10], // Replace with actual rating distribution data
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-4 py-2 rounded-lg ${dateRange === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-700 text-gray-300'
              }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-4 py-2 rounded-lg ${dateRange === '30d'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-700 text-gray-300'
              }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-4 py-2 rounded-lg ${dateRange === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-700 text-gray-300'
              }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Courses */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Total Courses</h3>
          <p className="text-white text-3xl font-bold">
            {statistics?.totalCourses || 0}
          </p>
        </div>

        {/* Total Enrollments */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Total Enrollments</h3>
          <p className="text-white text-3xl font-bold">
            {statistics?.totalEnrollments || 0}
          </p>
        </div>

        {/* Total Earnings */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Total Earnings</h3>
          <p className="text-white text-3xl font-bold">
            {formatCurrency(statistics?.totalEarnings || 0)}
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Average Rating</h3>
          <p className="text-white text-3xl font-bold">
            {statistics?.averageRating?.toFixed(1) || '0.0'}
          </p>
        </div>

        {/* Total Ratings */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Total Ratings</h3>
          <p className="text-white text-3xl font-bold">
            {statistics?.totalRatings || 0}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollments Over Time */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-4">Enrollments Over Time</h3>
          <div className="h-80">
            <Line data={enrollmentData} options={chartOptions} />
          </div>
        </div>

        {/* Earnings Over Time */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-4">Earnings Over Time</h3>
          <div className="h-80">
            <Bar data={earningsData} options={chartOptions} />
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-4">Rating Distribution</h3>
          <div className="h-80">
            <Doughnut data={ratingData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-zinc-700 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {statistics?.recentTransactions?.slice(0, 5).map((transaction: Transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-2 hover:bg-zinc-600 rounded">
                <span className="text-white">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </span>
                <span className="text-green-500 font-medium">
                  +{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
