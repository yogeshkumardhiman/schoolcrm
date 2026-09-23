import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';

// 🧭 SHARED
import TabBar from './TabBar';

// 🎓 STUDENT SCREENS
import StudentDashboard from '../screens/private/student/Dashboard';
import StudentAttendance from '../screens/private/student/Attendance';
import StudentExams from '../screens/private/student/Exams';
import StudentHomework from '../screens/private/student/Homework';
import StudentFees from '../screens/private/student/Fees';
import PaymentCheckout from '../screens/private/student/Fees/Checkout';
import StudentNotice from '../screens/private/student/Notice';
import StudentNoticeDetail from '../screens/private/student/Notice/Detail';
import StudentEvents from '../screens/private/student/Events';
import StudentTimeTable from '../screens/private/student/TimeTable';
import HelpDesk from '../screens/private/student/HelpDesk';

// 🍎 TEACHER SCREENS
import TeacherDashboard from '../screens/private/teacher/Dashboard';
import AttendanceMarking from '../screens/private/teacher/Attendance';
import StudentRegistry from '../screens/private/teacher/Students';
import TestList from '../screens/private/teacher/Exams/TestList';
import AddMarks from '../screens/private/teacher/Exams/AddMarks.js';
import AddHomework from '../screens/private/teacher/Homework/AddHomework';
import TeacherHomeworkList from '../screens/private/teacher/Homework';
import TeacherHomeworkDetail from '../screens/private/teacher/Homework/HomeworkDetail';
import AddNotice from '../screens/private/teacher/Notice/AddNotice';
import TeacherNoticeList from '../screens/private/teacher/Notice/NoticeList'; // [NEW]
import StudentQueries from '../screens/private/teacher/StudentQueries';
import ApplyLeave from '../screens/private/teacher/ApplyLeave';
import TimeTable from '../screens/private/teacher/TimeTable';
import AttendanceHistory from '../screens/private/teacher/AttendanceHistory';
import StudentProfile from '../screens/private/teacher/StudentProfile';
import Profile from '../screens/private/common/Profile';
import BannerDetails from '../screens/private/common/BannerDetails'; // [NEW]

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🏠 PRIMARY TABS ROOT
const TabNav = ({ role }) => {
    const isStudent = role?.toLowerCase() === 'student';
    const isTeacher = role?.toLowerCase()?.includes('teacher');
    const { user } = useSelector(state => state.auth);
    const isClassTeacher = isTeacher && user?.class && user?.section;

    return (
        <Tab.Navigator
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeScreen"
                component={isStudent ? StudentDashboard : TeacherDashboard}
            />
            {(!isTeacher || isClassTeacher) && (
                <Tab.Screen
                    name="ActivityScreen"
                    component={isStudent ? StudentAttendance : AttendanceMarking}
                />
            )}
            {isStudent && (
                <Tab.Screen
                    name="NoticeScreen"
                    component={StudentNotice}
                />
            )}
            <Tab.Screen name="ProfileScreen">
                {(props) => <Profile {...props} role={role} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

// 🚀 GLOBAL NAVIGATION HUB (Suggested by User)
const PrivateRoutes = ({ role }) => {
    const isStudent = role?.toLowerCase() === 'student';
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Main Application Shell */}
            <Stack.Screen name="MainTabs">
                {(props) => <TabNav {...props} role={role} />}
            </Stack.Screen>

            {/* 🎓 GLOBAL STUDENT SUB-SCREENS */}
            <Stack.Screen name="StudentNoticeDetail" component={StudentNoticeDetail} />
            <Stack.Screen name="StudentEvents" component={StudentEvents} />
            <Stack.Screen name="StudentHomework" component={StudentHomework} />
            <Stack.Screen name="StudentFees" component={StudentFees} />
            <Stack.Screen name="PaymentCheckout" component={PaymentCheckout} />
            <Stack.Screen name="StudentTimeTable" component={StudentTimeTable} />
            <Stack.Screen name="StudentMarks" component={StudentExams} />
            <Stack.Screen name="HelpDesk" component={HelpDesk} />

            {/* 🍎 GLOBAL TEACHER SUB-SCREENS */}
            <Stack.Screen name="AttendanceMarking" component={AttendanceMarking} />
            <Stack.Screen name="StudentRegistry" component={StudentRegistry} />
            <Stack.Screen name="TestList" component={TestList} />
            <Stack.Screen name="AddMarks" component={AddMarks} />
            <Stack.Screen name="AddHomework" component={AddHomework} />
            <Stack.Screen name="TeacherHomeworkList" component={TeacherHomeworkList} />
            <Stack.Screen name="TeacherHomeworkDetail" component={TeacherHomeworkDetail} />
            <Stack.Screen name="AddNotice" component={AddNotice} />
            <Stack.Screen name="StudentQueries" component={StudentQueries} />
            <Stack.Screen name="ApplyLeave" component={ApplyLeave} />
            <Stack.Screen name="TimeTable" component={TimeTable} />
            <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
            <Stack.Screen name="StudentProfile" component={StudentProfile} />
            {!isStudent && (
                <Stack.Screen name="NoticeScreen" component={TeacherNoticeList} />
            )}

            {/* 👤 SHARED SCREENS */}
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="BannerDetails" component={BannerDetails} />
        </Stack.Navigator>
    );
};

export default PrivateRoutes;
