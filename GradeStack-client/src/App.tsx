// src/App.tsx
import React from "react";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage/Home";


import NotFound from "./pages/NotFound";
// Learner
import CourseStudy from "./pages/CourseStudyPage/CourseStudy";
// Instructor
import InstructorManagement from "./pages/InstructorManagementPage/InstructorManagement";
import Overview from "./components/InstructorManagementComponents/Contents/Overview";
import Course from "./components/InstructorManagementComponents/Contents/Course";
const App: React.FC = () => {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />{" "}
          <Route path="/course-study" element={<CourseStudy />} />
          <Route
            path="/instructor-management"
            element={<InstructorManagement />}
          >
            <Route index element={<Overview />} />
            <Route path="course" element={<Course />} />
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
