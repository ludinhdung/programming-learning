import React, { useState } from "react";
import { Dialog, DialogPanel, PopoverGroup } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "antd";

// Components
import SigninForm from "../SigninForm/SigninForm";
import SignupForm from "../SignupForm/SignupForm";
import ForgotPassword from "../ForgotPassword/ForgotPassword";

// React-bits Components
import TrueFocus from "./TrueFocus";

type FormType = "signin" | "signup" | "forgot";

const Header: React.FC = () => {
  const navItems = [
    { name: "Topics", href: "#" },
    { name: "Path", href: "#" },
    { name: "Features", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Teams", href: "#" },
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormType>("signin");

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentForm("signin"); // Reset về signin khi đóng modal
  };

  const renderForm = () => {
    switch (currentForm) {
      case "signin":
        return (
          <SigninForm
            onSwitchForm={() => setCurrentForm("signup")}
            onForgotPassword={() => setCurrentForm("forgot")}
          />
        );
      case "signup":
        return <SignupForm onSwitchForm={() => setCurrentForm("signin")} />;
      case "forgot":
        return (
          <ForgotPassword onBackToSignin={() => setCurrentForm("signin")} />
        );
    }
  };
  return (
    <>
      <header className="bg-zinc-950 fixed top-0 left-0 right-0 w-full z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-4">
          {/* Left Navigation - Hidden on mobile */}
          <div className="flex-1 hidden md:flex justify-start">
            <PopoverGroup className="flex lg:gap-x-4 space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm/6 font-semibold text-gray-300"
                >
                  {item.name}
                </a>
              ))}
            </PopoverGroup>
          </div>

          {/* Center Logo */}
          <div className="flex justify-center items-center flex-1">
            <a href="/">
              <TrueFocus
                sentence="Grade Stack"
                manualMode={false}
                blurAmount={3}
                borderColor="blue"
                animationDuration={2}
                pauseBetweenAnimations={1}
              />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Right Actions - Hidden on mobile */}
          <div className="hidden md:flex md:flex-1 md:justify-end items-center space-x-4">
            <button className="flex items-center justify-center rounded-md bg-gray-700 p-2 text-white hover:bg-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                <path d="M21 21l-6 -6" />
              </svg>
            </button>
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              Get Started For Free
            </a>
            <button
              onClick={showModal}
              className="text-sm/6 font-semibold text-gray-300"
            >
              Sign in <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dialog */}
        <Dialog
          as="div"
          className="md:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-10" />
          <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-zinc-950 px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 bg-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon
                  className="h-6 w-6 text-gray-300"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-300 hover:bg-gray-800"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6 space-y-4">
                  <button className="flex w-full items-center justify-center rounded-md bg-gray-700 p-2 text-white hover:bg-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                      <path d="M21 21l-6 -6" />
                    </svg>
                  </button>
                  <a
                    href="#"
                    className="block w-full rounded-md bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Get Started For Free
                  </a>
                  <a
                    href="#"
                    className="block text-center rounded-lg px-3 py-2.5 text-base font-semibold text-gray-300 hover:bg-gray-800"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
      <div className="h-16" />

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        closable={false}
        width={currentForm === "forgot" ? 450 : 500}
        centered
        style={{
          padding: 0,
          backgroundColor: "transparent",
        }}
        wrapClassName="!p-0"
        className="!p-0 rounded-modal"
        modalRender={(node) => (
          <div className="rounded-2xl overflow-hidden">{node}</div>
        )}
      >
        {renderForm()}
      </Modal>
    </>
  );
};
export default Header;
