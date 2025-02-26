type Course = {
  id: string;
  title: string;
  topic: string;
  description: string;
  author: string;
  authorImage: string;
  chapters: Chapter[];
  thumbnailUrl: string;
};

type Chapter = {
  chapterNumber: number;
  chapterTitle: string;
  content: (Episol | Exam)[];
};

type Episol = {
  type: "video";
  episodeNumber: number;
  title: string;
  runTime: string;
  published: string;
  description: string;
};

type Exam = {
  type: "exam";
  examTitle: string;
  totalQuestions: number;
  passingScore: number;
};
const CourseDescription: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div>
      <div className="flex flex-col items-center space-y-6 bg-[#0e1721] rounded-md border border-blue-400/15 py-6">
        <p className="text-gray-300 text-center text-3xl font-extrabold pt-2">
          {course.chapters[0].chapterTitle}
        </p>
        <div>
          <dl className="flex mx-auto space-x-6 divide-x divide-gray-400/80">
            <div>
              <dt className="text-xs text-gray-300/80">Episode</dt>
              <dd className="text-base font-semibold text-gray-300">
                {course.chapters[0].content[0].episodeNumber}
              </dd>
            </div>
            <div className="pl-6">
              <dt className="text-xs text-gray-300/80">Published</dt>
              <dd className="text-base font-semibold text-gray-300">
                {course.chapters[0].content[0].published}
              </dd>
            </div>
            <div className="pl-6">
              <dt className="text-xs text-gray-300/80">Run Time</dt>
              <dd className="text-base font-semibold text-gray-300">
                {course.chapters[0].content[0].runTime}
              </dd>
            </div>
            <div className="pl-6">
              <dt className="text-xs text-gray-300/80">Topic</dt>
              <dd className="text-base font-semibold text-gray-300">
                {course.topic}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex justify-between items-center space-x-6">
          <div className="flex">
            <button className="flex items-center opacity-90 bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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
                className="mr-1"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
              </svg>
              Bookmark
            </button>
          </div>

          <div className="flex items-center justify-center bg-gray-400 w-1.5 h-1.5 "></div>

          <div className="flex space-x-4">
            <button className="flex items-center opacity-90 bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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
                className="mr-1"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l5 5l10 -10" />
              </svg>
              Mark as Complete
            </button>
            <button className="flex items-center opacity-90 bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1 icon icon-tabler icons-tabler-filled icon-tabler-home"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
              </svg>
              Add to Watchlist
            </button>
          </div>

          <div className="flex items-center justify-center bg-gray-400 w-1.5 h-1.5 "></div>

          <div className="flex">
            <button className="flex items-center opacity-90 bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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
                className="mr-1"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 14v.01" />
                <path d="M12 14v.01" />
                <path d="M15 14v.01" />
              </svg>
              Source Code
            </button>
          </div>
        </div>
      </div>
      <div className="px-20 py-6">
        <div className="bg-gray-800/80 py-4 px-8 font-bold text-xl">
          <span className="text-blue-600 mr-2">//</span>
          <span className="text-blue-400/90">About This Episode</span>
          <p className="text-gray-300 font-normal text-lg pt-4">
            "{course.chapters[0].content[0].description}"
          </p>
        </div>

        <div className="flex items-stretch pt-6">
          <div className="flex-shrink-0 w-40 h-full">
            <img
              src={course.authorImage}
              className="w-full h-full object-cover"
              alt="Author"
            />
          </div>
          <div className="flex flex-col bg-gray-800/80 px-4 py-6 ml-4 w-full">
            <div className="flex justify-between items-center ">
              <div>
                <p className="text-2xl text-gray-200 font-bold">
                  {course.author}
                </p>
                <span className="text-blue-400/90 font-medium">
                  Your Instructor
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <a className="flex items-center opacity-90 p-2 bg-gray-700 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  <svg
                    viewBox="0 0 30 29"
                    className="transition-all scale-125"
                    width="24"
                  >
                    <path
                      className="fill-current"
                      fill-rule="nonzero"
                      d="M27.959 7.434a14.866 14.866 0 0 0-5.453-5.414C20.21.69 17.703.025 14.984.025c-2.718 0-5.226.665-7.521 1.995A14.864 14.864 0 0 0 2.01 7.434C.67 9.714 0 12.202 0 14.901c0 3.242.953 6.156 2.858 8.746 1.906 2.589 4.367 4.38 7.385 5.375.351.064.611.019.78-.136a.755.755 0 0 0 .254-.58l-.01-1.047c-.007-.658-.01-1.233-.01-1.723l-.448.077a5.765 5.765 0 0 1-1.083.068 8.308 8.308 0 0 1-1.356-.136 3.04 3.04 0 0 1-1.308-.58c-.403-.304-.689-.701-.858-1.192l-.195-.445a4.834 4.834 0 0 0-.614-.988c-.28-.362-.563-.607-.85-.736l-.136-.097a1.428 1.428 0 0 1-.253-.233 1.062 1.062 0 0 1-.176-.271c-.039-.09-.007-.165.098-.223.104-.059.292-.087.566-.087l.39.058c.26.052.582.206.965.465.384.258.7.594.947 1.007.299.53.66.933 1.082 1.21.423.278.85.417 1.278.417.43 0 .8-.032 1.112-.097a3.9 3.9 0 0 0 .878-.29c.117-.866.436-1.53.956-1.996a13.447 13.447 0 0 1-2-.348 7.995 7.995 0 0 1-1.833-.756 5.244 5.244 0 0 1-1.571-1.298c-.416-.516-.758-1.195-1.024-2.034-.267-.84-.4-1.808-.4-2.905 0-1.563.514-2.893 1.541-3.99-.481-1.176-.436-2.493.137-3.952.377-.116.936-.03 1.678.261.741.291 1.284.54 1.629.746.345.207.621.381.83.523a13.948 13.948 0 0 1 3.745-.503c1.288 0 2.537.168 3.747.503l.741-.464c.507-.31 1.106-.595 1.795-.853.69-.258 1.216-.33 1.58-.213.586 1.46.638 2.777.156 3.951 1.028 1.098 1.542 2.428 1.542 3.99 0 1.099-.134 2.07-.4 2.916-.267.846-.611 1.524-1.034 2.034-.423.51-.95.94-1.58 1.288a8.01 8.01 0 0 1-1.834.756c-.592.155-1.259.271-2 .349.676.58 1.014 1.498 1.014 2.75v4.087c0 .232.081.426.244.58.163.155.42.2.77.136 3.019-.994 5.48-2.786 7.386-5.375 1.905-2.59 2.858-5.504 2.858-8.746 0-2.698-.671-5.187-2.01-7.466z"
                    ></path>
                  </svg>
                </a>
                <button className="flex items-center opacity-90 bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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
                    className="mr-1"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 8h8" />
                    <path d="M20 11.5v6.5a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h6.5" />
                    <path d="M8 4v4" />
                    <path d="M16 8l5 -5" />
                    <path d="M21 7.5v-4.5h-4.5" />
                  </svg>
                  Visit Website
                </button>
              </div>
            </div>
            <p className="mt-8 text-gray-300 font-semibold">
              Hi, I'm Jeffrey. I'm the creator of Laracasts and spend most of my
              days building the site and thinking of new ways to teach confusing
              concepts. I live in Orlando, Florida with my wife and two kids.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseDescription;
