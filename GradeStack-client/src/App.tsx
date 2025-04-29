// src/App.tsx
import React from "react";
// Không cần import MantineProvider ở đây vì đã được import trong ThemeWrapper
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeWrapper from "./components/ThemeWrapper";
import "./styles/theme.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
// Import cho Instructor Lead Dashboard
import InstructorLeadDashboard from "./pages/InstructorLeadDashboard/InstructorLeadDashboard";
import InstructorLeadOverview from "./pages/InstructorLeadDashboard/Overview";
import InstructorLeadTopicLayout from "./pages/InstructorLeadDashboard/Topics/TopicLayout";
import InstructorLeadTopicList from "./pages/InstructorLeadDashboard/Topics/TopicList";
import InstructorLeadCreateTopic from "./pages/InstructorLeadDashboard/Topics/CreateTopic";
import InstructorLeadEditTopic from "./pages/InstructorLeadDashboard/Topics/EditTopic";
import InstructorLeadLogin from "./pages/InstructorLeadLogin/InstructorLeadLogin";
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
import LearningPathDetail from "./pages/LearningPaths/LearningPathDetail";
import Workshops from "./pages/Workshops/Workshops";
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
import InstructorDetail from "./pages/Instructor/InstructorDetail";
// import CreateCourse from "./pages/CreateCourse/CreateCourse";

// Instructor Dashboard
import InstructorManagement from "./pages/InstructorDashboard/InstructorDashboard";
import Overview from "./components/InstructorManagement/Contents/Overview";
import InstructorCourseList from "./components/InstructorManagement/Contents/Course/CourseList";
import InstructorCreateCourse from "./components/InstructorManagement/Contents/Course/CreateCourse";
import InstructorCourseDetail from "./components/InstructorManagement/Contents/Course/CourseDetail";
import InstructorProfile from "./components/InstructorManagement/Contents/Profile";
import LearningPathList from "./pages/InstructorLeadDashboard/LearningPaths/LearningPathList";
import CreateLearningPath from "./pages/InstructorLeadDashboard/LearningPaths/CreateLearningPath";
import EditLearningPath from "./pages/InstructorLeadDashboard/LearningPaths/EditLearningPath";
import LearningPathLayout from "./pages/InstructorLeadDashboard/LearningPaths/LearningPathLayout";
import InstructorMonetization from "./components/InstructorManagement/Contents/Monetization";
// Workshop Management
import WorkshopLayout from "./pages/InstructorLeadDashboard/Workshops/WorkshopLayout";
import WorkshopList from "./pages/InstructorLeadDashboard/Workshops/WorkshopList";
import CreateWorkshop from "./pages/InstructorLeadDashboard/Workshops/CreateWorkshop";
import EditWorkshop from "./pages/InstructorLeadDashboard/Workshops/EditWorkshop";
import WorkshopAttendees from "./pages/InstructorLeadDashboard/Workshops/WorkshopAttendees";
// Supporter Dashboard
import SupporterDashboard from "./pages/SupporterDashboard/SupporterDashboard";
import SupporterOverview from "./components/SupporterManagement/Contents/Overview";
import SupporterManageInstructor from "./components/SupporterManagement/Contents/InstructorManagement";
import SupporterManageLearner from "./components/SupporterManagement/Contents/LearnerManagement/LearnerList";
import SupporterManageLearnerComments from "./components/SupporterManagement/Contents/LearnerManagement/LearnerComment";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import UserWorkshops from "./pages/UserDashboard/UserWorkshops";

import PracticeCode from "./pages/PracticeCode/PracticeCode";
import { TransactionList } from "./components/InstructorManagement/Contents/Transaction";
// Import CourseVerification cho Instructor Management
import { CourseVerificationList as InstructorCourseVerificationList } from "./components/InstructorManagement/Contents/CourseVerification";
import CourseVerificationDetail from "./components/InstructorManagement/Contents/CourseVerification/CourseVerificationDetail";
// Import CourseVerification cho Instructor Lead Dashboard
import { CourseVerificationList } from "./pages/InstructorLeadDashboard/CourseVerification";
import { CourseVerificationDetail as LeadCourseVerificationDetail } from "./pages/InstructorLeadDashboard/CourseVerification";
import AdminOverview from "./pages/AdminDashboard/components/Overview";
import AdminTransactions from "./pages/AdminDashboard/components/Transactions";
import AdminSupporterManagement from "./pages/AdminDashboard/components/SupporterManagement";
import AdminWithdrawalRequests from "./pages/AdminDashboard/components/WithdrawalRequests";
import ContentManagement from './components/InstructorManagement/Contents/ContentManagement';

