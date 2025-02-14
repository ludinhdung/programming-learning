import React, { useState } from "react";
import Stepper, { Step } from "./Stepper";

type ForgotPasswordProps = {
  onBackToSignin: () => void;
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToSignin }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="flex bg-black min-h-full flex-1 flex-col justify-center pb-8 lg:px-8">

      <div className="mt-16 sm:mx-auto sm:w-full sm:max-w-sm">
        <Stepper
          initialStep={1}
          onStepChange={(step) => {
            console.log(step);
          }}
          onFinalStepCompleted={() => {
            console.log("Password reset completed!");
            onBackToSignin();
          }}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          <Step>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              Enter your email
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="block w-full rounded-md bg-gray-200 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-600"
            />
          </Step>

          <Step>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              Verification Code
            </h2>
            <p className="text-gray-400 mb-4">
              We've sent a code to your email
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className="block w-full rounded-md bg-gray-200 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-600"
            />
          </Step>

          <Step>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              New Password
            </h2>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="block w-full rounded-md bg-gray-200 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-600"
            />
          </Step>

          <Step>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              Success!
            </h2>
            <p className="text-gray-400 mb-4">
              Your password has been reset successfully.
            </p>
            <button
              onClick={onBackToSignin}
              className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Back to Sign In
            </button>
          </Step>
        </Stepper>

        <p className="mt-12 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <button
            onClick={onBackToSignin}
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
