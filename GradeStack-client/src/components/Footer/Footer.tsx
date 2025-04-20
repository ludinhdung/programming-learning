import React from "react";

/**
 * Footer UI giống GRADESTACK - chuẩn hóa theo ảnh đính kèm.
 * @returns JSX.Element
 */
const Footer: React.FC = (): JSX.Element => {
  return (
    <footer className="bg-[#0D1118] pt-20 pb-4 w-full">
      {/* Email Subscribe */}
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h2 className="text-white text-2xl md:text-[28px] font-bold text-center mb-8">
          Want us to email you occasionally with GradeStack news?
        </h2>
        <form className="flex w-full max-w-lg mb-8">
          <input
            className="flex-1 rounded-none bg-[#2e3542] text-[#b8c2d1] px-4 py-2  focus:outline-none placeholder-[#b8c2d1] font-medium"
            placeholder="// TODO: Enter email address"
            type="email"
            name="email"
            aria-label="Email address"
          />
          <button
            type="button"
            className="bg-[#2f8bfd] hover:bg-[#1c6ed2] text-white font-semibold px-8 py-2 rounded-none transition-colors"
            disabled
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Main Footer Flex Layout */}
      <div className="px-40 mx-auto flex flex-col md:flex-row gap-80 pb-8 w-full">
        {/* Logo & Description */}
        <div className="flex-1 flex flex-col gap- min-w-[220px] md:max-w-[270px]">
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-extrabold tracking-widest">
              GRADESTACK
            </span>
          </div>
          <p className="text-[#b8c2d1] text-sm font-medium leading-relaxed">
            Nine out of ten doctors recommend GradeStack over competing brands.
            Come inside, see for yourself, and massively level up your
            development skills in the process.
          </p>
          <div className="flex gap-2 mt-2">
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center rounded bg-[#2e3542] text-[#b8c2d1] hover:bg-[#2f8bfd] transition-colors"
              aria-label="YouTube"
            >
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a2.995 2.995 0 0 0-2.112-2.12C19.157 3.5 12 3.5 12 3.5s-7.157 0-9.386.566A2.995 2.995 0 0 0 .502 6.186C0 8.414 0 12 0 12s0 3.586.502 5.814a2.995 2.995 0 0 0 2.112 2.12C4.843 20.5 12 20.5 12 20.5s7.157 0 9.386-.566a2.995 2.995 0 0 0 2.112-2.12C24 15.586 24 12 24 12s0-3.586-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-8 h-8 flex items-center justify-center rounded bg-[#2e3542] text-[#b8c2d1] hover:bg-[#2f8bfd] transition-colors"
              aria-label="X"
            >
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.53 3H21.5l-7.39 8.42L22.5 21h-7.64l-6.09-7.02L2.47 21H.5l7.93-9.03L1.5 3h7.64l5.81 6.7L17.53 3zm-2.15 15h2.13l-6.09-7.02-1.52 1.74L15.38 18z" />
              </svg>
            </a>
          </div>
        </div>
        {/* Links Section */}
        <div className="flex-[2] flex flex-col md:flex-row w-full justify-between">
          {/* Learn */}
          <div>
            <h3 className="text-white font-bold mb-2 text-base">LEARN</h3>
            <ul className="space-y-1 text-[#b8c2d1] text-sm font-medium">
              <li>Sign Up</li>
              <li>Sign In</li>
              <li>Pricing</li>
              <li>Courses</li>
              <li>Path</li>
              <li>Topics</li>
            </ul>
          </div>
          {/* Discuss */}
          <div>
            <h3 className="text-white font-bold mb-2 text-base">DISCUSS</h3>
            <ul className="space-y-1 text-[#b8c2d1] text-sm font-medium">
              <li>Forum</li>
              <li>Podcast</li>
              <li>Blog</li>
              <li>Support</li>
              <li>New Instructors</li>
            </ul>
          </div>
          {/* Extras */}
          <div>
            <h3 className="text-white font-bold mb-2 text-base">EXTRAS</h3>
            <ul className="space-y-1 text-[#b8c2d1] text-sm font-medium">
              <li>Gift Certificates</li>
              <li>Apparel</li>
              <li>Lifers</li>
              <li>Teams</li>
              <li>FAQ</li>
              <li>Assets</li>
              <li>Get a Job</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Copyright & Hosting */}
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-1 border-t border-[#2e3542] pt-4">
        <span className="text-white text-xs font-medium text-center">
          © GRADESTACK 2025. All rights reserved. Yes, all of them. That means
          you, DungLD & NhanHN.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
