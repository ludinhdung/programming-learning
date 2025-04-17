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
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import CourseList from "./pages/CourseList/CourseList";
import CourseDetail from "./pages/Courses/CourseDetail";
import Topics from "./pages/Topics/Topics";
import LearningPaths from "./pages/LearningPaths/LearningPaths";
import LearningPathDetail from './pages/LearningPaths/LearningPathDetail';
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
// import CreateCourse from "./pages/CreateCourse/CreateCourse";
// Instructor Dashboard
import InstructorManagement from "./pages/InstructorDashboard/InstructorDashboard";
import Overview from "./components/InstructorManagement/Contents/Overview";
import InstructorCourseList from "./components/InstructorManagement/Contents/Course/CourseList";
import InstructorCreateCourse from "./components/InstructorManagement/Contents/Course/CreateCourse";
import InstructorCourseDetail from "./components/InstructorManagement/Contents/Course/CourseDetail";
// Topic Management
import TopicList from "./pages/InstructorDashboard/Topics/TopicList";
import CreateTopic from "./pages/InstructorDashboard/Topics/CreateTopic";
import EditTopic from "./pages/InstructorDashboard/Topics/EditTopic";
import TopicLayout from "./pages/InstructorDashboard/Topics/TopicLayout";
// Learning Path Management
import LearningPathList from "./pages/InstructorLeadDashboard/LearningPaths/LearningPathList";
import CreateLearningPath from "./pages/InstructorLeadDashboard/LearningPaths/CreateLearningPath";
import EditLearningPath from "./pages/InstructorLeadDashboard/LearningPaths/EditLearningPath";
import LearningPathLayout from "./pages/InstructorLeadDashboard/LearningPaths/LearningPathLayout";
// Supporter Dashboard
import SupporterDashboard from "./pages/SupporterDashboard/SupporterDashboard";
import SupporterOverview from "./components/SupporterManagement/Contents/Overview";
import SupporterManageInstructor from "./components/SupporterManagement/Contents/InstructorManagement";
import SupporterManageLearner from "./components/SupporterManagement/Contents/LearnerManagement/LearnerList";
import SupporterManageLearnerComments from "./components/SupporterManagement/Contents/LearnerManagement/LearnerComment";
import UserDashboard from "./pages/UserDashboard/UserDashboard";

import PracticeCode from "./pages/PracticeCode/PracticeCode";

// Workshop
import WorkshopListPage from "./pages/workshop/WorkshopListPage";
import WorkshopDetailPage from "./pages/workshop/WorkshopDetailPage";
import InstructorWorkshopListPage from "./pages/InstructorLeadDashboard/Workshops/InstructorWorkshopListPage";
import CreateWorkshopPage from "./pages/InstructorLeadDashboard/Workshops/CreateWorkshopPage";
import EditWorkshopPage from "./pages/InstructorLeadDashboard/Workshops/EditWorkshopPage";
import WorkshopManagementLayout from "./pages/InstructorLeadDashboard/Workshops/WorkshopLayout";
import WorkshopLayout from "./pages/workshop/WorkshopLayout";

// Instructor Lead Dashboard
import InstructorLeadDashboard from "./pages/InstructorLeadDashboard/InstructorLeadDashboard";

const App: React.FC = () => {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course-study/:courseId" element={<CourseStudy />} />
          <Route path="/practice-code/:lessonId" element={<PracticeCode />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* <Route path="/create-course" element={<CreateCourse />} /> */}
          <Route path="/courses" element={<CourseList />} />
          {/* <Route path="/courses/:id" element={<CourseDetail />} /> */}
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:id" element={<CourseList />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          {/* <Route path="/learning-paths/:id" element={<CourseList />} /> */}
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          {/* Instructor Dashboard*/}
          <Route path="/supporter-dashboard" element={<SupporterDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* <Route path="/create-course" element={<CreateCourse />} /> */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-paths/:pathId" element={<LearningPathDetail />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          {/* Instructor Dashboard*/}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/instructor-management" element={<InstructorManagement />}>
            <Route index element={<Overview />} />

            <Route path="course" element={<Outlet />}>
              <Route index element={<InstructorCourseList />} />
              <Route path="create" element={<InstructorCreateCourse />} />
              <Route path="detail/:courseId" element={<InstructorCourseDetail />} />
            </Route>
            
            <Route path="workshops" element={<WorkshopManagementLayout />}>
              <Route index element={<InstructorWorkshopListPage />} />
              <Route path="create" element={<CreateWorkshopPage />} />
              <Route path="edit/:workshopId" element={<EditWorkshopPage />} />
            </Route>
          </Route>
          {/* Supporter Dashboard*/}
          <Route path="/supporter-management" element={<SupporterDashboard />}>
            <Route index element={<SupporterOverview />}></Route>
            <Route path="instructor" element={<SupporterManageInstructor />}></Route>
            <Route path="learner" element={<Outlet />}>
              <Route index element={<SupporterManageLearner />}></Route>
              <Route path="comment/:learnerId" element={<SupporterManageLearnerComments />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
          {/* Instructor Lead Dashboard */}
          <Route path="/instructor-lead-management" element={<InstructorLeadDashboard />}>
            <Route index element={<Overview />} />
            
            <Route path="course" element={<Outlet />}>
              <Route index element={<InstructorCourseList />} />
              <Route path="create" element={<InstructorCreateCourse />} />
              <Route path="detail/:courseId" element={<InstructorCourseDetail />} />
            </Route>
            
            <Route path="topics" element={<TopicLayout />}>
              <Route index element={<TopicList />} />
              <Route path="create" element={<CreateTopic />} />
              <Route path=":id/edit" element={<EditTopic />} />
            </Route>
            
            <Route path="learning-paths" element={<LearningPathLayout />}>
              <Route index element={<LearningPathList />} />
              <Route path="create" element={<CreateLearningPath />} />
              <Route path=":id/edit" element={<EditLearningPath />} />
            </Route>
            
            <Route path="workshops" element={<WorkshopManagementLayout />}>
              <Route index element={<InstructorWorkshopListPage />} />
              <Route path="create" element={<CreateWorkshopPage />} />
              <Route path="edit/:workshopId" element={<EditWorkshopPage />} />
            </Route>
          </Route>
          {/* Topic Management */}
          <Route path="/instructor/topics" element={<TopicLayout />}>
            <Route index element={<TopicList />} />
            <Route path="create" element={<CreateTopic />} />
            <Route path=":id/edit" element={<EditTopic />} />
          </Route>
          
          {/* Learning Path Management */}
          <Route path="/instructor/learning-paths" element={<LearningPathLayout />}>
            <Route index element={<LearningPathList />} />
            <Route path="create" element={<CreateLearningPath />} />
            <Route path=":id/edit" element={<EditLearningPath />} />
          </Route>
          
          {/* Workshop Management - Chỉ giữ lại route cho người dùng xem danh sách workshop */}
          <Route path="/workshops" element={<WorkshopLayout />}>
            <Route index element={<WorkshopListPage />} />
            <Route path=":workshopId" element={<WorkshopDetailPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
