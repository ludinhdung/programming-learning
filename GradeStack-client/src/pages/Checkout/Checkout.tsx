import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, Input, Button, Rate, Breadcrumb } from 'antd';
import { HomeOutlined, TagOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';

const Checkout: FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');

  // Mock data - sẽ được thay thế bằng API call
  const course = {
    id: courseId,
    title: 'Hệ thống khóa học SQL (Cơ bản & Nâng cao)',
    rating: 5.0,
    totalHours: 44,
    totalLessons: 231,
    originalPrice: 1620000,
    discountedPrice: 999000,
    image: '/course-images/sql-course.jpg'
  };

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-8"
          items={[
            {
              title: <HomeOutlined className="text-gray-400" />,
              href: '/'
            },
            {
              title: <span className="text-gray-400">SQL Course</span>,
              href: `/courses/${courseId}`
            },
            {
              title: <span className="text-gray-400">Checkout</span>
            }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - Course Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-white mb-4">
                {course.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <Rate disabled defaultValue={course.rating} className="text-yellow-500" />
                <span className="text-white">{course.rating}</span>
              </div>

              <div className="flex items-center text-gray-400 text-sm space-x-4">
                <span>{course.totalHours} hours</span>
                <span>•</span>
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>
          </div>

          {/* Right Content - Payment Details */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Payment Method
              </h2>

              <Select
                placeholder="Select payment method"
                className="w-full"
                onChange={(value) => setPaymentMethod(value)}
                options={[
                  { value: 'momo', label: 'MoMo' },
                  { value: 'vnpay', label: 'VNPay' },
                  { value: 'bank', label: 'Bank Transfer' },
                  { value: 'credit', label: 'Credit/Debit Card' }
                ]}
              />

              {/* Promo Code */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    prefix={<TagOutlined className="text-gray-400" />}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button 
                    type="primary"
                    className="bg-blue-600 hover:bg-blue-500 border-none"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${(course.discountedPrice/23000).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Discount</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-500">
                    ${(course.discountedPrice/23000).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                type="primary"
                size="large"
                block
                className="bg-blue-600 hover:bg-blue-500 border-none h-12 text-lg"
                disabled={!paymentMethod}
              >
                Complete Purchase
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 