const STRINGS = {
    /** 
     * ==========================================
     * 🌐 COMMON / GLOBAL STRINGS
     * ==========================================
     */
    appName: 'SCHOOL PORTAL',
    version: 'Version 1.0.0',
    tagline: 'Education for a Better World',
    footerCredit: '© 2026-27 School App | Core v1.0.5',
    logoChar: 'S',
    
    // Actions
    login: 'Login',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    next: 'Next',
    getStarted: 'Get Started',
    seeAll: 'See All',
    viewAll: 'View All',
    acknowledgeNotice: 'ACKNOWLEDGE NOTICE',
    saveChanges: 'SAVE CHANGES',
    cancelEdit: 'CANCEL',
    respondNow: 'RESPOND NOW',
    editResponse: 'EDIT RESPONSE',
    submitResponse: 'SUBMIT RESPONSE',

    // Status & Feedback
    present: 'Present',
    absent: 'Absent',
    leave: 'Leave',
    paid: 'Paid',
    due: 'Due',
    resolved: 'Resolved',
    RESOLVED: 'RESOLVED',
    saving: 'SAVING...',
    syncingRecords: 'SYNCING RECORDS...',
    noDataFound: 'NO DATA FOUND',
    allClear: 'ALL CLEAR!',
    errorEmpty: 'This field cannot be empty',
    errorInvalid: 'Invalid input provided',
    dispatchSuccess: 'Response dispatched successfully',
    quickAccess: 'Quick Access',
    viewMarks: 'View Marks',
    loadingSession: 'Loading Session...',

    /** 
     * ==========================================
     * 🔐 AUTH & ONBOARDING (LOGIN / INTRO)
     * ==========================================
     */
    // Login Screen
    loginTitle: 'Student / Parent Portal',
    loginSubtitle: 'A Perfect Destination for Quality Education',
    welcomeBack: 'Welcome Back',
    loginToAccount: 'Login to your account',
    admissionNo: 'Admission Number',
    password: 'Password',
    student: 'Student',
    teacher: 'Teacher',
    email: 'Email',
    invalidCredentials: 'Invalid email or password',
    forgotPassword: 'Forgot Password? Contact office',
    admissionId: 'ADMISSION ID',
    officialEmail: 'OFFICIAL EMAIL',
    enterAdmission: 'Enter Admission Number',
    enterEmail: 'Enter Official Email',
    dobLabel: 'DATE OF BIRTH (DDMMYYYY)',
    accessPassword: 'ACCESS PASSWORD',
    authenticate: 'AUTHENTICATE SESSION',
    recoveryProtocol: 'Credential Recovery Protocol?',

    // Intro Slider
    introTitle1: 'Quality\nEducation',
    introDesc1: 'We provide a perfect destination for students to explore their full potential with modern teaching methodology.',
    introTitle2: 'Digital\nLearning',
    introDesc2: 'Access homework, study materials, and track progress effortlessly through our dedicated student portal.',
    introTitle3: 'Stay\nConnected',
    introDesc3: 'Get instant notifications about notices, upcoming events, and attendance directly on your mobile device.',

    /** 
     * ==========================================
     * 👨‍🎓 STUDENT MODULE
     * ==========================================
     */
    // Student Dashboard
    dashboard: 'Dashboard',
    home: 'Home',
    attendance: 'Attendance',
    marks: 'Marks / CGPA',
    homework: 'Homework',
    fees: 'Fees',
    notices: 'Recent Notices',
    upcomingEvents: 'Upcoming Events',
    adminUpdates: 'Admin Updates',
    adminUpdateDesc: 'All student data is managed through the admin panel. Check notifications for latest updates.',

    // Student Profile
    myProfile: 'My Profile',
    studentDetails: 'Student Details',
    parentDetails: 'Parent Details',
    parentName: 'Parent Name',
    session: 'Session',
    rollNo: 'Roll No',
    studentId: 'Student ID',
    admissionLabel: 'Admission No',
    dateOfBirth: 'Date of Birth',
    bloodGroup: 'Blood Group',
    address: 'Address',
    phone: 'Phone',
    class: 'Class',
    classTeacher: 'CLASS TEACHER',

    // Attendance
    overallAttendance: 'Overall Attendance',
    monthlyReport: 'Monthly Report',

    // Academic Performance
    academicPerformance: 'Academic Performance',
    overallPerformance: 'Overall Performance',
    subjectWise: 'Subject-wise Performance',
    marksObtained: 'Marks Obtained',
    totalMarks: 'Total Marks',
    grade: 'Grade',
    avgMarks: 'Marks',

    // Fees & Transport
    feeStatus: 'Fee Status',
    totalFees: 'Total Fees',
    paidFees: 'Paid Fees',
    remainingDue: 'Remaining Due',
    dueFees: 'Due Fees',
    paymentHistory: 'Payment History',
    transport: 'Transport',
    assignedRoute: 'Assigned Route',
    subscribed: 'Subscribed',
    monthlyLedger: 'Monthly Ledger (2026-27)',
    paymentConfirmed: 'Payment Confirmed',
    pendingPayment: 'Pending Payment',

    // Help Desk (Student Side)
    helpDesk: 'Institutional Help Desk',
    helpDeskDesc: 'Message your Class Teacher or Admin directly for any query.',
    myQueries: 'My Queries',
    newMsg: '+ NEW MESSAGE',
    noQueries: 'NO QUERIES YET',
    helpTagline: 'Speak up if you need any assistance!',
    newAssistance: 'NEW ASSISTANCE',
    selectCategory: 'SELECT CATEGORY',
    yourMessage: 'YOUR MESSAGE',
    msgPlaceholder: 'Describe your issue or query clearly...',
    sendToTeacher: 'SEND TO CLASS TEACHER',
    teacherResponse: "TEACHER'S RESPONSE:",
    chooseCategory: 'CHOOSE CATEGORY',

    // Notices & Events
    schoolNotice: 'Notice Board',
    noticeDetail: 'Notice Detail',
    announcements: 'Recent Announcements',
    schoolEvents: 'School Events',
    eventSubtitle: 'Important dates and activities',
    location: 'Location',
    time: 'Time',
    participants: 'Participants',
    highPriority: 'HIGH PRIORITY DISPATCH',
    adminSeal: 'CENTRAL ADMINISTRATION',

    /** 
     * ==========================================
     * 👨‍🏫 TEACHER / FACULTY MODULE
     * ==========================================
     */
    // Teacher Dashboard
    adminControlPanel: 'ADMIN CONTROL PANEL',
    institutionalHub: 'INSTITUTIONAL HUB',
    masterAccess: 'MASTER ACCESS',
    schoolAttendance: 'SCHOOL ATTENDANCE',
    classAttendance: 'CLASS ATTENDANCE',
    institutionWide: 'Institution Wide',
    presentToday: 'Present Today',
    totalScholars: 'TOTAL SCHOLARS',
    fleetSize: 'FLEET SIZE',
    institutionRegistry: 'Institution Registry',
    activeScholars: 'Active Scholars',
    adminModules: 'ADMINISTRATION MODULES',
    missionControl: 'MISSION CONTROL',

    // Timetable & Schedule
    myTimetable: 'MY TIMETABLE',
    weeklySchedule: 'WEEKLY SCHEDULE',
    currentPeriod: 'CURRENT PERIOD',
    nextPeriod: 'NEXT PERIOD',
    noClassesToday: 'NO CLASSES SCHEDULED TODAY',
    substitutionAlert: 'SUBSTITUTION ASSIGNED',
    periodMatrix: 'PERIOD MATRIX',
    dayNames: {
        MON: 'Monday',
        TUE: 'Tuesday',
        WED: 'Wednesday',
        THU: 'Thursday',
        FRI: 'Friday',
        SAT: 'Saturday'
    },

    // Student Management
    studentQueries: 'Student Queries',
    scholarQueries: 'Scholar Queries',
    queryDesc: 'Respond to student messages and grievances.',
    noPendingQueries: 'No pending student queries for your class.',
    respondTo: 'RESPOND TO',
    typeResponse: 'Type your response here...',
    masterScholarDirectory: 'MASTER SCHOLAR DIRECTORY',
    scholarDirectory: 'SCHOLAR DIRECTORY',

    // Faculty Profile Edit
    facultyProfile: 'FACULTY PROFILE',
    aboutMe: 'ABOUT ME',
    professionalOverview: ' PROFESSIONAL OVERVIEW',
    contactChannels: ' CONTACT CHANNELS',
    qualification: 'QUALIFICATION',
    subjects: 'SUBJECTS',
    joiningDate: 'JOINING DATE',
    workAddress: 'WORK ADDRESS',
    phoneNum: 'PHONE NUMBER',
    officialMail: 'INSTITUTIONAL EMAIL',
    bioPlaceholder: 'No bio added yet. Tell scholars about your professional journey!',
    bioPlaceholderInput: 'Write a brief professional bio...',
    sessionYear: '2026-2027',

    // Teacher Notice Emitter
    noticeEmitter: 'NOTICE EMITTER',
    myClass: 'MY CLASS',
    entireSchool: 'ENTIRE SCHOOL',
    noticeTitleLabel: 'NOTICE TITLE',
    noticeContentLabel: 'NOTICE CONTENT',
    releaseNotice: 'RELEASE NOTICE',
    confirmBroadcaster: 'Confirm Broadcaster',
    missingInfo: 'Missing Info',
    provideTitleContent: 'Please provide both title and content for the notice.',
    releaseToTarget: 'Release this notice to',
    release: 'Release',
    instantBroadcastMsg: 'This notice will be instantly broadcasted to the parent portal of the selected target group.',

    // Homework & Assignments
    assignmentHub: 'ASSIGNMENT HUB',
    assignmentTitle: 'ASSIGNMENT TITLE',
    protocolDescription: 'PROTOCOL DESCRIPTION',
    scholarsInstructions: 'Detailed instructions for the scholars...',
    submissionDeadline: 'SUBMISSION DEADLINE',

    // Teacher Dashboard Extra
    sysUnderMaintenance: 'System Under Maintenance',
    sysUnderMaintenanceDesc: 'Our digital campus is undergoing system-wide upgrades. We will be back online shortly with enhanced learning features!',
    examMarksMenu: 'EXAM MARKS',
    examMarksDesc: 'Score Registry',
    homeworkMenu: 'HOMEWORK',
    homeworkDesc: 'Assignments',
    noticesMenu: 'NOTICES',
    noticesDesc: 'Class Alerts',
    timetableMenu: 'TIMETABLE',
    timetableDesc: 'My Schedule',
    calendarMenu: 'CALENDAR',
    calendarDesc: 'Events & Holidays',
    todaysOverview: "Today's Overview",
    refresh: '↻ Refresh',
    myScholars: 'My Scholars',
    studentsCount: 'Students',
    presentTodayLabel: 'Present Today',
    pendingQueriesLabel: 'Pending Queries',
    openTickets: 'Open Tickets',
    substitutionAlertsLabel: 'Substitution Alerts',
    activeAlerts: 'Active Alerts',
    urgentSubstitutions: 'Urgent Substitutions',
    noSubstitutions: 'No substitutions assigned for today. You can focus on your regular timetable.',
    substPeriod: 'Period',
    goodMorning: 'Good Morning! 👋',
    goodAfternoon: 'Good Afternoon! ☀️',
    goodEvening: 'Good Evening! 🌙',
    flagAsUrgent: 'FLAG AS URGENT',
    urgentNotifyDesc: 'Notify scholars immediately via telemetry push.',
    lockAssignmentMsg: 'Once deployed, the assignment will be locked. Scholars can begin uploading submissions immediately.',
    deployAssignment: 'DEPLOY ASSIGNMENT',
    confirmDeployment: 'Confirm Deployment',
    deployToTarget: 'Deploy this assignment to',
    deploy: 'Deploy',
    provideTitleInstructions: 'Please provide both title and instructions for the assignment.',
    dueDate: 'Due Date',
    pending: 'Pending',
    completed: 'Completed',

    // Common Interaction
    areYouSure: 'Are you sure?',
    confirmLogout: 'Confirm Logout',
    logoutDesc: 'Do you really want to logout from your account?',

    // 🏛️ Leave Governance (Teacher Side)
    leaveGovernance: 'LEAVE GOVERNANCE',
    newAbsencePetition: 'NEW ABSENCE PETITION',
    startDate: 'START DATE',
    endDate: 'END DATE',
    petitionType: 'PETITION TYPE',
    fullDay: 'FULL DAY',
    halfDay: 'HALF DAY',
    reasonForAbsence: 'REASON FOR ABSENCE',
    commitPetition: 'COMMIT PETITION',
    petitionHistory: 'PETITION HISTORY',
    noActivePetitions: 'NO ACTIVE PETITIONS LOGGED',

    // 📝 Assessment / Exam Keys (Teacher Side)
    examRegistry: 'EXAM REGISTRY',
    modules: 'MODULES',
    activeProtocols: 'ACTIVE PROTOCOLS',
    newAssessment: 'NEW ASSESSMENT',
    architectAssessment: 'ARCHITECT ASSESSMENT',
    scoreAllocation: 'SCORE ALLOCATION',
    fleetPerformance: 'FLEET PERFORMANCE',
    commitAssessmentLog: 'COMMIT ASSESSMENT LOG',

    // 💡 Dashboard, Quick Support & Interface Labels
    facultyAccess: 'FACULTY ACCESS',
    quickSupport: 'Quick Support',
    messageTeacher: 'Message Teacher',
    upcomingEvent: 'Upcoming Event',
    findScholar: 'FIND SCHOLAR...',
    enrollScholar: 'ENROLL SCHOLAR',
    thisMonth: 'This Month',

    // 🎓 Academic Results & Report Card Modal
    viewFullReportCard: 'VIEW FULL REPORT CARD',
    officialReportCard: 'Official Report Card',
    academicSession: 'Academic Session',
    examination: 'Examination',
    subject: 'Subject',
    marksLabel: 'Marks',
    passed: 'PASSED',
    failed: 'FAILED',
    instPerformanceCert: 'Institutional Performance Certification',
    certificationDesc: "This digital report card is an official record of the student's academic progress for the current session.",
    downloadMarksheetPdf: 'Download Marksheet PDF',

    // 👨‍🏫 Exam Row Inputs & Assessment Titles
    subjectsCount: 'Subjects',
    noSubjects: 'No Subjects',
    examTitlePlaceholder: 'EXAM TITLE (UNIT 1, HALF-YEARLY)',
    maxMarksLabel: 'Max',
    addSubject: '+ Add Subject',
    scheduledDate: 'SCHEDULED DATE',

    // 👨‍🏫 AddMarks Labels
    selectStudent: 'Select Student',
    enterMarks: 'Enter Marks',
    noSubjectsFound: 'No subjects found for this exam.',
    outOfLabel: 'Out of',
    synchronizingRegistry: 'Synchronizing Registry...',
};

export { STRINGS };
