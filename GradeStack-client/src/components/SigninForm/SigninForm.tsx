import React, { useState } from "react";
import "../../styles/FormStyles.css";
import { authService } from "../../services/api";
import { message } from "antd";

type SigninFormProps = {
  onSwitchForm: () => void;
  onForgotPassword: () => void;
  onLoginSuccess?: () => void;
};

const SigninForm: React.FC<SigninFormProps> = ({
  onSwitchForm,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const response = await authService.login(email, password);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role);

      // Lưu trạng thái requirePasswordChange vào localStorage
      if (response.data.requirePasswordChange) {
        localStorage.setItem("requirePasswordChange", "true");
      }

      message.success("Login successfully!", 1.5);

      // Kiểm tra nếu cần đổi mật khẩu khi đăng nhập lần đầu
      if (response.data.requirePasswordChange) {
        setTimeout(() => {
          message.info("You need to change your password.", 2);
          window.location.href = "/instructor-management/profile";
        }, 2000);
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Default redirect based on user role
        setTimeout(() => {
          switch (response.data.user.role) {
            case "INSTRUCTOR":
              window.location.href = "/instructor-management";
              break;
            case "INSTRUCTOR_LEAD":
              window.location.href = "/instructor-management";
              break;
            case "ADMIN":
              window.location.href = "/admin-dashboard";
              break;
            case "LEARNER":
              window.location.href = "/dashboard";
              break;
            case "SUPPORTER":
              window.location.href = "/supporter-dashboard";
              break;
            default:
              window.location.href = "/";
              break;
          }
        }, 1500);
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        message.error(axiosError.response?.data?.message || "Login failed");
      } else {
        message.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex bg-[#0a1321] min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-8 text-center text-4xl font-extrabold tracking-tight text-gray-300">
            Login to <span className="text-blue-600">GradeStack</span>
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-400"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-400"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    onClick={onForgotPassword}
                    className="font-semibold text-blue-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-slate-400 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={onSwitchForm}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign up here!
            </button>
          </p>
        </div>
      </div>
    </>
  );
};
export default SigninForm;
