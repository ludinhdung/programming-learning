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

  // Mock data - will be replaced with API call
  const course = {
    id: courseId,
    title: 'Trọn bộ kiến thức Scratch cho học sinh',
    rating: 5.0,
    totalHours: 52,
    totalLessons: 179,
    originalPrice: 569000,
    discountedPrice: 499000,
    image: '/course-images/scratch-course.jpg'
  };

  return (
    <div className="min-h-screen bg-[#11141b]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-8"
          items={[
            {
              title: <HomeOutlined className="text-[#62748b]" />,
              href: '/'
            },
            {
              title: <span className="text-[#62748b]">Scratch Course</span>,
              href: `/courses/${courseId}`
            },
            {
              title: <span className="text-[#62748b]">Thanh toán</span>
            }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - Course Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#1c2432] rounded-none p-6">
              <h1 className="text-2xl font-bold text-[#d8e3ee] mb-4">
                {course.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <Rate disabled defaultValue={course.rating} className="text-[#f5a623]" />
                <span className="text-[#d8e3ee]">{course.rating}</span>
              </div>

              <div className="flex items-center text-[#62748b] text-sm space-x-4">
                <span>{course.totalHours} giờ học</span>
                <span>•</span>
                <span>{course.totalLessons} bài học</span>
              </div>
            </div>
          </div>

          {/* Right Content - Payment Details */}
          <div className="lg:col-span-1">
            <div className="bg-[#1c2432] rounded-none p-6 space-y-6">
              <h2 className="text-xl font-bold text-[#d8e3ee] mb-4">
                Phương thức thanh toán
              </h2>

              <Select
                placeholder="Chọn phương thức thanh toán"
                className="w-full"
                onChange={(value) => setPaymentMethod(value)}
                options={[
                  { value: 'momo', label: 'MoMo' },
                  { value: 'vnpay', label: 'VNPay' },
                  { value: 'bank', label: 'Chuyển khoản ngân hàng' },
                  { value: 'credit', label: 'Thẻ tín dụng/ghi nợ' }
                ]}
              />

              {/* Promo Code */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    prefix={<TagOutlined className="text-[#62748b]" />}
                    className="bg-[#29334a] border-[#3a4867] text-[#d8e3ee]"
                  />
                  <Button 
                    type="primary"
                    className="bg-[#1b55ac] hover:bg-[#21c8f6] border-none"
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-4 pt-4 border-t border-[#29334a]">
                <div className="flex justify-between text-[#d8e3ee]">
                  <span>Tổng tiền</span>
                  <span>{course.originalPrice.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-[#62748b]">
                  <span>Khuyến mãi</span>
                  <span>{(course.originalPrice - course.discountedPrice).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-[#d8e3ee] font-bold">
                  <span>Tổng thanh toán</span>
                  <span>{course.discountedPrice.toLocaleString()}đ</span>
                </div>
              </div>

              <Button 
                type="primary" 
                size="large"
                block
                className="bg-[#1b55ac] hover:bg-[#21c8f6] border-none"
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;