import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Rate, Checkbox, ConfigProvider, message } from 'antd';
import { TagOutlined, ClockCircleOutlined, BookOutlined, LockOutlined } from '@ant-design/icons';
import styled from "styled-components";
import Header from '../../components/Header/Header';
import { courseService, CourseDetail } from '../../services/course.service';
import { paymentService, CreatePaymentRequest } from '../../services/payment.service';

// Styled Input similar to CourseList
const StyledInput = styled(Input)`
  .ant-input::placeholder {
    color: #717780;
    border-radius: 0; 
    font-weight: 500;
  }
`;

const CustomCheckbox = styled(Checkbox)`
    .ant-checkbox-inner {
      width: 16px;
      height: 16px;
      border: none;
      border-radius: 0;
    }
`;

export const Checkout: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [useVietQR, setUseVietQR] = useState<boolean>(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!courseId) {
          throw new Error('Course ID is required');
        }
        const courseData = await courseService.getCourseById(courseId);
        console.log("Fetched course data:", courseData); // Kiểm tra dữ liệu course
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePayment = async () => {
    if (!course || !courseId || !course.instructor?.userId) {
      message.error('Missing required course information');
      console.error("Missing course details:", { course, courseId, instructor: course?.instructor });
      return;
    }

    try {
      setProcessingPayment(true);
      const paymentData: CreatePaymentRequest = {
        courseId,
        price: Number(course.price),
        instructorId: course.instructor.userId,
        courseName: course.title
      };

      console.log("Payment request payload:", paymentData); 

      const response = await paymentService.createPayment(paymentData);

      console.log("Payment response:", response); 
      
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        message.success('Payment initiated successfully!');
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to process payment');
      console.error("Payment error:", err);
    } finally {
      setProcessingPayment(false);
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />

      <div className="container mx-auto px-12 py-8">
        {/* Back Button */}
        <Button
          type="default"
          className="bg-[#29324a] mb-4 uppercase text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
          onClick={() => navigate("/")}
        >
          <svg width="8" height="22" viewBox="0 0 13 22" fill="none" className="fill-current mr-2.5 shrink-0">
            <rect x="0.428223" y="8.95117" width="4.16918" height="4.16918"></rect>
            <rect x="4.59717" y="4.7832" width="4.16918" height="4.16918"></rect>
            <rect x="8.7666" y="0.613281" width="4.16918" height="4.16918"></rect>
            <rect x="8.7666" y="17.29" width="4.16918" height="4.16918"></rect>
            <rect x="4.59717" y="13.1211" width="4.16918" height="4.16918"></rect>
          </svg>
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - Course Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#14202e] rounded-none shadow-md p-6 flex items-start">
              <img src={course.thumbnail} alt={course.title} className="w-70 h-40 object-cover rounded-none mr-6" />
              <div className="course-info">
                <h1 className="text-3xl font-medium text-white mb-2">{course.title}</h1>
                <div className="flex items-center text-yellow-500 mb-2 space-x-8">
                  <div className="flex items-center">
                    <ConfigProvider
                      theme={{
                        components: {
                          Rate: {
                            starColor: "#E4D00A",
                            starBg: "#c7ced6",
                          },
                        },
                      }}
                    >
                      <Rate disabled defaultValue={course.averageRating} />
                    </ConfigProvider>
                    <span className="text-gray-400 ml-2">{course.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-gray-400" />
                    <span className="text-gray-400 ml-2">{Math.floor(course.duration / 60)} hours</span>
                  </div>
                  <div className="flex items-center">
                    <BookOutlined className="text-gray-400" />
                    <span className="text-gray-400 ml-2">{course.totalLessons} lessons</span>
                  </div>
                </div>
                <div className="flex items-center mt-4 space-x-4">
                  <p className="text-xl font-semibold text-[#3b82f6]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Payment Details */}
          <div className="lg:col-span-1">
            <div className="bg-[#14202e] rounded-none p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Payment Method
              </h2>

              <div className="payment-option flex items-center mb-4">
                <CustomCheckbox checked={useVietQR} onChange={(e) => setUseVietQR(e.target.checked)} className="mr-4" />
                <img src="https://codelearn.io/images/payment/vietqr_3.png" alt="VietQR" className="w-12 h-7 mr-2 rounded-none" />
                <span className="text-[#d8e3ee]">VietQR</span>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <StyledInput
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    prefix={<TagOutlined className="text-[#62748b] mr-2" />}
                    className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                  />
                  <Button
                    type="default"
                    className="bg-[#1b55ac] p-4 text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-4 pt-4 border-t border-[#29334a]">
                <div className="flex justify-between text-[#d8e3ee]">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}</span>
                </div>
                <div className="flex justify-between text-[#d8e3ee] font-bold">
                  <span>Total Payment</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}</span>
                </div>
              </div>

              <Button
                type="default"
                size="large"
                block
                loading={processingPayment}
                onClick={handlePayment}
                className="bg-[#1b55ac] text-[#fff] text-md font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                <span className="mr-2"><LockOutlined /></span> Pay {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(course.price))}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;