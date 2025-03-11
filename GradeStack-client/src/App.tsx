// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage/Home";
import CourseStudy from "./pages/CourseStudyPage/CourseStudy";
import SupporterDashboard from "./pages/SupporterDashboard/SupporterDashboard";
import NotFound from "./pages/NotFound";
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import CourseList from './pages/CourseList/CourseList';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Topics from './pages/Topics/Topics';
import LearningPaths from './pages/LearningPaths/LearningPaths';
import Checkout from './pages/Checkout/Checkout';
import Profile from './pages/Profile/Profile';
import CreateCourse from "./pages/CreateCourse/CreateCourse";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-study" element={<CourseStudy />} />
        <Route path="/supporter-dashboard" element={<SupporterDashboard />} />
        <Route path="/admin" element={
            <AdminDashboard />
        } />
        <Route path="/create-course" element= {<CreateCourse/>}/>
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/topics/:id" element={<CourseList />} />
        <Route path="/learning-paths" element={<LearningPaths />} />
        <Route path="/learning-paths/:id" element={<CourseList />} />
        <Route path="/checkout/:courseId" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
