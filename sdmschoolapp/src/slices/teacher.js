import { APIService } from "../services/APIServices";
import { showToast } from "../utils/helper";

// --- 👨‍🏫 TEACHER HUB THUNKS ---

export const getClassRegistry = (className, sectionName, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getClassStudents(className, sectionName);
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback([]);
            }
        } catch (err) {
            console.error("Class Registry Error:", err);
            callback([]);
        }
    };
};

export const commitAttendance = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().markAttendance(payload);
            if (response?.status === 200 || response?.status === 201) {
                showToast({ type: 'success', message: 'Attendance committed successfully' });
                callback(response.data);
            } else {
                showToast({ type: 'error', message: response?.data?.error || 'Failed to commit attendance' });
                callback(null);
            }
        } catch (err) {
            console.error("Commit Attendance Error:", err);
            showToast({ type: 'error', message: 'Network or Server Failure' });
            callback(null);
        }
    };
};

// Upload Bulk Academic Marks
export const uploadBulkMarks = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().postBulkResults(payload);
            if (response?.status === 200) {
                showToast({ type: 'success', message: 'Marks uploaded successfully' });
                callback(response.data);
            }
        } catch (err) {
            showToast({ type: 'error', message: 'Failed to upload marks' });
            callback(null);
        }
    };
};

// Broadcast Institutional Notice
export const broadcastClassNotice = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().broadcastNotice(payload);
            if (response?.status === 200 || response?.status === 201) {
                showToast({ type: 'success', message: 'Notice broadcasted successfully' });
                callback(response.data);
            }
        } catch (err) {
            showToast({ type: 'error', message: 'Failed to broadcast notice' });
            callback(null);
        }
    };
};

// Fetch Institutional Notices
export const getInstitutionalNotices = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getNotices();
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Notices Fetch Error:", err);
            callback(null);
        }
    };
};

// Deploy Homework Assignment
export const deployHomework = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().postHomework(payload);
            if (response?.status === 200 || response?.status === 201) {
                showToast({ type: 'success', message: 'Assignment deployed successfully' });
                callback(response.data);
            }
        } catch (err) {
            showToast({ type: 'error', message: 'Failed to deploy assignment' });
            callback(null);
        }
    };
};

// Fetch Teacher's Homework Assignments
export const getTeacherHomeworks = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getTeacherHomework();
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback([]);
            }
        } catch (err) {
            console.error("Teacher Homework Fetch Error:", err);
            callback([]);
        }
    };
};

export const fetchHomeworkStats = (id, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getHomeworkStats(id);
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback([]);
            }
        } catch (err) {
            console.error("Homework Stats Fetch Error:", err);
            callback([]);
        }
    };
};

export const updateStudentHomeworkSubmission = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().updateStudentSubmissionStatus(payload);
            if (response?.status === 200 || response?.status === 201) {
                showToast({ type: 'success', message: 'Submission status updated successfully' });
                callback(response.data);
            } else {
                showToast({ type: 'error', message: response?.data?.error || 'Failed to update submission status' });
                callback(null);
            }
        } catch (err) {
            console.error("Submission Status Update Error:", err);
            showToast({ type: 'error', message: 'Failed to update submission status' });
            callback(null);
        }
    };
};

export const getClassAttendance = (className, date, sectionName, callback) => {
    let finalSection = sectionName;
    let finalCallback = callback;
    
    if (typeof sectionName === 'function') {
        finalCallback = sectionName;
        finalSection = undefined;
    }
    
    return async dispatch => {
        try {
            const response = await new APIService().getAttendance(className, date, finalSection);
            if (response?.status === 200) {
                if (typeof finalCallback === 'function') finalCallback(response.data);
            } else {
                if (typeof finalCallback === 'function') finalCallback([]);
            }
        } catch (err) {
            console.error("Attendance Fetch Error:", err);
            if (typeof finalCallback === 'function') finalCallback([]);
        }
    };
};

// Fetch Scholar Grievances/Queries
export const getStudentQueries = (className, section, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getGrievances(className, section);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Queries Fetch Error:", err);
            callback(null);
        }
    };
};

// Reply to Scholar Grievance
export const respondToQuery = (id, payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().putGrievanceReply(id, payload);
            if (response?.status === 200) {
                showToast({ type: 'success', message: 'Response committed successfully' });
                callback(response.data);
            }
        } catch (err) {
            showToast({ type: 'error', message: 'Failed to commit response' });
            callback(null);
        }
    };
};

// Submit Leave Petition
export const requestLeave = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().postLeaveRequest(payload);
            if (response?.status === 200 || response?.status === 201) {
                showToast({ type: 'success', message: 'Leave petition submitted' });
                callback(response.data);
            }
        } catch (err) {
            showToast({ type: 'error', message: 'Failed to submit petition' });
            callback(null);
        }
    };
};

// Get Personal Leave History
export const fetchMyLeaves = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getMyLeaveRequests();
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Leave History Error:", err);
            callback(null);
        }
    };
};

// Get Personal Attendance Log
export const fetchMyAttendance = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getMyAttendance();
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Attendance History Error:", err);
            callback(null);
        }
    };
};

// Post Personal Attendance
export const submitSelfAttendance = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().postSelfAttendance(payload);
            if (response?.status === 200 || response?.status === 201) {
                callback(response.data);
            } else {
                callback(null, 'Failed to log attendance');
            }
        } catch (err) {
            console.error("Submit Self Attendance Error:", err);
            callback(null, err?.response?.data?.error || 'Network or Server Failure');
        }
    };
};

export const getStaffTimetable = (id, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getTimetable(id);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Timetable Fetch Error:", err);
            callback(null);
        }
    };
};

export const getSubstitutions = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getMySubstitutions();
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Substitutions Fetch Error:", err);
            callback(null);
        }
    };
};

export const fetchExamsList = (className, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getExamsList(className);
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback([]);
            }
        } catch (err) {
            console.error("fetchExamsList Error:", err);
            callback([]);
        }
    };
};

export const createExam = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().createExam(payload);
            if (response?.status === 200 || response?.status === 201) {
                showToast({ type: 'success', message: 'Exam created successfully' });
                callback(response.data);
            } else {
                showToast({ type: 'error', message: 'Failed to create exam' });
                callback(null);
            }
        } catch (err) {
            console.error("createExam Error:", err);
            showToast({ type: 'error', message: 'Failed to create exam' });
            callback(null);
        }
    };
};

export const fetchAdminStudents = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getAdminStudents();
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback([]);
            }
        } catch (err) {
            console.error("fetchAdminStudents Error:", err);
            callback([]);
        }
    };
};

export const fetchStudentDashboardDetails = (studentId, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getStudentDashboardDetails(studentId);
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback(null);
            }
        } catch (err) {
            console.error("fetchStudentDashboardDetails Error:", err);
            callback(null);
        }
    };
};


// Fetch Admin School-wide Dashboard Summary
export const getAdminDashboardStats = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getAdminDashboardSummary();
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback(null);
            }
        } catch (err) {
            console.error("Admin Dashboard Fetch Error:", err);
            callback(null);
        }
    };
};

// Fetch All Student Queries for Admin
export const getAllStudentQueries = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getAllGrievances();
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("All Queries Fetch Error:", err);
            callback(null);
        }
    };
};

export const reorderRolls = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().reorderRolls();
            if (response?.status === 200) {
                callback(response.data);
            } else {
                callback(null);
            }
        } catch (err) {
            console.error("Reorder Error:", err);
            callback(null);
        }
    };
};
