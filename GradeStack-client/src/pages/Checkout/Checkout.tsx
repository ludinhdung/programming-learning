import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Rate, Breadcrumb, Checkbox, ConfigProvider } from 'antd';
import { LeftOutlined, TagOutlined, ClockCircleOutlined, BookOutlined, LockOutlined } from '@ant-design/icons';
import styled from "styled-components";
import Header from '../../components/Header/Header';

// Styled Input similar to CourseList
const StyledInput = styled(Input)`
  .ant-input::placeholder {
    color: #717780 ;
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

const Checkout: FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState<string>('');
  const [useVietQR, setUseVietQR] = useState<boolean>(true);

  // Mock data - will be replaced with API call
  const course = {
    id: courseId,
    title: 'Python for Beginners',
    rating: 3,
    totalHours: 29,
    totalLessons: 132,
    originalPrice: 720000,
    discountedPrice: 499000,
    image: 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/cpp-cho-nguoi-moi-bat-dau_09e94813a177425db74fb7c23e65c859.png'
  };

  return (

    <div className="min-h-screen bg-[#0a1321]">
      <Header />

      <div className="container mx-auto px-12 py-8">
        {/* Breadcrumb */}
        <Button
                  type="none"
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
              <img src={course.image} alt={course.title} className="w-70 h-40 object-cover rounded-none mr-6" />
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
                      <Rate disabled defaultValue={course.rating} />
                    </ConfigProvider>
                    <span className="text-gray-400 ml-2">{course.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-gray-400" />
                    <span className="text-gray-400 ml-2">{course.totalHours} hours</span>
                  </div>
                  <div className="flex items-center">
                    <BookOutlined className="text-gray-400 " />
                    <span className="text-gray-400 ml-2">{course.totalLessons} lessons</span>
                  </div>
                </div>
                <div className="flex items-center mt-4 space-x-4">
                  <p className="text-xl font-semibold text-[#3b82f6]">{course.discountedPrice.toLocaleString()} đ</p>
                  <p className="text-lg line-through text-gray-400">{course.originalPrice.toLocaleString()} đ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Payment Details */}
          <div className="lg:col-span-1 ">
            <div className="bg-[#14202e] rounded-none p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Payment Method
              </h2>

              <div className="payment-option flex items-center mb-4">
                <CustomCheckbox checked={true} onChange={(e) => setUseVietQR(e.target.checked)} className="mr-4" />
                <img src="https://codelearn.io/images/payment/vietqr_3.png" alt="VietQR" className="w-12 h-7 mr-2 rounded-none" />
                <span className="text-[#d8e3ee]">VietQR</span>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <StyledInput
                    placeholder="Enter promo code"
                    variant='borderless'
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    prefix={<TagOutlined className="text-[#62748b] mr-2" />}
                    className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                  />
                  <Button
                    type='none'
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
                  <span>{course.originalPrice.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-[#62748b]">
                  <span>Discount</span>
                  <span>{(course.originalPrice - course.discountedPrice).toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-[#d8e3ee] font-bold">
                  <span>Total Payment</span>
                  <span>{course.discountedPrice.toLocaleString()} đ</span>
                </div>
              </div>

              <Button
                type="none"
                size="large"
                block
                className="bg-[#1b55ac] text-[#fff] text-md font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                <span className="mr-2"><LockOutlined /></span> Pay {course.discountedPrice.toLocaleString()} đ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;