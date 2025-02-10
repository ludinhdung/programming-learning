// src/pages/Home.tsx
import React from "react";
import Header from "../../components/Header/Header";
//React-bits components
import BlurText from "./BlurText";
import Squares from "./Squares";
import RotatingText from "./RotatingText";

const handleAnimationComplete = () => {
  console.log("Animation completed!");
};

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <div className="relative w-full min-w-full h-[650px]">
        <Squares
          speed={0.4}
          squareSize={40}
          direction="diagonal"
          borderColor="#414141"
          hoverFillColor="#FF0099"
        />

        <div className="absolute mt-20 md:-ml-32 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
          <div className="flex w-fit items-center space-x-1">
            <p className="text-3xl font-extrabold justify-start">Creative</p>
            <div>
              <RotatingText
                texts={["Thinking.", "Coding.", "Components."]}
                mainClassName="sm:px-2 md:px-3 bg-blue-600 text-black font-extrabold overflow-hidden sm:py-1 md:py-0.5 justify-center rounded-lg"
                staggerFrom={"last"}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-0.5"
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                rotationInterval={2000}
              />
            </div>
          </div>
          <BlurText
            text="It's Dangerous to Code Alone."
            delay={150}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-7xl font-extrabold"
          />
          <BlurText
            text="Follow Us. 👌"
            delay={150}
            animateBy="words"
            direction="bottom"
            onAnimationComplete={handleAnimationComplete}
            className="text-7xl font-extrabold mb-4"
          />

          <p className="text-base font-semibold mb-4">
            With GradeStack, you're never on your own in the coding wilderness.
            Arm yourself with our endless collection of coding courses,
            interactive exams, and a community that's second to none.
          </p>
          <p className="text-base font-semibold mb-12">
            Up your Laravel game and learn from{" "}
            <a href="abc">
              <span className="text-blue-600">
                the coding wizards who know it best. 👇
              </span>
            </a>
          </p>
          <div className="flex space-x-8">
            <a
              href="$"
              className="flex items-center w-fit bg-gray-700 bg-opacity-70 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 icon icon-tabler icons-tabler-filled icon-tabler-player-play"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
              </svg>
              Start Watching
            </a>
            <a
              href="$"
              className="flex items-center w-fit bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 icon icon-tabler icons-tabler-filled icon-tabler-home"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
              </svg>
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
