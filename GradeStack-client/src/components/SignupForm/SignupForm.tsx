import React, { useState } from "react";
import "../../styles/FormStyles.css";
import { Form } from "antd";
import { authService } from "../../services/api";
import { message } from "antd";

type SignupFormProps = {
  onSwitchForm: () => void;
};

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchForm }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await authService.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (response.success) {
        // Optionally store token and user data if you want auto-login after registration
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        message.success("Registration successful!");
        setTimeout(() => {
          window.location.href = "/"; // Redirect to home if auto-login
        }, 2000);
        // OR
        // message.success('Registration successful! Please log in.');
        // onSwitchForm(); // Switch to login form if not auto-login
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex bg-[#0a1321] min-h-full flex-1 flex-col justify-center px-8 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-300">
            Welcome to <span className="text-blue-600">GradeStack</span>
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="firstName"
              label={<span className="text-gray-400">First Name</span>}
              rules={[
                { required: true, message: "Please input your first name!" },
              ]}
            >
              <input
                type="text"
                className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={<span className="text-gray-400">Last Name</span>}
              rules={[
                { required: true, message: "Please input your last name!" },
              ]}
            >
              <input
                type="text"
                className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </Form.Item>
            {/* 
            <Form.Item
              name="username"
              label={<span className="text-gray-400">Username</span>}
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <input
                type="text"
                className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </Form.Item> */}
            <Form.Item
              name="email"
              label={<span className="text-gray-400">Email address</span>}
              rules={[
                { required: true, message: "Please input your email!" },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn)$/,
                  message: "Please enter a valid email!",
                },
              ]}
            >
              <input
                type="email"
                className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-gray-400">Password</span>}
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <input
                type="password"
                className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-gray-400">Confirm Password</span>}
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <input
                type="password"
                className="block w-full rounded-md bg-slate-400 px-3 py-1.5 font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </Form.Item>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </Form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onSwitchForm}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in here!
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupForm;
