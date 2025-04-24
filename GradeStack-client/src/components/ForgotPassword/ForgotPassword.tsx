import React, { useState } from "react";
import { userService } from "../../services/api";
import { message } from "antd";
import { AxiosError } from "axios";

type ForgotPasswordProps = {
  onBackToSignin: () => void;
};

interface ErrorResponse {
  message?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToSignin }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepCompleted, setStepCompleted] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const handleSendVerificationCode = async () => {
    if (!email) {
      message.error("Please enter your email address");
      return false;
    }

    try {
      setIsLoading(true);
      await userService.forgotPassword(email);
      message.success("Verification code sent to your email");
      setStepCompleted((prev) => ({ ...prev, step1: true }));
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        message.error("Email address not found. Please check and try again.");
      } else if (axiosError.response?.data?.message) {
        message.error(axiosError.response.data.message);
      } else {
        message.error("Failed to send verification code. Please try again.");
      }
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      message.error("Please enter the verification code");
      return false;
    }

    try {
      setIsLoading(true);
      await userService.verifyResetCode(email, verificationCode);
      message.success("Verification code is valid");
      setStepCompleted((prev) => ({ ...prev, step2: true }));
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.message) {
        message.error(axiosError.response.data.message);
      } else {
        message.error("Invalid verification code. Please try again.");
      }
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      message.error("Please enter a new password");
      return false;
    }

    if (newPassword.length < 6) {
      message.error("Password must be at least 6 characters");
      return false;
    }

    try {
      setIsLoading(true);
      await userService.resetPassword(email, verificationCode, newPassword);
      message.success("Password reset successfully");
      setStepCompleted((prev) => ({ ...prev, step3: true }));
      setCurrentStep(4);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.message) {
        message.error(axiosError.response.data.message);
      } else {
        message.error("Failed to reset password. Please try again.");
      }
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const goToPrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) return stepCompleted.step1;
    if (currentStep === 2) return stepCompleted.step2;
    if (currentStep === 3) return stepCompleted.step3;
    return false;
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md space-y-4 bg-[#0a1321] p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
        </div>
        <div className="mt-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (stepCompleted.step1) {
                        setStepCompleted((prev) => ({ ...prev, step1: false }));
                      }
                    }}
                    className="appearance-none block w-full px-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isLoading || !email}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading || !email
                      ? "bg-blue-900 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="verification-code"
                  className="block text-sm font-medium text-gray-300"
                >
                  Verification Code
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  We've sent a code to {email}
                </p>
                <div className="mt-1">
                  <input
                    id="verification-code"
                    name="verification-code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value);
                      if (stepCompleted.step2) {
                        setStepCompleted((prev) => ({ ...prev, step2: false }));
                      }
                    }}
                    className="appearance-none block w-full px-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter verification code"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isLoading}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Resend code
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isLoading || !verificationCode}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading || !verificationCode
                      ? "bg-blue-900 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-300"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Password must be at least 6 characters
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isLoading || !newPassword || newPassword.length < 6}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading || !newPassword || newPassword.length < 6
                      ? "bg-blue-900 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">
                Password Reset Successful
              </h3>
              <p className="text-gray-400">
                Your password has been reset successfully. You can now login
                with your new password.
              </p>
              <button
                onClick={onBackToSignin}
                className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>

        {currentStep < 4 && (
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={isLoading}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="button"
              onClick={goToNextStep}
              disabled={isLoading || !canProceedToNextStep()}
              className={`text-sm font-medium ${
                canProceedToNextStep()
                  ? "text-blue-600 hover:text-blue-400"
                  : "text-gray-500 cursor-not-allowed"
              } transition-colors duration-200`}
            >
              Next
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Remember your password?{" "}
            <button
              onClick={onBackToSignin}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
