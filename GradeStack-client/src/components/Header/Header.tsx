import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, PopoverGroup, Listbox, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Modal } from "antd";

// Components
import SigninForm from "../SigninForm/SigninForm";
import SignupForm from "../SignupForm/SignupForm";
import ForgotPassword from "../ForgotPassword/ForgotPassword";

// React-bits Components
import TrueFocus from "./TrueFocus";

type FormType = "signin" | "signup" | "forgot";

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for user data in localStorage on component mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentForm("signin"); // Reset về signin khi đóng modal
  };

  const handleLogout = () => {
    // Clear user data and token from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // Redirect to home page
    window.location.href = '/';
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

  const profileMenu = [
    { name: 'My Home', href: '/#' },
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', onClick: handleLogout }
  ];

  // Replace the welcome message and logout button with this profile menu
  const renderProfileMenu = () => (
    <Menu>
      <MenuButton className="flex items-center gap-2 rounded-md py-1.5 px-3 text-sm/6 font-semibold text-white focus:outline-none data-[hover]:bg-zinc-800 data-[open]:bg-zinc-800">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg">
          {user?.firstName?.[0]?.toUpperCase()}
        </div>
        <ChevronDownIcon className="size-4 fill-white/60" />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="w-52 origin-top-right rounded-xl border border-white/5 bg-zinc-900 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-[60]"
      >
        {profileMenu.map((item) => (
          <MenuItem key={item.name}>
            {item.onClick ? (
              <button 
                onClick={item.onClick}
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
              >
                {item.name}
              </button>
            ) : (
              <a 
                href={item.href}
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
              >
                {item.name}
              </a>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );

  // Update the user profile section in the desktop navigation
  const userProfileSection = user ? (
    <div className="flex items-center gap-4">
      {renderProfileMenu()}
    </div>
  ) : (
    <>
      <button
        onClick={showModal}
        className="text-sm/6 font-semibold text-gray-300"
      >
        Sign in
      </button>
      <button
        onClick={showModal}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Get Started For Free
      </button>
    </>
  );

  return (
    <>
      <header className="bg-zinc-950 shadow-xl fixed top-0 left-0 right-0 w-full z-50">
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

          {/* Right Navigation */}
          <div className="flex-1 hidden md:flex justify-end items-center gap-4">
            <div className="flex items-center gap-4">
              {userProfileSection}
            </div>
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
              <div className="-my-6 divide-y divide-gray-500/25">
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
                  {user ? (
                    <>
                      <span className="block text-center text-gray-300">
                        Welcome, {user.firstName} {user.lastName}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-md bg-red-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-red-500"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={showModal}
                        className="block w-full rounded-md bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        Get Started For Free
                      </button>
                      <button
                        onClick={showModal}
                        className="block text-center rounded-lg px-3 py-2.5 text-base font-semibold text-gray-300 hover:bg-gray-800"
                      >
                        Sign in
                      </button>
                    </>
                  )}
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
