import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, CreditCard, BookOpen, ShieldCheck, MapPin, Phone, MessageSquare, Save, Download } from 'lucide-react-native';
import CustomCalendar from '../../../../components/CustomCalendar';
import { COLORS, getResolvedUrl, fontFamily, STRINGS } from '../../../../utils';
import Skeleton from '../../../../components/common/Skeleton';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentDashboardDetails, fetchExamsList, uploadBulkMarks } from '../../../../slices/teacher';
import { StatusModal } from '../../../../components/common/StatusModal';
import { CustomButton } from '../../../../components/CustomButton';

const LegendItem = ({ color, label }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontSize: 8, fontFamily: fontFamily.Poppins.Black, color: COLORS.gray, letterSpacing: 0.5 }}>{label}</Text>
    </View>
);

const StudentProfile = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { studentId } = route.params;
    const { primaryColor } = useSelector(state => state.config);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState('ACADEMIC');
    const [selectedExam, setSelectedExam] = useState('');
    const [allExams, setAllExams] = useState([]);
    const [subjectScores, setSubjectScores] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'success', title: '', message: '', onConfirm: null });

    // SAFE DATE INITIALIZATION
    const todayStr = new Date().toISOString().split('T')[0];
    const [currentMonth, setCurrentMonth] = useState(todayStr.substring(0, 7)); // YYYY-MM

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(false);
            dispatch(fetchStudentDashboardDetails(studentId, (resData) => {
                if (resData) {
                    setData(resData);
                    dispatch(fetchExamsList(resData.student?.class || '10TH', (exams) => {
                        if (exams) {
                            setAllExams(exams);
                            if (exams.length > 0 && !selectedExam) setSelectedExam(exams[0].title);
                        }
                        setLoading(false);
                    }));
                } else {
                    setError(true);
                    setLoading(false);
                }
            }));
        } catch (err) {
            console.error('PROFILE_FETCH_FAILED:', err);
            setError(true);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Wrapper noTopInset={true} showHeader={false} noBottomPadding={true} parentStyle={{ backgroundColor: '#F8FAFC' }}>
                <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never">
                    
                    {/* Header Shimmer */}
                    <LinearGradient colors={[primaryColor || COLORS.primary, (primaryColor || COLORS.primary) + 'cc']} style={styles.header}>
                        <View style={styles.headerTop}>
                            <View style={styles.backButton}>
                                <ChevronLeft size={24} color={COLORS.white} />
                            </View>
                            <View style={styles.headerActions}>
                                <View style={styles.actionCircle}>
                                    <Phone size={18} color={COLORS.white} />
                                </View>
                                <View style={styles.actionCircle}>
                                    <MessageSquare size={18} color={COLORS.white} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.headerProfile}>
                            <View style={[styles.imageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                                <Skeleton width={88} height={88} borderRadius={44} />
                            </View>
                            <Skeleton width={180} height={22} borderRadius={4} style={{ marginBottom: 8 }} />
                            <Skeleton width={100} height={12} borderRadius={4} style={{ marginBottom: 16 }} />
                            <View style={styles.badgeRow}>
                                <Skeleton width={80} height={20} borderRadius={8} />
                            </View>
                        </View>
                    </LinearGradient>

                    {/* KPI Cards Row Shimmer */}
                    <View style={styles.kpiRow}>
                        {[1, 2, 3].map(i => (
                            <View key={i} style={styles.kpiItem}>
                                <Skeleton width={60} height={8} borderRadius={4} style={{ marginBottom: 6 }} />
                                <Skeleton width={50} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                                <Skeleton width={40} height={8} borderRadius={4} />
                            </View>
                        ))}
                    </View>

                    {/* Tab Navigation Shimmer */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                        contentContainerStyle={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, gap: 8 }}
                    >
                        {[1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={[styles.tabButton, { backgroundColor: '#F1F5F9', width: 90 }]}>
                                <Skeleton width={65} height={12} borderRadius={4} />
                            </View>
                        ))}
                    </ScrollView>

                    {/* Tab Content Shimmer */}
                    <View style={styles.tabContent}>
                        <View style={styles.sectionCard}>
                            <Skeleton width={150} height={18} borderRadius={4} style={{ marginBottom: 20 }} />
                            {[1, 2, 3].map(i => (
                                <View key={i} style={styles.subjectRow}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ gap: 6, flex: 1 }}>
                                            <Skeleton width={120} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                                            <Skeleton width={60} height={10} borderRadius={4} />
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <Skeleton width={100} height={48} borderRadius={14} />
                                            <Skeleton width={72} height={48} borderRadius={14} />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </Wrapper>
        );
    }

    if (error || !data) {
        return (
            <View style={styles.loadingContainer}>
                <ShieldCheck size={48} color={COLORS.red} />
                <Text style={[styles.loadingText, { color: COLORS.red }]}>CONNECTION TERMINATED</Text>
                <TouchableOpacity onPress={fetchProfile} style={{ marginTop: 20, padding: 12, backgroundColor: COLORS.primary, borderRadius: 12 }}>
                    <Text style={{ color: COLORS.white, fontFamily: fontFamily.Poppins.Black, fontSize: 10 }}>RETRY CONNECTION</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { student = {}, finance = { summary: {}, history: [] }, academic = [], attendance = [], homework = [] } = data;

    // SAFE FILTERING LOGIC
    const filteredAttendance = (attendance || []).filter(a => {
        if (!a.date) return false;
        try {
            const dateStr = new Date(a.date).toISOString().split('T')[0];
            return dateStr.startsWith(currentMonth);
        } catch (e) {
            return false;
        }
    });

    const monthlyPresents = filteredAttendance.filter(a => a.status === 'PRESENT').length;
    const monthlyAbsents = filteredAttendance.filter(a => a.status === 'ABSENT').length;

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

    const renderTabContent = () => {
        switch (activeTab) {
            case 'ACADEMIC':
                const EXAMS_LIST = allExams.map(e => e.title);
                
                if (EXAMS_LIST.length > 0 && !EXAMS_LIST.includes(selectedExam)) {
                    setSelectedExam(EXAMS_LIST[0]);
                }

                const selectedExamObj = allExams.find(e => e.title === selectedExam) || {};
                const uniqueSubjects = Array.isArray(selectedExamObj.subjects) ? selectedExamObj.subjects : [];

                const handleScoreChange = (subjectName, val, maxMarks) => {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    const currentMax = parseInt(maxMarks, 10) || 100;
                    
                    if (cleanVal && parseInt(cleanVal, 10) > currentMax) {
                        setStatusModal({
                            visible: true,
                            type: 'error',
                            title: 'MAX LIMIT EXCEEDED',
                            message: `Score cannot exceed ${currentMax} for ${subjectName}.`
                        });
                        return;
                    }
                    setSubjectScores(prev => ({
                        ...prev,
                        [subjectName]: cleanVal
                    }));
                };

                const handleSaveMarks = () => {
                    const results = [];
                    let hasChanges = false;
                    
                    uniqueSubjects.forEach(sub => {
                        const subjectName = sub.name;
                        const maxMarks = parseInt(sub.maxMarks, 10) || 100;
                        const record = (academic || []).find(r =>
                            r.subject.toLowerCase() === subjectName.toLowerCase() &&
                            String(r.examType).toLowerCase() === String(selectedExam).toLowerCase()
                        );
                        
                        let finalScore = subjectScores[subjectName] !== undefined ? subjectScores[subjectName] : (record ? record.marks : '');
                        if (finalScore !== '') {
                            hasChanges = true;
                            results.push({
                                studentId: student.id,
                                subject: subjectName,
                                score: parseInt(finalScore, 10) || 0,
                                outOf: maxMarks,
                                examType: selectedExam,
                                class: student.class || '10TH',
                                section: student.section || 'A'
                            });
                        }
                    });

                    if (!hasChanges || results.length === 0) {
                        setStatusModal({
                            visible: true,
                            type: 'error',
                            title: 'NO SCORES ENTERED',
                            message: "Please enter a score for at least one subject before committing."
                        });
                        return;
                    }

                    setIsSubmitting(true);
                    dispatch(uploadBulkMarks({ results }, (res) => {
                        setIsSubmitting(false);
                        if (res) {
                            setStatusModal({
                                visible: true,
                                type: 'success',
                                title: 'SUCCESS',
                                message: `Marks updated successfully for ${selectedExam}.`,
                                onConfirm: fetchProfile
                            });
                        }
                    }));
                };

                const getPercentagePillStyle = (val) => {
                    const score = parseInt(val, 10);
                    if (val === null || val === undefined || isNaN(score)) {
                        return {
                            bg: '#F1F5F9', // soft gray
                            text: '#94A3B8',
                            label: '--%'
                        };
                    }
                    if (score >= 90) {
                        return {
                            bg: '#D1FAE5', // beautiful green
                            text: '#065F46',
                            label: `${score}%`
                        };
                    }
                    return {
                        bg: '#DBEAFE', // beautiful blue
                        text: '#1E40AF',
                        label: `${score}%`
                    };
                };

                return (
                    <View style={styles.tabContent}>
                        {EXAMS_LIST.length > 0 ? (
                            <>
                                {/* 1. SELECT EXAM SECTION */}
                                <Text style={styles.examLabel}>Select Exam</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.examCapsuleScroll}
                                    contentContainerStyle={styles.examCapsuleScrollContent}
                                >
                                    {EXAMS_LIST.map((exam) => {
                                        const isActive = selectedExam === exam;
                                        return (
                                            <TouchableOpacity
                                                key={exam}
                                                style={styles.examCapsuleWrapper}
                                                onPress={() => setSelectedExam(exam)}
                                                activeOpacity={0.8}
                                            >
                                                {isActive ? (
                                                    <View
                                                        style={[styles.examCapsuleActive, { backgroundColor: primaryColor }]}
                                                    >
                                                        <Text style={styles.examCapsuleTextActive}>
                                                            {exam}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.examCapsuleInactive}>
                                                        <Text style={styles.examCapsuleTextInactive}>
                                                            {exam}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                {/* 2. SUBJECT MARKS CARD */}
                                <View style={styles.sectionCard}>
                                    <Text style={styles.enterMarksTitle}>Academic Performance</Text>
                                    {uniqueSubjects.length > 0 ? uniqueSubjects.map((subjectObj, idx) => {
                                        const subjectName = subjectObj.name;
                                        const maxMarks = subjectObj.maxMarks || '100';
                                        
                                        const record = (academic || []).find(r =>
                                            r.subject.toLowerCase() === subjectName.toLowerCase() &&
                                            String(r.examType).toLowerCase() === String(selectedExam).toLowerCase()
                                        );

                                        let displayValue = subjectScores[subjectName] !== undefined ? subjectScores[subjectName] : (record ? `${record.marks}` : '');
                                        
                                        const percentage = displayValue !== '' ? Math.round((parseInt(displayValue, 10) / parseInt(maxMarks, 10)) * 100) : null;
                                        const badgeDetails = getPercentagePillStyle(percentage);

                                        return (
                                            <View key={idx} style={styles.subjectRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.subjectLabel}>{subjectName}</Text>
                                                    <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray }}>Out of: {maxMarks}</Text>
                                                </View>
                                                <View style={styles.inputPillContainer}>
                                                    <TextInput
                                                        style={styles.marksTextInput}
                                                        keyboardType="numeric"
                                                        maxLength={3}
                                                        placeholder="00"
                                                        placeholderTextColor="#94A3B8"
                                                        value={displayValue}
                                                        onChangeText={(val) => handleScoreChange(subjectName, val, maxMarks)}
                                                    />
                                                    <View style={[styles.percentageBadge, { backgroundColor: badgeDetails.bg }]}>
                                                        <Text style={[styles.percentageBadgeText, { color: badgeDetails.text }]}>
                                                            {badgeDetails.label}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    }) : (
                                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, textAlign: 'center', marginTop: 10 }}>No subjects configured for this exam.</Text>
                                    )}
                                </View>

                                {/* 3. SAVE MARKS BUTTON */}
                                <CustomButton
                                    title="SAVE MARKS"
                                    onPress={handleSaveMarks}
                                    icon={Save}
                                    variant="commit"
                                    style={{ marginTop: 10, marginBottom: 20 }}
                                    loading={isSubmitting}
                                    colors={[primaryColor || COLORS.primary, primaryColor || COLORS.primary]}
                                />
                                
                                {/* 4. DOWNLOAD REPORT CARD BUTTON */}
                                <TouchableOpacity style={styles.downloadReportBtn} onPress={() => {}}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Download size={16} color={COLORS.secondary} />
                                        <Text style={styles.downloadReportText}>DOWNLOAD REPORT CARD</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.sectionCard}>
                                <Text style={{ fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, textAlign: 'center', padding: 20 }}>No exams found for this class. Please create one in Exam Registry.</Text>
                            </View>
                        )}
                    </View>
                );
            case 'FINANCE':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.financeSummary}>
                            <View style={styles.financeItem}>
                                <Text style={styles.financeLabel}>DUE AMOUNT</Text>
                                <Text style={[styles.financeValue, { color: COLORS.red }]}>₹{finance.summary?.dueAmount || 0}</Text>
                            </View>
                            <View style={styles.financeDivider} />
                            <View style={styles.financeItem}>
                                <Text style={styles.financeLabel}>FEE STATUS</Text>
                                <Text style={[styles.financeValue, { color: student.feesStatus === 'PAID' ? COLORS.green : COLORS.red }]}>{student.feesStatus || 'PENDING'}</Text>
                            </View>
                        </View>
                        {finance.history.map((p, i) => (
                            <View key={i} style={styles.paymentCard}>
                                <View>
                                    <Text style={styles.paymentMonth}>{p.month}</Text>
                                    <Text style={styles.paymentDate}>{new Date(p.paymentDate).toLocaleDateString('en-GB')}</Text>
                                </View>
                                <Text style={styles.paymentAmount}>+₹{p.amountPaid}</Text>
                            </View>
                        ))}
                    </View>
                );
            case 'ATTENDANCE':
                const markedDates = {};
                (attendance || []).forEach(a => {
                    if (!a.date) return;
                    try {
                        const dateStr = new Date(a.date).toISOString().split('T')[0];
                        let color = '#059669'; // ROYAL GREEN
                        if (a.status === 'ABSENT') color = COLORS.red;
                        if (a.status === 'LEAVE') color = COLORS.orange || '#F59E0B';

                        markedDates[dateStr] = {
                            marked: true,
                            dotColor: color,
                            customStyles: {
                                container: { backgroundColor: color + '15', borderRadius: 8 },
                                text: { color: color, fontWeight: 'bold' }
                            }
                        };
                    } catch (e) { }
                });

                const monthName = new Date(currentMonth + '-02').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();

                return (
                    <View style={styles.tabContent}>
                        <View style={styles.monthlySummary}>
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryValue}>{monthlyPresents}</Text>
                                <Text style={styles.summaryLabel}>PRESENTS IN {monthName}</Text>
                            </View>
                            <View style={[styles.summaryBox, { borderLeftWidth: 1, borderColor: '#E2E8F0' }]}>
                                <Text style={[styles.summaryValue, { color: COLORS.red }]}>{monthlyAbsents}</Text>
                                <Text style={styles.summaryLabel}>ABSENTS IN {monthName}</Text>
                            </View>
                        </View>

                        <View style={[styles.calendarContainer, { padding: 0, margin: 0, borderWidth: 0 }]}>
                            <CustomCalendar
                                hideLegend={true}
                                minDate={'2026-03-01'} // SESSION START (MARCH)
                                maxDate={new Date().toISOString().split('T')[0]} // TODAY (PREVENTS NEXT SESSION)
                                onMonthChange={(month) => {
                                    setCurrentMonth(month.dateString.substring(0, 7));
                                }}
                                theme={{
                                    calendarBackground: 'transparent',
                                    textDisabledColor: '#E2E8F0',
                                    dotColor: '#059669',
                                    monthTextColor: COLORS.secondary,
                                }}
                                markingType={'custom'}
                                markedDates={markedDates}
                            />
                        </View>

                        <View style={styles.legendRow}>
                            <LegendItem color={'#065F46'} label="PRESENT" />
                            <LegendItem color={COLORS.red} label="ABSENT" />
                            <LegendItem color={COLORS.orange || '#F59E0B'} label="LEAVE" />
                        </View>
                    </View>
                );
            case 'HOMEWORK':
                return (
                    <View style={styles.tabContent}>
                        {homework.length > 0 ? homework.map((h, i) => {
                            let badgeColor = COLORS.red;
                            let statusText = 'PENDING';
                            if (h.submissionStatus === 'COMPLETED') {
                                badgeColor = '#059669'; // ROYAL GREEN
                                statusText = 'VERIFIED';
                            } else if (h.submissionStatus === 'PENDING_REVIEW') {
                                badgeColor = COLORS.orange || '#F59E0B';
                                statusText = 'PENDING REVIEW';
                            }
                            return (
                                <View key={i} style={styles.markCard}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.markSubject}>{h.subject}</Text>
                                        <Text style={styles.markExam}>{h.title}</Text>
                                        <Text style={{ fontSize: 9, color: COLORS.gray, fontFamily: fontFamily.Poppins.Medium, marginTop: 4 }}>
                                            Assigned: {h.date ? new Date(h.date).toLocaleDateString('en-GB') : '---'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: badgeColor + '15', borderWidth: 1, borderColor: badgeColor, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={[styles.statusBadgeText, { color: badgeColor, fontSize: 8, fontFamily: fontFamily.Poppins.Bold }]}>
                                            {statusText}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }) : (
                            <View style={styles.emptyState}>
                                <BookOpen size={48} color={COLORS.gray + '30'} />
                                <Text style={styles.emptyText}>NO HOMEWORK RECORDS FOUND</Text>
                            </View>
                        )}
                    </View>
                );
            case 'BIO':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.bioCard}>
                            <InfoItem icon={User} label="FATHER NAME" value={student.fatherName} />
                            <InfoItem icon={User} label="MOTHER NAME" value={student.motherName} />
                            <InfoItem icon={Phone} label="CONTACT" value={student.phone} />
                            <InfoItem icon={MapPin} label="ADDRESS" value={student.address} />
                            <InfoItem icon={CalendarIcon} label="D.O.B" value={student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : '---'} />
                            <InfoItem icon={ShieldCheck} label="AADHAR NUMBER" value={student.aadharNo || '---'} />
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Wrapper noTopInset={true} showHeader={false} noBottomPadding={true} parentStyle={{ backgroundColor: '#F8FAFC' }}>
                <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never">

                    <LinearGradient colors={[primaryColor, primaryColor + 'cc']} style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <ChevronLeft size={24} color={COLORS.white} />
                            </TouchableOpacity>
                            <View style={styles.headerActions}>
                                <TouchableOpacity style={styles.actionCircle}>
                                    <Phone size={18} color={COLORS.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionCircle}>
                                    <MessageSquare size={18} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.headerProfile}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: getResolvedUrl(student.image) }} style={styles.profileImage} />
                            </View>
                            <Text style={styles.studentName}>{student.name}</Text>
                            <Text style={styles.studentId}>ADM# {student.admissionNo}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.classBadge}>
                                    <Text style={styles.classBadgeText}>{student.class} - {student.section}</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.kpiRow}>
                        <KPIItem label="ATTENDANCE" value={`${attendancePercent}%`} sub="INDEX" />
                        <KPIItem label="DUE" value={`₹${finance.summary?.dueAmount || 0}`} sub="OWED" />
                        <KPIItem label="GPA" value="8.4" sub="MARKS" />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
                        contentContainerStyle={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, gap: 8 }}
                    >
                        <TabButton label="ACADEMIC" active={activeTab === 'ACADEMIC'} onPress={() => setActiveTab('ACADEMIC')} icon={BookOpen} />
                        <TabButton label="ATTENDANCE" active={activeTab === 'ATTENDANCE'} onPress={() => setActiveTab('ATTENDANCE')} icon={CalendarIcon} />
                        <TabButton label="HOMEWORK" active={activeTab === 'HOMEWORK'} onPress={() => setActiveTab('HOMEWORK')} icon={BookOpen} />
                        <TabButton label="FINANCE" active={activeTab === 'FINANCE'} onPress={() => setActiveTab('FINANCE')} icon={CreditCard} />
                        <TabButton label="BIO" active={activeTab === 'BIO'} onPress={() => setActiveTab('BIO')} icon={User} />
                    </ScrollView>

                    {renderTabContent()}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </Wrapper>

            <StatusModal
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => setStatusModal({ ...statusModal, visible: false })}
                onConfirm={() => {
                    setStatusModal({ ...statusModal, visible: false });
                    if (statusModal.onConfirm) statusModal.onConfirm();
                }}
            />
        </>
    );
};

const KPIItem = ({ label, value, sub }) => {
    const { primaryColor } = useSelector(state => state.config);
    return (
        <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
            <Text style={[styles.kpiSub, { color: primaryColor }]}>{sub}</Text>
        </View>
    );
};

const TabButton = ({ label, active, onPress, icon: Icon }) => {
    const { primaryColor } = useSelector(state => state.config);
    return (
        <TouchableOpacity
            style={[styles.tabButton, active && { backgroundColor: primaryColor + '15' }]}
            onPress={onPress}
        >
            <Icon size={14} color={active ? primaryColor : COLORS.secondary} />
            <Text style={[styles.tabLabel, active && { color: primaryColor, opacity: 1 }]}>{label}</Text>
        </TouchableOpacity>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => {
    const { primaryColor } = useSelector(state => state.config);
    return (
        <View style={styles.infoItem}>
            <View style={styles.infoIconBox}>
                <Icon size={16} color={primaryColor || COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '---'}</Text>
            </View>
        </View>
    );
};

export default StudentProfile;
