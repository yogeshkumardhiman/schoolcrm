import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Calendar as CalendarIcon, Save, Layers, UserCheck, UserX, ClipboardList, Bell, Search, X, CheckCircle2 } from 'lucide-react-native';
import CustomCalendar from '../../../../components/CustomCalendar';
import { COLORS, fontFamily, getResolvedUrl } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getClassRegistry, getClassAttendance, commitAttendance } from '../../../../slices/teacher';

import { StatusModal } from '../../../../components/common/StatusModal';
import { CustomButton } from '../../../../components/CustomButton';

const AttendanceMarking = ({ navigation, route }) => {
    const { user } = useSelector(state => state.auth);
    const { primaryColor, secondaryColor } = useSelector(state => state.config);
    const { selectedClass: paramClass, selectedSection: paramSection } = route?.params || {};

    // Default to user's class if no params provided (from Tab Bar)
    const selectedClass = paramClass || user?.class;
    const selectedSection = paramSection || user?.section;

    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCommitting, setIsCommitting] = useState(false);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'success', title: '', message: '' });

    // Fetch Logic
    useEffect(() => {
        if (!selectedClass) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const fetchDate = new Date(selectedDate).toLocaleDateString('en-CA');

        dispatch(getClassRegistry(selectedClass, selectedSection, (registry) => {
            if (Array.isArray(registry)) {
                dispatch(getClassAttendance(selectedClass, fetchDate, selectedSection, (attRes) => {
                    const mappedStudents = registry.map(s => {
                        const existing = (Array.isArray(attRes) ? attRes : []).find(a =>
                            (a.studentId?.toString() === s.id?.toString()) ||
                            (a.studentId?.toString() === s._id?.toString())
                        );

                        // Normalize status from backend (PRESENT/ABSENT/LEAVE) to UI (P/A/L)
                        let uiStatus = null;
                        if (existing) {
                            if (existing.status === 'PRESENT') uiStatus = 'P';
                            else if (existing.status === 'ABSENT') uiStatus = 'A';
                            else if (existing.status === 'LEAVE') uiStatus = 'L';
                            else uiStatus = existing.status; // Fallback for short codes
                        }

                        return {
                            ...s,
                            id: s.id || s._id,
                            roll: s.rollNo || s.admissionNo,
                            status: uiStatus
                        };
                    });
                    setStudents(mappedStudents);
                    setIsLoading(false);
                }));
            } else {
                setStudents([]);
                setIsLoading(false);
            }
        }));
    }, [selectedClass, selectedSection, selectedDate, dispatch]);

    const setStatus = (id, status) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    const markAllPresent = () => {
        setStudents(prev => prev.map(s => ({ ...s, status: 'P' })));
    };

    const clearAll = () => {
        setStudents(prev => prev.map(s => ({ ...s, status: null })));
    };

    const handleCommit = () => {
        setIsCommitting(true);
        const payload = {
            class: selectedClass,
            section: selectedSection,
            date: selectedDate,
            attendanceData: students.map(s => ({
                studentId: s.id,
                status: s.status === 'P' ? 'PRESENT' : (s.status === 'A' ? 'ABSENT' : 'LEAVE')
            }))
        };

        dispatch(commitAttendance(payload, (res) => {
            setIsCommitting(false);
            if (res?.success) {
                setStatusModal({
                    visible: true,
                    type: 'success',
                    title: 'REGISTRY SYNCED',
                    message: 'Institutional attendance records have been successfully synchronized with the production cluster.'
                });
            } else {
                setStatusModal({
                    visible: true,
                    type: 'error',
                    title: 'SYNC FAILURE',
                    message: res?.error || 'A critical synchronization breach occurred. Please verify your network telemetry.'
                });
            }
        }));
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const presentCount = students.filter(s => s.status === 'P').length;
    const absentCount = students.filter(s => s.status === 'A').length;
    const leaveCount = students.filter(s => s.status === 'L').length;
    const totalMarked = students.filter(s => s.status !== null).length;
    const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options).toUpperCase();
    };

    const isSunday = new Date(selectedDate).getDay() === 0;
    const isFutureDate = new Date(selectedDate) > new Date();
    const isDisabled = isSunday || isFutureDate;

    const renderStudent = (student) => {
        const getAvatarBg = (name) => {
            const colors = [
                { bg: '#EEF2FF', text: '#4F46E5' }, // Indigo
                { bg: '#ECFDF5', text: '#059669' }, // Emerald
                { bg: '#FDF2F8', text: '#DB2777' }, // Pink
                { bg: '#FFFBEB', text: '#D97706' }, // Amber
                { bg: '#F5F3FF', text: '#7C3AED' }, // Purple
            ];
            const index = (name ? name.charCodeAt(0) : 0) % colors.length;
            return colors[index];
        };

        const avatarTheme = getAvatarBg(student.name);

        return (
            <View key={student.id} style={styles.studentCard}>
                <View style={styles.cardMain}>
                    <View style={styles.imageContainer}>
                        {student.image ? (
                            <Image
                                source={{ uri: getResolvedUrl(student.image) }}
                                style={styles.studentAvatar}
                            />
                        ) : (
                            <View style={[styles.studentAvatar, { backgroundColor: avatarTheme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: avatarTheme.text }}>
                                    {student.name ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardStudentName} numberOfLines={1}>
                            {student.name}
                        </Text>
                        <Text style={styles.studentRoll}>
                            Roll No: {student.roll || '—'} • ID: {student.id}
                        </Text>
                    </View>
                </View>
                <View style={styles.toggleGroup}>
                    {['P', 'L', 'A'].map((s) => (
                        <TouchableOpacity
                            key={s}
                            disabled={isDisabled}
                            onPress={() => setStatus(student.id, s)}
                            style={[
                                styles.paPill,
                                student.status === s && (
                                    s === 'P' ? styles.btnP : (s === 'A' ? styles.btnA : styles.btnL)
                                ),
                                isDisabled && { opacity: 0.3 }
                            ]}
                        >
                            <Text style={[
                                styles.paText,
                                student.status === s && styles.activeText
                            ]}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            headerProps={{
                title: "ATTENDANCE HUB",
                containerStyle: { paddingBottom: 30 },
                children: (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10, }}>
                        <View style={styles.classInfo}>
                            <Users size={16} color={COLORS.primary} />
                            <Text style={styles.selectedClassText}>{selectedClass} - {selectedSection}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.datePickerBadge}
                            onPress={() => setIsCalendarVisible(true)}
                        >
                            <CalendarIcon size={16} color={COLORS.black} />
                            <Text style={styles.dateBadgeText}>{formatDate(selectedDate)}</Text>
                        </TouchableOpacity>
                    </View>
                )
            }}
            parentStyle={{ backgroundColor: COLORS.background }}
        >
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                    <View style={styles.telemetryAxis}>
                        <View style={styles.telemetryBox}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                                <Layers size={18} color={COLORS.primary} />
                            </View>
                            <Text style={[styles.telemetryValue, { color: COLORS.primary }]}>{attendancePercentage}%</Text>
                            <Text style={styles.telemetryLabel}>RATIO</Text>
                        </View>
                        <View style={styles.telemetryBox}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '15' }]}>
                                <UserCheck size={18} color={COLORS.success} />
                            </View>
                            <Text style={[styles.telemetryValue, { color: COLORS.success }]}>{presentCount}</Text>
                            <Text style={styles.telemetryLabel}>PRES</Text>
                        </View>
                        <View style={styles.telemetryBox}>
                            <View style={[styles.iconContainer, { backgroundColor: (COLORS.orange || '#F59E0B') + '20' }]}>
                                <ClipboardList size={18} color={COLORS.orange || '#F59E0B'} />
                            </View>
                            <Text style={[styles.telemetryValue, { color: COLORS.orange || '#F59E0B' }]}>{leaveCount}</Text>
                            <Text style={styles.telemetryLabel}>LEAVE</Text>
                        </View>
                        <View style={styles.telemetryBox}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.red + '15' }]}>
                                <UserX size={18} color={COLORS.red} />
                            </View>
                            <Text style={[styles.telemetryValue, { color: COLORS.red }]}>{absentCount}</Text>
                            <Text style={styles.telemetryLabel}>ABST</Text>
                        </View>
                    </View>

                    {/* ⚡ QUICK ACTIONS */}
                    {!isDisabled && (
                        <View style={styles.quickActionsRow}>
                            <TouchableOpacity
                                style={[styles.markAllBtn, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
                                onPress={markAllPresent}
                            >
                                <UserCheck size={16} color={COLORS.white} />
                                <Text style={styles.markAllText}>MARK ALL PRESENT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.clearAllBtn}
                                onPress={clearAll}
                            >
                                <Text style={styles.clearAllText}>CLEAR ALL</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isDisabled && (
                        <View style={{ backgroundColor: COLORS.orange + '10', padding: 12, marginHorizontal: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15, borderWidth: 1, borderColor: COLORS.orange + '30' }}>
                            <Bell size={18} color={COLORS.orange} />
                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Black, color: COLORS.orange, letterSpacing: 0.5, flex: 1 }}>
                                {isSunday ? "SUNDAY | INSTITUTIONAL HOLIDAY" : "TEMPORAL RESTRICTION | FUTURE DATE"}
                            </Text>
                        </View>
                    )}

                    {/* 🔍 SEARCH AND STUDENT CARD LIST */}
                    <View style={{ flex: 1, marginTop: 25, paddingHorizontal: 20 }}>
                        <View style={styles.actionRow}>
                            <View style={styles.searchBox}>
                                <Search size={18} color={COLORS.gray} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search Scholar..."
                                    placeholderTextColor={COLORS.gray}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Student Roster</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{filteredStudents.length} Scholars</Text>
                            </View>
                        </View>


                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(renderStudent)
                        ) : (
                            <View style={styles.emptyState}>
                                <Users size={48} color={COLORS.gray + '50'} />
                                <Text style={styles.emptyTitle}>No Scholars Found</Text>
                            </View>
                        )}

                        <View style={styles.footer}>
                            <CustomButton
                                title={isDisabled ? "REGISTRY LOCKED" : (totalMarked >= students.length ? "COMMIT ATTENDANCE LOG" : `MARK ${students.length - totalMarked} MORE`)}
                                variant="commit"
                                icon={Save}
                                onPress={handleCommit}
                                loading={isCommitting}
                                disabled={students.length === 0 || isCommitting || isDisabled || (totalMarked < students.length)}
                                style={styles.commitBtn}
                                colors={[primaryColor, secondaryColor || primaryColor]}
                            />
                        </View>

                    </View>
                </ScrollView>
            </View>

            <StatusModal
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => {
                    setStatusModal({ ...statusModal, visible: false });
                    if (statusModal.type === 'success') {
                        navigation.goBack();
                    }
                }}
            />

            <Modal visible={isCalendarVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECT DATE</Text>
                            <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                                <X size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                        <CustomCalendar
                            hideLegend={true}
                            onDayPress={(day) => {
                                setSelectedDate(day.dateString);
                                setIsCalendarVisible(false);
                            }}
                            markedDates={{ [selectedDate]: { selected: true } }}
                        />
                    </View>
                </View>
            </Modal>
        </Wrapper>
    );
};

export default AttendanceMarking;
