/**
 * ==============================================================================
 * 🏛️ CENTRALIZED WEBSITE STRINGS & TEMPLATE MATRIX
 * ==============================================================================
 * All static UI text, section headings, form labels, and placeholders
 * across every public page are unified here for clean maintenance.
 * 
 * ALL dynamic school identity parameters (School Name, Session, Phones, Emails,
 * Address, Affiliation Number, Counts/Stats, Calendar Events, Gallery, Staff)
 * come 100% dynamically from the Admin API / Database!
 */

export const STRINGS = {
  // ── 🌐 1. GLOBAL & NAVIGATION LABELS ──
  global: {
    defaultSchoolName: "School Portal",
    defaultShortName: "School",
    defaultTagline: "CBSE Affiliated Senior Secondary Institution",
    defaultMotto: "Excellence in Education, Integrity in Character",
    defaultAffiliationNo: "",
    defaultPhone: "",
    defaultEmail: "",
    defaultAddress: "",
    cbseBoardTag: "CBSE Affiliated • New Delhi",
    navHome: "Home",
    navAbout: "About Us",
    navTeam: "Our Team",
    navAdmissions: "Admissions",
    navGallery: "Gallery",
    navFees: "Fee Structure",
    navCalendar: "Academic Calendar",
    navCareer: "Careers",
    navMandatory: "CBSE Mandatory",
    navContact: "Contact Us",
    navLogin: "Portal Login",
    virtualTourBtn: "Virtual Tour",
    applyNowBtn: "Apply Now",
    quickLinksTitle: "Quick Links",
    academicsTitle: "Academics & Wings",
    contactDeskTitle: "Campus Helpdesk",
    copyrightNotice: "All rights reserved. Powered by Unified CBSE Education Suite."
  },

  // ── 🏠 2. HOME PAGE (/) ──
  home: {
    tickerBadge: "LATEST UPDATE",
    tickerPrefix: "LATEST UPDATE",
    tickerNews: "Latest News",
    tickerNotices: [
      "Admissions Open for Academic Session {session} | Nursery to Class XII",
      "School achieves 100% Board Result Distinction in CBSE Examinations",
      "Annual Inter-School Athletic Championship registrations now open",
      "New STEM & Artificial Intelligence Innovation Laboratory inaugurated"
    ],
    tickerDefaultNotices: [
      "Admissions Open for Academic Session {session} | Nursery to Class XII",
      "School achieves 100% Board Result Distinction in CBSE Examinations",
      "Annual Inter-School Athletic Championship registrations now open",
      "New STEM & Artificial Intelligence Innovation Laboratory inaugurated"
    ],
    heroTag: "ACADEMIC EXCELLENCE & DISCIPLINE",
    heroHeading: "Empowering Minds, Shaping Tomorrow's Leaders",
    heroTitle: "Empowering Minds, Shaping Tomorrow's Leaders",
    heroWelcomeTag: "WELCOME TO ",
    heroSubTitle: "A Legacy of Quality Education & Character Building",
    heroDesc: "Blending rigorous CBSE academics with moral mastery, dynamic sports, and modern STEM laboratories to cultivate future-ready achievers.",
    heroDescription: "Blending rigorous CBSE academics with moral mastery, dynamic sports, and modern STEM laboratories to cultivate future-ready achievers.",
    heroBtnEnroll: "Enroll Today",
    heroBtnExplore: "Virtual Tour",
    heroExploreBtn: "Explore Campus",
    heroAdmissionsBtn: "Admissions Open {session}",
    heroStats: [
      { number: "18+", label: "Years of Legacy", desc: "CBSE Distinction" },
      { number: "2500+", label: "Enrolled Scholars", desc: "Nursery to XII" },
      { number: "100%", label: "Board Results", desc: "Consistent Pedigree" },
      { number: "1:20", label: "Teacher Ratio", desc: "Personal Care" }
    ],
    aboutSchoolTag: "ABOUT OUR INSTITUTION",
    aboutSchoolHeading: "A Benchmark of Quality Education",
    aboutSchoolBody: "Founded with a vision to provide holistic, future-ready, and value-driven education, our school nurtures intellectual curiosity, emotional resilience, and moral character in every student.",
    whyChooseTag: "INSTITUTIONAL ADVANTAGE",
    whyChooseTitlePrefix: "Why Choose ",
    whyChooseSub: "Path to Excellence",
    whyChooseHeading: "Why Choose Our School?",
    whyChooseDesc: "We provide an enriching scholastic ecosystem designed to cultivate deep analytical reasoning and life skills.",
    whyChooseAdvantage: "Institutional Advantage",
    whyChooseDescLong: "Discover why our school stands as a beacon of academic excellence and character building.",
    whyStatYears: "18Yr+",
    whyStatYearsSub: "Global Legacy",
    whyStatResults: "100%",
    whyStatResultsSub: "Board Results",
    whyChoosePoints: [
      { title: "Safe & Secure Campus", desc: "24/7 CCTV surveillance, automated gates, and GPS-tracked transport fleet." },
      { title: "Smart Digital Classes", desc: "Interactive smart touch panels and cloud-integrated visual curriculum." },
      { title: "Seasoned CBSE Faculty", desc: "Certified, experienced educators with proven mentoring records." },
      { title: "Holistic Development", desc: "Integrated sports coaching, public speaking, arts, and coding labs." }
    ],
    wingsTag: "ACADEMIC WINGS",
    wingsHeading: "Structured Scholastic Framework",
    wingsDesc: "Progressive, stage-wise CBSE curriculum tailored for each developmental milestone.",
    academicsTag: "Educational Framework",
    academicsTitle: "Academic Protocol",
    academicsDesc: "A holistic, rigorous pedagogical structure designed to cultivate deep critical thinking and logical analytical skills across grade levels.",
    facilitiesTag: "CAMPUS INFRASTRUCTURE",
    facilitiesTitle: "Premium Facilities",
    facilitiesHeading: "World-Class Learning Ecosystem",
    facilitiesDesc: "State-of-the-art infrastructure designed to inspire academic and extracurricular excellence.",
    facilitiesList: [
      { title: 'Digital Smart Classes', desc: 'Interactive visual learning with smart touch boards and cloud integration.' },
      { title: 'STEM Science & Robotics Labs', desc: 'Well-equipped physics, chemistry, biology, and robotics laboratories.' },
      { title: 'Multi-Sport Athletic Complex', desc: 'Spacious green grounds for football, cricket, basketball, and track events.' },
      { title: 'GPS Safe School Transport', desc: 'GPS-monitored school bus routing covering all city & adjacent sectors safely.' }
    ],
    admissionTag: "Academic Admissions Open",
    admissionTitle: "Begin the Journey of Intellectual Mastery",
    admissionDesc: "Secure your enrollment for the upcoming academic session. Join our legacy institution.",
    admissionBtn: "Initiate Registration",
    leadershipTag: "LEADERSHIP DESK",
    leadershipTitle: "Architects of Excellence",
    leadershipHeading: "Guiding Words from Leadership",
    toppersTag: "ACADEMIC ACHIEVEMENTS",
    toppersTitle: "Celebrating our highest achievers across academic sessions",
    toppersHeading: "Board Toppers Podium",
    toppersDesc: "Celebrating our highest achievers across CBSE board examinations.",
    toppersPlaceholder: [],
    testimonialsTag: "VOICES OF TRUST",
    testimonialsTitle: "Parent's Perspective",
    testimonialsHeading: "What Parents & Alumni Say",
    testimonialsFallback: "No testimonials shared yet.",
    galleryTitle: "School Gallery",
    galleryViewAll: "View All",
    ctaHeading: "Ready to Begin Your Scholar's Journey?",
    ctaSubheading: "Enroll for Academic Session {session} and unlock unmatched scholastic excellence.",
    ctaTitle: "Ready For Excellence?",
    ctaSub: "Join the lineage of leaders at ",
    ctaBtn: "Enroll Now",
    ctaEnrollBtn: "Apply for Admission",
    ctaInquiryBtn: "Contact Campus Desk",
    faqTag: "SUPPORT & FAQS",
    faqTitle: "Frequently Asked Questions",
    faqHeading: "Frequently Asked Questions",
    faqList: [
      { q: "What curriculum does the school follow?", a: "We strictly follow the Central Board of Secondary Education (CBSE, New Delhi) curriculum with experiential and skill-based learning integration." },
      { q: "What are the school hours and seasonal timings?", a: "Summer timings (April – Sept): 07:30 AM to 01:30 PM. Winter timings (Oct – March): 09:00 AM to 03:00 PM." },
      { q: "Is GPS-tracked school bus transport available?", a: "Yes, our dedicated fleet of GPS-tracked buses covers all major city routes, adjacent towns, and surrounding neighborhoods with trained attendants." },
      { q: "How can parents track student attendance and homework daily?", a: "Parents have 24/7 access to our unified School Mobile App and Web Portal for real-time attendance alerts, fee receipts, syllabus tracking, and exam reports." }
    ],
    principalTag: "Principal Desk",
    principalMessageTag: "Institutional Message",
    principalTitle: "Nurturing Leaders Of Tomorrow",
    principalDesignation: "Principal Desk",
    principalLabel: "— by Principal",
    statsScholars: "Scholars",
    statsFaculty: "Faculty",
    statsLegacy: "Legacy",
    statsAwards: "Awards",
    defaultManagementMsg: "We are dedicated to building a standard-setting academy that merges top-tier curriculum with deep moral fiber. We nurture scholars to achieve their highest potentials in a disciplined environment."
  },

  // ── 🏛️ 3. ABOUT US (/about) ──
  about: {
    heroTag: "INSTITUTIONAL HERITAGE",
    heroHeading: "Legacy of Academic Distinction & Moral Values",
    heroDescription: "Nurturing generations of visionary thinkers, compassionate leaders, and nation builders since our inception.",
    missionTag: "OUR MISSION",
    missionHeading: "Nurturing Hearts & Intellect",
    missionBody: "To foster a stimulating educational environment that empowers scholars with critical intellect, ethical values, and global competence.",
    visionTag: "OUR VISION",
    visionHeading: "Shaping Future Leaders",
    visionBody: "To emerge as a benchmark institution of creative learning, fostering innovation, compassion, and academic distinction across diverse scholastic domains.",
    rulesTag: "DISCIPLINE & GOVERNANCE",
    rulesHeading: "CBSE Code of Conduct & Campus Rules",
    rulesDesc: "Standardized institutional guidelines ensuring student safety, punctuality, and mutual respect.",
    leadershipTag: "EXECUTIVE BOARD",
    leadershipHeading: "Founders & Leadership Council"
  },

  // ── 👥 4. OUR TEAM (/team) ──
  team: {
    heroTag: "EXEMPLARY FACULTY & LEADERSHIP",
    heroHeading: "Meet Our Dedicated Team",
    heroDescription: "Our visionary leaders, certified CBSE educators, and administrative staff work in synergy to foster intellectual brilliance and character in every scholar.",
    searchPlaceholder: "Search educator by name, subject, or designation...",
    filterAll: "All Members",
    filterManagement: "Management",
    filterPrincipal: "Principal",
    filterTeachers: "Teachers",
    filterStaff: "Staff",
    modalExpLabel: "Total Experience",
    modalVerificationLabel: "CBSE Certified Faculty",
    modalQualificationTitle: "Academic Qualification & Degrees",
    modalSubjectTitle: "Subject Specialization & Wing",
    modalFullProfileBtn: "View Full Profile Page",
    noResultsTitle: "No Faculty Found",
    noResultsDesc: "No educator matched your search query. Try clearing the filter or search query."
  },

  // ── 💳 5. FEE STRUCTURE & TRANSPORT (/fees) ──
  fees: {
    heroTag: "TRANSPARENT TUITION SCHEDULE",
    heroHeading: "Fee Structure & Transport Slabs",
    heroDescription: "Clear, transparent fee tiers and zone-wise school bus charges for Academic Session {session}.",
    tuitionTiersHeading: "Class-Wise Academic Tuition Slabs",
    transportHeading: "School Bus Transport Routes & Slabs",
    transportSearchPlaceholder: "Search bus route, locality, or stop name...",
    scheduleHeading: "Quarterly Fee Timetable",
    bankDetailsHeading: "Official School Bank Account Details",
    noteFeePolicy: "All fees are collected quarterly. Late fee fine applies after the 15th of the due month."
  },

  // ── 💼 6. CAREERS & RECRUITMENT (/career) ──
  career: {
    heroTag: "FACULTY RECRUITMENT • SESSION {session}",
    heroHeading: "Shape the Future of Tomorrow's Leaders",
    heroDescription: "Join our dynamic fraternity of educators, researchers, and mentors dedicated to transformative pedagogy and student excellence.",
    perksTag: "INSTITUTIONAL PERKS",
    perksHeading: "Why Build Your Career With Us?",
    vacanciesTag: "OPEN POSITIONS",
    vacanciesHeading: "Current Open Vacancies",
    applicationTag: "DIRECT APPLICATION",
    applicationHeading: "Join Our Dedicated Teaching Fraternity",
    applicationDesc: "Submit your credentials below. Shortlisted applicants will be notified for an initial panel interaction and classroom teaching demonstration.",
    helpdeskTitle: "Campus Recruitment Desk",
    hrHelplineLabel: "HR Helpline",
    careersEmailLabel: "Careers Inbox",
    walkInLabel: "Walk-in Interviews",
    walkInTimings: "Mon – Sat (10:00 AM – 2:00 PM)",
    formFullName: "Full Name *",
    formEmail: "Email Address *",
    formPhone: "Phone Number *",
    formExperience: "Teaching Experience *",
    formPosition: "Position Applied For *",
    formQualification: "Highest Qualification *",
    formResumeUrl: "Resume / Portfolio Link (Google Drive / LinkedIn / PDF URL)",
    formCoverLetter: "Cover Letter / Teaching Philosophy",
    formSubmitBtn: "Submit Faculty Application",
    formSubmittingBtn: "Submitting Application...",
    successHeading: "Application Received!",
    successDesc: "Thank you for applying. Our faculty selection committee will review your profile and reach out within 3 working days."
  },

  // ── 📞 7. CONTACT US (/contact) ──
  contact: {
    heroTag: "CAMPUS HELPDESK & ADMISSION COUNTER",
    heroHeading: "We Are Here to Assist You",
    heroHeadingPrefix: "Connect With ",
    heroDesc: "Have questions regarding admissions, transport routes, fee schedules, or academic curriculum? Our admissions helpdesk is here to assist you.",
    heroDescription: "Have questions regarding admissions, transport routes, fee schedules, or academic curriculum? Our admissions helpdesk is here to assist you.",
    callDeskTag: "Call Desk",
    admissionsHelplineTitle: "Admissions Helpline",
    callDirectlyLabel: "Click to Call Directly",
    emailDeskTag: "Official Email",
    emailDeskTitle: "Administrative Inbox",
    sendEmailLabel: "Send Official Email",
    locationDeskTag: "Campus Location",
    locationDeskTitle: "Main Institutional Campus",
    viewMapsLabel: "View on Maps",
    hoursDeskTag: "Office Hours",
    hoursDeskTitle: "Visiting & Counter Timing",
    sundayClosedLabel: "Sunday Closed",
    assistanceTag: "Dedicated Assistance",
    assistanceHeading: "We're Here to Guide Your Child's Educational Journey",
    assistanceDesc: "Whether you are seeking new admission for Session {session}, details on CBSE syllabus, bus transportation routes, or fee installments, our counselors are at your service.",
    inquiryFormHeading: "Send an Online Inquiry",
    inquiryFormDesc: "Fill in your details below and our counselor will call you within 24 business hours.",
    extensionsHeading: "Direct Department Helplines",
    locationHeading: "Campus Geographic Coordinates",
    mapDirectionsTag: "Directions & Proximity",
    visitCampusTitle: "Visit Our Campus",
    openGoogleMapsBtn: "Open in Google Maps",
    formParentName: "Parent / Guardian Name *",
    placeholderParentName: "e.g. Guardian Name",
    formMobile: "Mobile Phone Number *",
    placeholderMobile: "10-digit mobile number",
    formEmail: "Email Address (Optional)",
    placeholderEmail: "name@example.com",
    formSubject: "Inquiry Purpose",
    formMessage: "Message / Student Details",
    placeholderMessage: "Mention child's age, target class, and any specific queries...",
    formSubmitBtn: "Submit Inquiry to Admissions Desk",
    formSubmittingBtn: "Submitting...",
    successHeading: "Inquiry Submitted Successfully!",
    successDesc: "Thank you for connecting with {schoolName}. Our admissions officer will contact you on your registered mobile number.",
    sendAnotherBtn: "Send Another Inquiry",
    validationError: "Please fill in your name and 10-digit mobile number."
  },

  // ── 📅 8. ACADEMIC CALENDAR (/academic-calendar) ──
  academicCalendar: {
    heroTag: "ANNUAL SCHOLASTIC SCHEDULE",
    heroHeading: "Academic Calendar & Key Events",
    heroDescription: "Stay informed about examination schedules, national holidays, vacations, sports meets, and parent-teacher interactions.",
    tabCalendarView: "Calendar View",
    tabListView: "Chronological List",
    summerTimingsTitle: "Summer Timings (April – September)",
    summerTimingsDesc: "07:30 AM to 01:30 PM",
    winterTimingsTitle: "Winter Timings (October – March)",
    winterTimingsDesc: "09:00 AM to 03:00 PM"
  },

  // ── 📸 9. GALLERY (/gallery) ──
  gallery: {
    heroTag: "VISUAL ARCHIVE & MEMORIES",
    heroHeading: "Campus Life in Pictures",
    heroDescription: "Explore memorable scholastic ceremonies, sports championships, laboratory experiments, and annual cultural celebrations.",
    categoryAll: "All Albums",
    memorialCapture: "CAMPUS MOMENT"
  },

  // ── 📝 10. ADMISSIONS (/admission) ──
  admission: {
    heroTag: "SESSION {session} ADMISSIONS OPEN",
    heroHeading: "Empowering Minds, Shaping Futures",
    heroDescription: "Cultivating intellectual depth, moral integrity, and CBSE distinction in every scholar.",
    heroTitle: "Empowering Minds, Shaping Futures",
    heroDesc: "Cultivating intellectual depth, moral integrity, and CBSE distinction in every scholar.",
    alumniTag: "Alumni Network",
    ratedTag: "CBSE Distinction",
    roadmapHeading: "4-Step Enrollment Roadmap",
    formTitle: "Admission Inquiry Portal",
    formSub: "Direct Registration Desk",
    successTitle: "Inquiry Submitted Successfully!",
    successDesc: "Thank you for reaching out. Our admissions counselor will contact you on your registered mobile number shortly.",
    btnNewInquiry: "Submit Another Inquiry",
    labelStudent: "Student Full Name",
    placeholderStudent: "Enter student's full name",
    labelClass: "Applying For Grade / Class",
    placeholderClass: "Select Grade Level",
    labelParent: "Parent / Guardian Name",
    placeholderParent: "Enter father's / mother's name",
    labelMobile: "10-Digit Mobile Number",
    placeholderMobile: "Enter 10-digit mobile number",
    btnSubmit: "Submit Admission Inquiry",
    btnProcessing: "Submitting...",
    securityTag: "Encrypted & Verified Institutional Submission",
    whyChooseTag: "INSTITUTIONAL ADVANTAGE",
    whyChooseTitle: "Why Choose Our School?",
    whyChooseDesc: "We provide an enriching scholastic ecosystem designed to cultivate deep analytical reasoning, athletic excellence, and moral integrity.",
    timelineTag: "REGISTRATION PROTOCOL",
    timelineTitle: "Admission Journey",
    faqTag: "ADMISSIONS FAQ",
    faqTitle: "Frequently Asked Questions",
    statsList: [
      { title: "2500+", label: "Enrolled Scholars" },
      { title: "150+", label: "Faculty Mentors" },
      { title: "98%", label: "Satisfaction Rate" }
    ],
    whyChooseList: [
      { title: "Expert Teachers", desc: "Qualified, seasoned CBSE academic mentors." },
      { title: "Smart Digital Classes", desc: "Interactive digital cognitive learning hub." },
      { title: "Safe Campus", desc: "24/7 CCTV surveillance and safety protocols." },
      { title: "Holistic Development", desc: "Character building, sports, and life skills." }
    ],
    timelineSteps: [
      { title: "Online Registration", desc: "Submit digital application form." },
      { title: "Document Verification", desc: "Submit academic transcripts & birth proof." },
      { title: "Campus Interaction", desc: "Friendly student & parent counseling." },
      { title: "Formal Admission", desc: "Fee deposit & student kit allocation." }
    ],
    faqList: [
      { q: "What is the minimum age criteria for Nursery admission?", a: "The child should be 3+ years of age as on 31st March of the academic admission session." },
      { q: "What documents are required during enrollment?", a: "Birth Certificate, previous class Transfer Certificate (TC) / Report Card, Aadhaar card copies, and passport size photographs." },
      { q: "Is GPS-monitored school bus transport available?", a: "Yes, dedicated school buses cover all major routes with trained staff and real-time security tracking." }
    ]
  },

  // ── 📜 11. CBSE MANDATORY DISCLOSURE (/cbse-mandatory) ──
  mandatoryDisclosure: {
    heroTag: "INSTITUTIONAL TRANSPARENCY",
    heroHeading: "CBSE Mandatory Public Disclosure",
    heroDescription: "In compliance with CBSE regulatory guidelines, our institution presents official governance certificates, safety audit reports, and infrastructure metrics.",
    heroTitle: "Mandatory Disclosure",
    heroDesc: "In compliance with CBSE Appendix IX, our institution presents its official regulatory framework, governance certificates, and pedagogical metrics.",
    docsTitle: "Governance Certificates",
    noDocs: "No Documents Disclosed Yet",
    resultTitle: "100% Academic Result Pedigree",
    resultDesc: "Our institution has maintained a consistent legacy of excellence in CBSE Board Examinations, securing zero-failure metrics for over a decade.",
    passRatio: "Pass Ratio",
    yearsLegacy: "Years Legacy",
    archiveLabel: "Official Digital Archive",
    downloadPdf: "Download PDF",
    confidentialTag: "Confidential Institutional Data",
    infrastructureTitle: "Facilities Infrastructure",
    infrastructureList: [
      { title: "Smart Classrooms", desc: "Equipped with interactive digital boards and visual aids for immersive learning." },
      { title: "Science Labs", desc: "Modern Physics, Chemistry, and Biology labs for practical experimentation." },
      { title: "Computer Hub", desc: "High-speed computing lab with latest software and internet connectivity." },
      { title: "Rich Library", desc: "Over 5000+ books, journals, and digital resources for academic research." }
    ]
  },

  // ── 👨‍🏫 12. TEACHERS DIRECTORY (/teachers) ──
  teachers: {
    heroTag: "EDUCATIONAL PILLARS & ARCHITECTS",
    heroTitle: "Faculty Architects",
    heroDesc: "Our seasoned CBSE educators cultivate critical reasoning, moral integrity, and conceptual mastery in every student.",
    sectionTitle: "Our Dedicated Educator Fraternity",
    statRecognised: "Recognised",
    statCommitment: "Commitment",
    statFaculty: "Faculty",
    statLegacy: "Legacy",
    statValRecognised: "State Department of Education",
    statValCommitment: "Academic Integrity",
    statValFaculty: "University Graduates",
    statValLegacy: "18+ Glorious Years"
  },

  // ── 🏛️ 13. MANAGEMENT CIRCLE (/management) ──
  management: {
    heroTag: "INSTITUTIONAL GOVERNANCE",
    heroTitle: "The Architects",
    heroDesc: "Meet the dedicated visionary leaders and educators shaping the future of our institution.",
    circleTitle: "Leadership Circle",
    facultyTitle: "Our Dedicated Faculty"
  },

  // ── 👤 14. STAFF DETAIL (/team/[id]) ──
  staffDetail: {
    notFoundTitle: "Profile Not Found",
    backBtnLabel: "Back to Team Hub",
    navLabel: "Institutional Hub",
    verifiedBadge: "CBSE Verified Faculty",
    officialRecordLabel: "Official Institutional Record",
    securityOverlayLabel: "Institutional Intelligence Overlay"
  },

  // ── 🔐 15. PORTAL LOGIN (/login) ──
  login: {
    portalName: "ACADEMIC PORTAL",
    journeyTitle: "Manage Your Scholarly Journey",
    journeyDesc: "Access attendance, marks, homework, fee receipts, and stay connected with campus life.",
    trustedBy: "Trusted by Scholars & Families",
    welcomeTitle: "Welcome Back",
    welcomeSub: "Please select your account type to login",
    labelId: "Access ID",
    placeholderStudentId: "Admission No.",
    placeholderEmployeeId: "Employee ID",
    labelPassword: "Password",
    labelForgot: "Forgot?",
    btnText: "LOGIN AS ",
    btnProcessing: "AUTHENTICATING...",
    troubleTag: "Having Technical Trouble?",
    btnContactAdmin: "Contact Admin",
    btnHelpdesk: "Helpdesk"
  },
  auth: {
    portalName: "ACADEMIC PORTAL",
    journeyTitle: "Manage Your Scholarly Journey",
    journeyDesc: "Access attendance, marks, homework, fee receipts, and stay connected with campus life.",
    trustedBy: "Trusted by Scholars & Families",
    welcomeTitle: "Welcome Back",
    welcomeSub: "Please select your account type to login",
    labelId: "Access ID",
    placeholderStudentId: "Admission No.",
    placeholderEmployeeId: "Employee ID",
    labelPassword: "Password",
    labelForgot: "Forgot?",
    btnText: "LOGIN AS ",
    btnProcessing: "AUTHENTICATING...",
    troubleTag: "Having Technical Trouble?",
    btnContactAdmin: "Contact Admin",
    btnHelpdesk: "Helpdesk"
  },

  // ── 👤 15. STAFF PROFILE (/team/[id]) ──
  staffDetail: {
    notFoundTitle: "Profile Not Found",
    backBtnLabel: "Return to Directory",
    navLabel: "ALL MEMBERS",
    verifiedBadge: "Verified Profile",
    officialRecordLabel: "Official School Record",
    securityOverlayLabel: "CONFIDENTIAL INSTITUTIONAL RECORD"
  }
};

