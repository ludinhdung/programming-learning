import React from "react";

const TopBar: React.FC = () => {
  return (
    <div className="flex justify-between items-center h-[50px] px-4">
      <div className="flex items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="icon text-gray-300 icon-tabler icons-tabler-outline icon-tabler-clipboard-text"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
          <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
        <span className="text-white font-semibold">Lesson Exam</span>
      </div>
      {/*Course title */}
        <div className=" flex justify-center items-center gap-1">
           <div className="flex justify-center items-center rounded-full bg-gray-700 p-1">
              <span className="text-gray-200 font-medium">04</span>
           </div>
           <span className="text-white font-medium">This is title of lesssion.</span>
      </div>
      <div className="flex items-center">
        <button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500">
          Submit Answer
        </button>
      </div>
    </div>
  );
};
export default TopBar;