const App: React.FC = () => {
  // Không cần tạo theme ở đây nữa vì đã được tạo trong ThemeWrapper

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course-study/:courseId" element={<CourseStudy />} />
            <Route path="/practice-code/:lessonId" element={<PracticeCode />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="supporters" element={<AdminSupporterManagement />} />
              <Route path="withdrawals" element={<AdminWithdrawalRequests />} />
            </Route>
            {/* <Route path="/create-course" element={<CreateCourse />} /> */}
            <Route path="/courses" element={<CourseList />} />
            {/* <Route path="/courses/:id" element={<CourseDetail />} /> */}
            <Route path="/topics" element={<Topics />} />
            <Route path="/topics/:id" element={<CourseList />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* <Route path="/learning-paths/:id" element={<CourseList />} /> */}
            <Route path="/checkout/:courseId" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            {/* Instructor Dashboard*/}
            <Route path="/supporter-dashboard" element={<SupporterDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* <Route path="/create-course" element={<CreateCourse />} /> */}
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route
              path="/instructor/:instructorId"
              element={<InstructorDetail />}
            />
            <Route path="/topics" element={<Topics />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route
              path="/learning-paths/:pathId"
              element={<LearningPathDetail />}
            />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/checkout/:courseId" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/my-workshops" element={<UserWorkshops />} />
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
              <Route path="monetization" element={<InstructorMonetization />} />
              <Route path="transactions" element={<TransactionList />} />
              <Route path="verify-courses" element={<InstructorCourseVerificationList />} />
              <Route
                path="verify-courses/:courseId"
                element={<CourseVerificationDetail />}
              />
              <Route path="profile" element={<InstructorProfile />} />
              <Route path="content" element={<ContentManagement />} />
            </Route>
            {/* Supporter Dashboard*/}
            <Route path="/supporter-management" element={<SupporterDashboard />}>
              <Route index element={<SupporterOverview />}></Route>
              <Route
                path="instructor"
                element={<SupporterManageInstructor />}
              ></Route>
              <Route path="learner" element={<Outlet />}>
                <Route index element={<SupporterManageLearner />}></Route>
                <Route
                  path="comment/:learnerId"
                  element={<SupporterManageLearnerComments />}
                />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />




            {/* Instructor Lead Dashboard - Quản lý cho Instructor Lead */}
            {/* Trang đăng nhập cho Instructor Lead */}
            <Route path="/instructor-lead/login" element={<InstructorLeadLogin />} />

            <Route path="/instructor-lead" element={<InstructorLeadDashboard />}>
              <Route index element={<InstructorLeadOverview />} />
              {/* Quản lý Topics - Sử dụng API từ instructor-lead service */}
              <Route path="topics" element={<InstructorLeadTopicLayout />}>
                <Route index element={<InstructorLeadTopicList />} />
                <Route path="create" element={<InstructorLeadCreateTopic />} />
                <Route path=":id/edit" element={<InstructorLeadEditTopic />} />
              </Route>
              {/* Quản lý Learning Paths - Chỉ Instructor Lead mới có quyền tạo và chỉnh sửa */}
              <Route path="learning-paths" element={<LearningPathLayout />}>
                <Route index element={<LearningPathList />} />
                <Route path="create" element={<CreateLearningPath />} />
                <Route path="edit/:id" element={<EditLearningPath />} />
              </Route>

              {/* Quản lý Workshop - Chỉ Instructor Lead mới có quyền quản lý */}
              <Route path="workshops" element={<WorkshopLayout />}>
                <Route index element={<WorkshopList />} />
                <Route path="create" element={<CreateWorkshop />} />
                <Route path=":id/edit" element={<EditWorkshop />} />
                <Route path=":id/attendees" element={<WorkshopAttendees />} />
              </Route>

              {/* Quản lý xác minh khóa học - Chỉ Instructor Lead mới có quyền xác minh */}
              <Route path="verify-courses" element={<CourseVerificationList />} />
              <Route path="verify-courses/:courseId" element={<LeadCourseVerificationDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeWrapper>
    </ThemeProvider>
  );
};

export default App;