/**
 * Computes live CBSE Academic Session (April - March cycle)
 * e.g., if today is August 2026 -> returns "2026-27"
 */
export const computeCurrentAcademicSession = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
  const endYearShort = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYearShort}`;
};

export const getSchoolAddress = (schoolInfo) => {
  return schoolInfo?.address || STRINGS.global.defaultAddress;
};

export const getSessionString = (schoolInfo) => {
  return (
    schoolInfo?.currentSession ||
    schoolInfo?.academicYear ||
    schoolInfo?.academic_session ||
    schoolInfo?.session ||
    computeCurrentAcademicSession()
  );
};

export const getSchoolName = (schoolInfo) => {
  return schoolInfo?.schoolName || schoolInfo?.name || STRINGS.global.defaultSchoolName;
};

export const getSchoolTagline = (schoolInfo) => {
  return schoolInfo?.navbar_config?.tagline || schoolInfo?.aboutTitle || schoolInfo?.tagline || STRINGS.global.defaultTagline;
};

export const getContactPhone = (schoolInfo) => {
  return schoolInfo?.contactPhone || schoolInfo?.phone || STRINGS.global.defaultPhone;
};

export const getContactEmail = (schoolInfo) => {
  return schoolInfo?.contactEmail || schoolInfo?.email || STRINGS.global.defaultEmail;
};

export const getAffiliationNo = (schoolInfo) => {
  return schoolInfo?.affiliationNo || schoolInfo?.affiliation_number || STRINGS.global.defaultAffiliationNo;
};

// Export SITE_CONFIG for backward compatibility
export const SITE_CONFIG = STRINGS;
