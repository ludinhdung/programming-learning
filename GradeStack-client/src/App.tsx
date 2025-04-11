// src/App.tsx
import React from "react";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Home from "./pages/HomePage/Home";
import NotFound from "./pages/NotFound";
// Learner
import CourseStudy from "./pages/CourseStudyPage/CourseStudy";
// Instructor
import SupporterDashboard from "./pages/SupporterDashboard/SupporterDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import CourseList from "./pages/CourseList/CourseList";
// import CourseDetail from "./pages/CourseDetail/CourseDetail";
import Topics from "./pages/Topics/Topics";
import LearningPaths from "./pages/LearningPaths/LearningPaths";
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
// import CreateCourse from "./pages/CreateCourse/CreateCourse";
// Instructor Dashboard
import InstructorManagement from "./pages/InstructorDashboard/InstructorDashboard";
import Overview from "./components/InstructorManagement/Contents/Overview";
import InstructorCourseList from "./components/InstructorManagement/Contents/Course/CourseList";
import InstructorCreateCourse from "./components/InstructorManagement/Contents/Course/CreateCourse";
import InstructorCourseDetail from "./components/InstructorManagement/Contents/Course/CourseDetail";
const App: React.FC = () => {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course-study" element={<CourseStudy />} />
          <Route path="/supporter-dashboard" element={<SupporterDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* <Route path="/create-course" element={<CreateCourse />} /> */}
          <Route path="/courses" element={<CourseList />} />
          {/* <Route path="/courses/:id" element={<CourseDetail />} /> */}
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:id" element={<CourseList />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-paths/:id" element={<CourseList />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          {/* Instructor Dashboard*/}
          <Route
            path="/instructor-management"
            element={<InstructorManagement />}
          >
            <Route index element={<Overview />} />
            <Route path="course" element={<Outlet />}>
              <Route index element={<InstructorCourseList />} />
              <Route path="create" element={<InstructorCreateCourse />} />
              <Route
                path="detail/:courseId"
                element={<InstructorCourseDetail />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
