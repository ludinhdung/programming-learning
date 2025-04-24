import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import TrueFocus from "../Header/TrueFocus";

interface HeaderDashboardProps {
  title?: string;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = () => {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Clear user data and token from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("requirePasswordChange");

    // Redirect to home page
    window.location.href = "/";
  };


  return (
    <>
      <header className="bg-zinc-900 shadow-lg border-b border-zinc-800 fixed top-0 left-0 right-0 w-full min-h-20 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-4">
          {/* Left Side - Dashboard Title */}
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <TrueFocus
                sentence="Grade Stack"
                manualMode={false}
                blurAmount={3}
                borderColor="blue"
                animationDuration={2}
                pauseBetweenAnimations={1}
              />
            </span>
          </div>

          {/* Right Side - User Profile Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-2 rounded-md py-1.5 px-3 text-sm/6 font-semibold text-white focus:outline-none hover:bg-zinc-800">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-white">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                  <ChevronDownIcon className="size-4 fill-white/60" />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-white/5 bg-zinc-900 p-1 text-sm/6 text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[60]"
                >
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-2 rounded-lg py-2 px-3 text-white hover:bg-zinc-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-red-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Logout
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderDashboard;
