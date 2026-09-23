import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Save, ChevronDown, Check } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, fontFamily, getResolvedUrl, STRINGS } from '../../../../utils';
import Skeleton from '../../../../components/common/Skeleton';
import { Wrapper } from '../../../../components/Wrapper';
import { CustomButton } from '../../../../components/CustomButton';
import { StatusModal } from '../../../../components/common/StatusModal';
import { getClassRegistry, uploadBulkMarks } from '../../../../slices/teacher';
import { getAcademicResults } from '../../../../slices/student';
import { StyleSheet } from 'react-native';

const AddMarks = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    // 🎓 Students & Selection State
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🎨 Dynamic Colors
    const { primaryColor: rPrimary, secondaryColor: rSecondary } = useSelector(state => state.config);
    const primaryColor = rPrimary || COLORS.primary;
    const secondaryColor = rSecondary || COLORS.secondary;

    const preSelectedStudentId = route?.params?.studentId;
    const testInfo = route?.params?.test || {};
    const selectedExam = testInfo.title || 'Selected Assessment';

    // Convert subjects JSON into array if it's stringified
    const subjectsList = useMemo(() => Array.isArray(testInfo.subjects) ? testInfo.subjects : [], [testInfo.subjects]);

    const [subjectScores, setSubjectScores] = useState({});
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'success', title: '', message: '', onConfirm: null });

    // 📡 Fetch Class Registry (Students)
    useEffect(() => {
        setIsLoading(true);
        const targetClass = user?.class || '10TH';
        const targetSection = user?.section || 'A';
        dispatch(getClassRegistry(targetClass, targetSection, (data) => {
            if (data && Array.isArray(data)) {
                const mapped = data.map(s => ({
                    id: s.id || s._id,
                    name: s.name,
                    roll: s.admissionNo || s.rollNo,
                    image: s.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.name,
                    class: `${s.class || '10TH'}-${s.section || 'A'}`
                }));
                setStudents(mapped);
                if (mapped.length > 0) {
                    const found = preSelectedStudentId ? mapped.find(s => String(s.id) === String(preSelectedStudentId)) : null;
                    setSelectedStudent(found || mapped[0]);
                }
            }
            setIsLoading(false);
        }));
    }, [user?.class, user?.section, dispatch, preSelectedStudentId]);

    // 📡 Fetch Existing Scores for Selected Student
    const studentId = selectedStudent?.id;
    useEffect(() => {
        if (studentId) {
            dispatch(getAcademicResults(studentId, (records) => {
                if (records && Array.isArray(records)) {
                    const fetchedScores = {};

                    // Filter records for the currently selected exam type
                    const examRecords = records.filter(r =>
                        String(r.examType).toLowerCase() === String(selectedExam).toLowerCase()
                    );

                    examRecords.forEach(r => {
                        if (r.subject) {
                            fetchedScores[r.subject] = String(r.marks !== undefined ? r.marks : (r.score !== undefined ? r.score : ''));
                        }
                    });

                    setSubjectScores(prevScores => {
                        const newScores = {};
                        subjectsList.forEach(sub => {
                            if (fetchedScores[sub.name] !== undefined) {
                                newScores[sub.name] = fetchedScores[sub.name];
                            } else {
                                newScores[sub.name] = ''; // Reset to empty if no record exists for this student
                            }
                        });
                        return newScores;
                    });
                }
            }));
        }
    }, [studentId, selectedExam, dispatch, subjectsList]);

    const handleScoreChange = (subjectName, val) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        const subjectObj = subjectsList.find(s => s.name === subjectName);
        const currentMax = parseInt(subjectObj?.maxMarks, 10) || 100;

        if (cleanVal && parseInt(cleanVal, 10) > currentMax) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'MAX LIMIT EXCEEDED',
                message: `Entered score cannot exceed ${currentMax} for ${subjectName}.`
            });
            return;
        }
        setSubjectScores(prev => ({
            ...prev,
            [subjectName]: cleanVal
        }));
    };

    const handleCommit = async () => {
        if (!selectedStudent) return;
        if (isSubmitting) return;

        // Ensure at least one subject score is entered
        const scoresEntered = Object.values(subjectScores).some(val => val !== '');
        if (!scoresEntered) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'NO SCORES ENTERED',
                message: "Please enter a score for at least one subject before committing."
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const results = Object.keys(subjectScores)
                .filter(subjectName => subjectScores[subjectName] !== '')
                .map(subjectName => {
                    const subjectObj = subjectsList.find(s => s.name === subjectName);
                    return {
                        studentId: selectedStudent.id,
                        subject: subjectName,
                        score: parseInt(subjectScores[subjectName], 10) || 0,
                        outOf: parseInt(subjectObj?.maxMarks, 10) || 100,
                        examType: selectedExam,
                        class: user?.class || '10TH',
                        section: user?.section || 'A'
                    };
                });

            dispatch(uploadBulkMarks({ results }, (res) => {
                setIsSubmitting(false);
                if (res) {
                    setStatusModal({
                        visible: true,
                        type: 'success',
                        title: 'REGISTRY UPDATED',
                        message: `Scores for ${selectedStudent.name} have been committed successfully.`,
                        onConfirm: () => navigation.goBack()
                    });
                } else {
                    setStatusModal({
                        visible: true,
                        type: 'error',
                        title: 'COMMITMENT FAILED',
                        message: 'The institutional vault rejected the scores. Please verify connectivity.'
                    });
                }
            }));
        } catch (e) {
            setIsSubmitting(false);
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'SUBSYSTEM FAILURE',
                message: "An unexpected error occurred during score commitment."
            });
            console.log("⚓ Result Commitment Failure:", e);
        }
    };

    const getPercentagePillStyle = (val, maxMarks) => {
        const score = parseInt(val, 10) || 0;
        const currentMax = parseInt(maxMarks, 10) || 100;

        if (val === '') {
            return {
                bg: '#F1F5F9',
                text: '#94A3B8',
                label: '--%'
            };
        }

        const percentage = Math.round((score / currentMax) * 100);

        if (percentage >= 90) {
            return {
                bg: '#D1FAE5', // beautiful soft green
                text: '#065F46', // beautiful deep green
                label: `${percentage}%`
            };
        }
        // default high or normal
        return {
            bg: '#DBEAFE', // beautiful soft blue
            text: '#1E40AF', // beautiful deep blue
            label: `${percentage}%`
        };
    };

    return (
        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            headerProps={{
                title: STRINGS.scoreAllocation || 'ACADEMIC REGISTRY',
                showBack: true,
                paddingBottom: 25
            }}
        >
            {isLoading ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={localStyles.scrollViewStyle}
                    contentContainerStyle={localStyles.scrollContainer}
                >
                    {/* Card 1: Select Student Card Skeleton */}
                    <View style={localStyles.sectionCardFirst}>
                        <View style={{ marginBottom: 12 }}>
                            <Skeleton width={100} height={12} borderRadius={4} />
                        </View>
                        <Skeleton width="100%" height={48} borderRadius={14} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#DBEAFE', gap: 14, marginTop: 16 }}>
                            <Skeleton width={48} height={48} borderRadius={24} />
                            <View style={{ gap: 8, flex: 1 }}>
                                <Skeleton width={120} height={16} borderRadius={4} />
                                <Skeleton width={80} height={12} borderRadius={4} />
                            </View>
                        </View>
                    </View>

                    {/* Card 2: Subjects Inputs Card Skeleton */}
                    <View style={localStyles.sectionCard}>
                        <Skeleton width={150} height={18} borderRadius={4} style={{ marginBottom: 20 }} />
                        {[1, 2, 3].map(i => (
                            <View key={i} style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
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
                </ScrollView>
            ) : (
                <View style={localStyles.mainViewContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={localStyles.scrollViewStyle}
                        contentContainerStyle={localStyles.scrollContainer}
                    >

                        {/* 1. SELECT STUDENT CARD */}
                        <View style={localStyles.sectionCardFirst}>
                            <Text style={localStyles.cardLabel}>{STRINGS.selectStudent}</Text>
                            <TouchableOpacity
                                style={localStyles.dropdownTrigger}
                                onPress={() => setShowStudentDropdown(!showStudentDropdown)}
                                activeOpacity={0.7}
                            >
                                <Text style={localStyles.dropdownTriggerText}>
                                    {selectedStudent ? `${selectedStudent.name} - Roll No: ${selectedStudent.roll}` : STRINGS.selectStudent}
                                </Text>
                                <ChevronDown size={20} color={COLORS.gray} />
                            </TouchableOpacity>

                            {/* DROPDOWN EXPANDABLE LIST */}
                            {showStudentDropdown && (
                                <View style={localStyles.dropdownListContainer}>
                                    <ScrollView nestedScrollEnabled={true} style={localStyles.dropdownScrollView}>
                                        {students.map((item) => {
                                            const isSelected = selectedStudent?.id === item.id;
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[
                                                        localStyles.dropdownItem,
                                                        isSelected && localStyles.dropdownItemActive
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedStudent(item);
                                                        setShowStudentDropdown(false);
                                                    }}
                                                >
                                                    <Text style={[
                                                        localStyles.dropdownItemText,
                                                        isSelected && { fontFamily: fontFamily.Poppins.Bold, color: primaryColor }
                                                    ]}>
                                                        {item.name} - Roll No: {item.roll}
                                                    </Text>
                                                    {isSelected && (
                                                        <Check size={16} color={primaryColor} />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}

                            {/* STUDENT DETAIL DISPLAY CARD */}
                            {selectedStudent && (
                                <View style={localStyles.studentDetailCard}>
                                    <Image source={{ uri: getResolvedUrl(selectedStudent.image) }} style={localStyles.studentAvatar} />
                                    <View style={localStyles.studentInfoContainer}>
                                        <Text style={localStyles.studentNameText}>{selectedStudent.name}</Text>
                                        <Text style={localStyles.studentClassText}>Class {selectedStudent.class}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* 2. ENTER MARKS CARD */}
                        <View style={localStyles.sectionCard}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text style={[localStyles.enterMarksTitle, { marginBottom: 0 }]}>{selectedExam} - {STRINGS.enterMarks}</Text>
                            </View>
                            {subjectsList.length === 0 && (
                                <Text style={{ fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, textTransform: 'uppercase', textAlign: 'center', marginTop: 10 }}>{STRINGS.noSubjectsFound}</Text>
                            )}
                            {subjectsList.map((subjectObj) => {
                                const subjectName = subjectObj.name;
                                const maxMarks = subjectObj.maxMarks;
                                const scoreValue = subjectScores[subjectName];
                                const badgeDetails = getPercentagePillStyle(scoreValue, maxMarks);

                                return (
                                    <View key={subjectName} style={localStyles.subjectRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={localStyles.subjectLabel}>{subjectName}</Text>
                                            <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Medium, color: '#64748B' }}>{STRINGS.outOfLabel}: {maxMarks}</Text>
                                        </View>
                                        <View style={localStyles.inputPillContainer}>
                                            <TextInput
                                                style={localStyles.marksTextInput}
                                                keyboardType="numeric"
                                                maxLength={3}
                                                placeholder="00"
                                                placeholderTextColor="#94A3B8"
                                                value={scoreValue}
                                                onChangeText={(val) => handleScoreChange(subjectName, val)}
                                            />
                                            <View style={[localStyles.percentageBadge, { backgroundColor: badgeDetails.bg }]}>
                                                <Text style={[localStyles.percentageBadgeText, { color: badgeDetails.text }]}>
                                                    {badgeDetails.label}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <View style={localStyles.spacer} />
                    </ScrollView>

                    {/* 🚀 COMMIT ACTION */ }
    <View style={localStyles.footerContainer}>
        <CustomButton
            title={STRINGS.commitAssessmentLog}
            variant="commit"
            icon={Save}
            onPress={handleCommit}
            loading={isSubmitting}
            colors={[primaryColor, secondaryColor]}
        />
    </View>
                </View >
            )}

<StatusModal
    visible={statusModal.visible}
    type={statusModal.type}
    title={statusModal.title}
    message={statusModal.message}
    onClose={() => setStatusModal({ ...statusModal, visible: false })}
    onOk={() => {
        setStatusModal({ ...statusModal, visible: false });
        if (statusModal.onConfirm) statusModal.onConfirm();
    }}
/>
            
        </Wrapper >
        
    );
};

const localStyles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loaderText: {
        marginTop: 12,
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.gray,
        letterSpacing: 0.5
    },
    mainViewContainer: {
        flex: 1
    },
    scrollViewStyle: {
        backgroundColor: '#F5F7FF'
    },
    scrollContainer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 120
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20
    },
    sectionCardFirst: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
        marginTop: -25
    },
    cardLabel: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Black,
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    enterMarksTitle: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary,
        marginBottom: 16
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1
    },
    dropdownTriggerText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary
    },
    dropdownListContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        marginTop: 4,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        zIndex: 999
    },
    dropdownScrollView: {
        maxHeight: 200
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    dropdownItemActive: {
        backgroundColor: '#F1F5F9'
    },
    dropdownItemText: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Medium,
        color: COLORS.secondary
    },
    dropdownItemTextActive: {
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.primary
    },
    studentDetailCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 14,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#DBEAFE'
    },
    studentAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 14,
        backgroundColor: COLORS.white
    },
    studentInfoContainer: {
        flex: 1
    },
    studentNameText: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary
    },
    studentClassText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: COLORS.gray,
        marginTop: 1
    },
    examCapsuleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 4
    },
    examCapsuleWrapper: {
        width: '48%',
        marginBottom: 10
    },
    examCapsuleActiveShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        borderRadius: 14,
        width: '100%'
    },
    examCapsuleActiveInner: {
        borderRadius: 14,
        height: 46,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    examCapsuleInactive: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingVertical: 12,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    examCapsuleTextActive: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.white
    },
    examCapsuleTextInactive: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#64748B'
    },
    subjectRow: {
        marginBottom: 16
    },
    subjectLabel: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: '#64748B',
        marginBottom: 8
    },
    inputPillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    marksTextInput: {
        flex: 1,
        height: 48,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary,
        marginRight: 12
    },
    percentageBadge: {
        height: 48,
        borderRadius: 14,
        paddingHorizontal: 16,
        minWidth: 72,
        alignItems: 'center',
        justifyContent: 'center'
    },
    percentageBadgeText: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold
    },
    spacer: {
        height: 40
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    }
});

export default AddMarks;
