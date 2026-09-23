import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, ScrollView as RNScrollView } from 'react-native';
import {
    FileCheck,
    BookOpen,
    Bell,
    Users,
    User,
    LayoutGrid,
    Clock,
    MessageCircle,
    ChevronRight,
    Calendar,
    Award,
    UserCheck,
    ShieldAlert,
    AlertTriangle,
    GraduationCap
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { getClassRegistry, getClassAttendance, getStudentQueries, fetchMyAttendance, getSubstitutions, getInstitutionalNotices } from '../../../../slices/teacher';
import { fetchAppConfiguration } from '../../../../slices/configSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, STRINGS, getResolvedUrl, fontFamily, screenWidth } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { APIService } from '../../../../services/APIServices';

const TeacherDashboard = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useSelector(state => state.auth);
    const isClassTeacher = (user?.class && user?.section) ? true : false;

    const {
        primaryColor,
        secondaryColor,
        schoolName,
        appTitle,
        logoUrl,
        activeFeatures,
        maintenanceMode,
        emergencyAlert,
        timings
    } = useSelector(state => state.config);

    const [stats, setStats] = useState({
        attendance: '0%',
        presentCount: 0,
        totalStudents: 0,
        students: '0',
        pendingQueries: 0
    });
    const [substitutions, setSubstitutions] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [hasUnreadNotices, setHasUnreadNotices] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const dispatch = useDispatch();

    // Toggle emergency notice if Super Admin pushed it
    useEffect(() => {
        const checkEmergency = async () => {
            if (emergencyAlert?.active) {
                try {
                    const stored = await AsyncStorage.getItem('acknowledged_emergency_alert');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.title === emergencyAlert.title && parsed.message === emergencyAlert.message) {
                            return;
                        }
                    }
                    setShowEmergencyModal(true);
                } catch (e) {
                    setShowEmergencyModal(true);
                }
            }
        };
        checkEmergency();
    }, [emergencyAlert?.active, emergencyAlert?.title, emergencyAlert?.message]);

    const fetchDashboardTelemetry = useCallback((isRefresh = false) => {
        if (isRefresh) {
            dispatch(fetchAppConfiguration());
        }

        const className = user?.class;
        const section = user?.section;

        // Fetch Teacher's OWN attendance for the profile ring
        dispatch(fetchMyAttendance((res) => {
            if (res && Array.isArray(res)) {
                // Calculate current month attendance %
                const currentMonth = new Date().toISOString().substring(0, 7);
                const monthLogs = res.filter(a => a.date && a.date.startsWith(currentMonth));
                const total = monthLogs.length;
                const presents = monthLogs.filter(a => a.status === 'PRESENT').length;
                const percent = total > 0 ? ((presents / total) * 100).toFixed(0) : 0;
                setStats(prev => ({ ...prev, attendance: `${percent}%` }));
            }
        }));

        dispatch(getSubstitutions((res) => {
            setSubstitutions(res || []);
        }));

        // Fetch institutional notices to check for unread red dot
        dispatch(getInstitutionalNotices(async (data) => {
            try {
                const noticesList = data || [];
                if (noticesList && noticesList.length > 0) {
                    const latestNoticeId = Math.max(...noticesList.map(item => Number(item.id) || 0));
                    const lastReadStr = await AsyncStorage.getItem('lastReadNoticeId');
                    const lastReadId = lastReadStr ? Number(lastReadStr) : 0;
                    
                    if (latestNoticeId > lastReadId) {
                        setHasUnreadNotices(true);
                    } else {
                        setHasUnreadNotices(false);
                    }
                } else {
                    setHasUnreadNotices(false);
                }
            } catch (err) {
                console.log("[Teacher Dashboard] Unread notices check failed:", err);
            }
        }));

        if (!className || !section) {
            setFetching(false);
            return;
        }

        dispatch(getClassRegistry(className, section, (res) => {
            const registryTotal = res ? res.length : 0;
            if (res) {
                setStats(prev => ({ ...prev, students: registryTotal.toString(), totalStudents: registryTotal }));
            }

            dispatch(getClassAttendance(className, new Date().toISOString().split('T')[0], section, (attRes) => {
                if (attRes) {
                    const present = attRes.filter(a => a.status === 'PRESENT').length;
                    setStats(prev => ({
                        ...prev,
                        presentCount: present,
                    }));
                }
                setFetching(false);
            }));
            
            // Also fetch Open Queries for this class
            dispatch(getStudentQueries(className, section, (queriesRes) => {
                if (queriesRes) {
                    const pending = queriesRes.filter(q => q.status === 'PENDING').length;
                    setStats(prev => ({ ...prev, pendingQueries: pending }));
                }
            }));
        }));
    }, [user?.class, user?.section, dispatch]);

    useFocusEffect(
        useCallback(() => {
            fetchDashboardTelemetry();
        }, [fetchDashboardTelemetry])
    );

    console.log("DASHBOARD STATS:", stats);
    const cleanAttPercent = parseInt(stats.attendance.replace('%', ''), 10) || 0;

    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return STRINGS.goodMorning;
        if (hours < 17) return STRINGS.goodAfternoon;
        return STRINGS.goodEvening;
    };

    const getInitials = (name) => {
        if (!name) return 'FC';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const CircularProgress = ({ percentage = 92, radius = 34, strokeWidth = 5.5, labelText = "Scholars", valueText = "" }) => {
        const circumference = 2 * Math.PI * radius;
        // Cap percentage between 0 and 100 for the circle fill
        const validPercentage = Math.min(Math.max(percentage || 0, 0), 100);
        const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

        return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
                    <Circle
                        cx={radius + strokeWidth}
                        cy={radius + strokeWidth}
                        r={radius}
                        stroke="#EEF2FF"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <Circle
                        cx={radius + strokeWidth}
                        cy={radius + strokeWidth}
                        r={radius}
                        stroke={primaryColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
                    />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937' }}>
                        {valueText || `${validPercentage}%`}
                    </Text>
                    <Text style={{ fontSize: 8.5, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8', marginTop: -2 }}>
                        {labelText}
                    </Text>
                    <Svg width={14} height={4} viewBox="0 0 14 4" style={{ marginTop: 2 }}>
                        <Path
                            d="M0,2 Q3.5,0 7,2 T14,2"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth={1.5}
                        />
                    </Svg>
                </View>
            </View>
        );
    };

    const renderFigmaMenuItem = (label, icon, color, route) => (
        <TouchableOpacity
            style={styles.figmaGridItem}
            onPress={() => {
                navigation.navigate(route);
            }}
            activeOpacity={0.8}
            key={route}
        >
            <View style={styles.figmaGridCard}>
                <View style={styles.figmaGridIconBox}>
                    {React.createElement(icon, { size: 24, color: primaryColor, strokeWidth: 2 })}
                </View>
                <Text style={styles.figmaGridText} numberOfLines={2}>{label}</Text>
            </View>
        </TouchableOpacity>
    );

    const menuItems = [
        {
            title: STRINGS.examMarksMenu,
            icon: FileCheck,
            color: '#10B981',
            route: 'TestList',
            desc: STRINGS.examMarksDesc
        },
        {
            title: STRINGS.homeworkMenu,
            icon: BookOpen,
            color: '#8B5CF6',
            route: 'TeacherHomeworkList',
            desc: STRINGS.homeworkDesc
        },
        {
            title: STRINGS.noticesMenu,
            icon: Bell,
            color: '#EF4444',
            route: 'AddNotice',
            desc: STRINGS.noticesDesc
        },
        {
            title: STRINGS.timetableMenu,
            icon: LayoutGrid,
            color: '#3B82F6',
            route: 'TimeTable',
            desc: STRINGS.timetableDesc
        },
        {
            title: STRINGS.calendarMenu,
            icon: Calendar,
            color: '#EC4899',
            route: 'StudentEvents',
            desc: STRINGS.calendarDesc
        },
    ];

    const featureMap = {
        'EXAM MARKS': 'exams',
        'HOMEWORK': 'homework',
        'NOTICES': 'notice',
        'TIMETABLE': 'timetable',
        'CALENDAR': 'calendar'
    };

    const visibleMenuItems = menuItems.filter(item => {
        const featureKey = featureMap[item.title];
        return !featureKey || (Array.isArray(activeFeatures) && activeFeatures.includes(featureKey));
    });

    if (maintenanceMode) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                <View style={{ height: 160, width: 160, borderRadius: 80, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                    <AlertTriangle size={72} color="#EF4444" />
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 12 }}>
                    {STRINGS.sysUnderMaintenance}
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>
                    {STRINGS.sysUnderMaintenanceDesc}
                </Text>
                <View style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#F3F4F6' }}>
                    <Text style={{ fontSize: 10, color: '#374151', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        {schoolName} System
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <Wrapper showHeader={false}>
            <View style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
                {/* 👤 FIGMA INLINE GREETING HEADER (Like Student Dashboard) */}
                <View style={styles.figmaHeader}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        {/* 🏫 School Name Identity */}
                        <Text style={{
                            fontSize: 10.5,
                            fontWeight: 'bold',
                            color: primaryColor,
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            fontFamily: fontFamily?.Poppins?.Bold || 'System',
                            marginBottom: 3
                        }} numberOfLines={1}>
                            {schoolName || 'SDM Public School'}
                        </Text>
                        <Text style={styles.figmaHeaderGreeting}>{getGreeting()}</Text>
                        <Text style={styles.figmaHeaderName} numberOfLines={1}>
                            {user?.name || 'Faculty Member'}
                        </Text>
                    </View>
                    <View style={styles.figmaHeaderRight}>
                        {/* Bell Icon Button */}
                        <TouchableOpacity
                            style={styles.figmaBellBtn}
                            activeOpacity={0.75}
                            onPress={() => navigation.navigate('NoticeScreen')}
                        >
                            <Bell size={18} color="#1F2937" strokeWidth={2.2} />
                            {hasUnreadNotices && <View style={styles.figmaBellBadge} />}
                        </TouchableOpacity>

                        {/* School Logo / Icon (Branded!) */}
                        <View style={[styles.figmaAvatarBtn, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }]}>
                            {logoUrl ? (
                                <Image
                                    source={{ uri: getResolvedUrl(logoUrl) }}
                                    style={{ width: screenWidth(10), height: screenWidth(10), borderRadius: 18, }}
                                    resizeMode='cover'
                                />
                            ) : (
                                <View style={[styles.figmaAvatarPlaceholder, { backgroundColor: primaryColor + '15', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 18 }]}>
                                    <GraduationCap size={16} color={primaryColor} strokeWidth={2} />
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                >
                    {/* 👤 FIGMA PROFILE CARD (Like Student Dashboard) */}
                <View style={styles.figmaProfileCard}>
                    {/* Avatar Container */}
                    <View style={styles.figmaProfileImgWrapper}>
                        {user?.image ? (
                            <Image
                                source={{ uri: getResolvedUrl(user.image) }}
                                style={styles.figmaProfileImg}
                            />
                        ) : (
                            <View style={[styles.figmaProfileInitialBox, { backgroundColor: primaryColor + '20' }]}>
                                <Text style={[styles.figmaProfileInitialText, { color: primaryColor }]}>
                                    {getInitials(user?.name)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Faculty Info Container */}
                    <View style={styles.figmaProfileInfo}>
                        <Text style={styles.figmaProfileName} numberOfLines={1}>
                            {user?.name || 'Aarav Jain'}
                        </Text>

                        {/* Badges Row (Role, Class, ID) */}
                        <View style={styles.figmaBadgesRow}>
                            <View style={[styles.figmaClassBadge, { backgroundColor: primaryColor + '15' }]}>
                                <Text style={[styles.figmaClassText, { color: primaryColor }]}>
                                    Faculty
                                </Text>
                            </View>

                            <View style={[styles.figmaClassBadge, { backgroundColor: '#ECFDF5' }]}>
                                <Text style={[styles.figmaClassText, { color: '#10B981' }]}>
                                    Cls {user?.class || 'N/A'}-{user?.section || 'N/A'}
                                </Text>
                            </View>

                            <View style={styles.figmaRollBadge}>
                                <Text style={styles.figmaRollText}>
                                    ID {user?.empId || '1024'}
                                </Text>
                            </View>
                        </View>

                        {/* Class Teacher Capsule */}
                        {isClassTeacher && (
                            <View style={styles.figmaTeacherCapsule}>
                                <View style={styles.figmaTeacherIconBox}>
                                    <User size={13} color="#10B981" strokeWidth={2.5} />
                                </View>
                                <View style={styles.figmaTeacherTextBox}>
                                    <Text style={styles.figmaTeacherLabel}> FACULTY HUB</Text>
                                    <Text style={styles.figmaTeacherNameText} numberOfLines={1}>
                                        Class Teacher
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Circular Attendance Ring */}
                    <View style={styles.figmaAttendanceSection}>
                        <CircularProgress 
                            percentage={isNaN(cleanAttPercent) ? 0 : cleanAttPercent} 
                            valueText="" 
                            labelText="Attendance" 
                        />
                    </View>
                </View>


                {/* ⚡ MISSION CONTROL GRID (4-COLUMN GRID) */}
                <View style={styles.figmaSectionHeader}>
                    <Text style={styles.figmaSectionTitle}>{STRINGS.missionControl}</Text>
                </View>

                <View style={styles.figmaGrid}>
                    {visibleMenuItems.map((item) => renderFigmaMenuItem(item.title, item.icon, item.color, item.route))}
                </View>

                {/* 🕐 SCHOOL TIMING CARD */}
                {timings && (
                    <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
                        <View style={styles.figmaSectionHeader}>
                            <Text style={styles.figmaSectionTitle}>School Timings</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {/* Summer */}
                            <View style={{ flex: 1, backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FDE68A' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <Clock size={13} color="#D97706" strokeWidth={2.5} />
                                    <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#D97706', textTransform: 'uppercase', letterSpacing: 1 }}>Summer</Text>
                                </View>
                                <Text style={{ fontSize: 15, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#92400E' }}>
                                    {timings.summer?.startTime} – {timings.summer?.endTime}
                                </Text>
                                <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Medium || 'System', color: '#B45309', marginTop: 3 }}>
                                    {timings.summer?.months || 'Apr – Sep'}
                                </Text>
                            </View>
                            {/* Winter */}
                            <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <Clock size={13} color="#2563EB" strokeWidth={2.5} />
                                    <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#2563EB', textTransform: 'uppercase', letterSpacing: 1 }}>Winter</Text>
                                </View>
                                <Text style={{ fontSize: 15, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#1E3A8A' }}>
                                    {timings.winter?.startTime} – {timings.winter?.endTime}
                                </Text>
                                <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Medium || 'System', color: '#3B82F6', marginTop: 3 }}>
                                    {timings.winter?.months || 'Oct – Mar'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 📅 TODAY'S OVERVIEW SECTION */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontFamily: fontFamily.Poppins.SemiBold, color: '#1F2937' }}>{STRINGS.todaysOverview}</Text>
                    <TouchableOpacity onPress={() => fetchDashboardTelemetry()} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EEF2FF', borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Medium, color: primaryColor }}>{STRINGS.refresh}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 2 }}>
                    {/* Card 1: Scholars Count */}
                    <View style={{ width: '50%', padding: 6 }}>
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: 'rgba(108, 99, 255, 0.02)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }}>
                            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
                                <Users size={16} color={primaryColor} strokeWidth={2.2} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 8.5, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>{STRINGS.myScholars}</Text>
                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937' }}>{stats.students} {STRINGS.studentsCount}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Card 2: Attendance Present Today */}
                    <View style={{ width: '50%', padding: 6 }}>
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: 'rgba(108, 99, 255, 0.02)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }}>
                            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E6F4EA', justifyContent: 'center', alignItems: 'center' }}>
                                <UserCheck size={16} color="#137333" strokeWidth={2.2} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 8.5, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>{STRINGS.presentTodayLabel}</Text>
                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937' }}>{stats.presentCount} {STRINGS.present}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Card 3: Active Queries */}
                    <View style={{ width: '50%', padding: 6 }}>
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: 'rgba(108, 99, 255, 0.02)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }}>
                            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' }}>
                                <MessageCircle size={16} color="#F59E0B" strokeWidth={2.2} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 8.5, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>{STRINGS.openTickets}</Text>
                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937' }}>{stats.pendingQueries || 0} Grievance{stats.pendingQueries !== 1 ? 's' : ''}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Card 4: Substitution Duties */}
                    <View style={{ width: '50%', padding: 6 }}>
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: 'rgba(108, 99, 255, 0.02)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }}>
                            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' }}>
                                <Clock size={16} color="#EF4444" strokeWidth={2.2} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 8.5, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>Sub Duties</Text>
                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937' }}>{substitutions.length} Duties</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 📬 ALERTS & ACTIONABLE STRIPS */}
                <View style={styles.figmaSectionHeader}>
                    <Text style={styles.figmaSectionTitle}>{STRINGS.activeAlerts}</Text>
                </View>

                {substitutions.length > 0 && (
                    <TouchableOpacity
                        style={{
                            marginHorizontal: 16,
                            backgroundColor: '#FFFFFF',
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            padding: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            shadowColor: 'rgba(108, 99, 255, 0.04)',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 2,
                            borderLeftWidth: 6,
                            borderLeftColor: '#F59E0B',
                            paddingLeft: 16,
                            marginBottom: 16,
                        }}
                        onPress={() => navigation.navigate('TimeTable')}
                        activeOpacity={0.85}
                    >
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                                    <Text style={{ fontSize: 9.5, fontFamily: fontFamily.Poppins.Bold, color: '#F59E0B' }}>
                                        {STRINGS.substitutionAlertsLabel.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                                    <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Bold, color: '#D97706' }}>
                                        Urgent
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', marginBottom: 12 }}>
                                You have {substitutions.length} duty {substitutions.length > 1 ? 'assignments' : 'assignment'} today.
                            </Text>
                            <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>
                                    Check your dynamic timetable for class schedules
                                </Text>
                                <ChevronRight size={14} color="#94A3B8" />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Grievance Queries Card */}
                <TouchableOpacity
                    style={{
                        marginHorizontal: 16,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: 'rgba(108, 99, 255, 0.04)',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        elevation: 2,
                        borderLeftWidth: 6,
                        borderLeftColor: '#8B5CF6',
                        paddingLeft: 16,
                        marginBottom: 16,
                    }}
                    onPress={() => navigation.navigate('StudentQueries')}
                    activeOpacity={0.85}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{ backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                                <Text style={{ fontSize: 9.5, fontFamily: fontFamily.Poppins.Bold, color: '#8B5CF6' }}>
                                    {STRINGS.scholarQueries.toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                                <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Bold, color: '#7C3AED' }}>
                                    Message Hub
                                </Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', marginBottom: 12 }}>
                            {STRINGS.queryDesc}
                        </Text>
                        <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>
                                Dynamic communication widget
                            </Text>
                            <ChevronRight size={14} color="#94A3B8" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Scholar Directory Card */}
                <TouchableOpacity
                    style={{
                        marginHorizontal: 16,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: 'rgba(108, 99, 255, 0.04)',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        elevation: 2,
                        borderLeftWidth: 6,
                        borderLeftColor: primaryColor, // Dynamic color strip!
                        paddingLeft: 16,
                        marginBottom: 16,
                    }}
                    onPress={() => navigation.navigate('StudentRegistry')}
                    activeOpacity={0.85}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{ backgroundColor: primaryColor + '15', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                                <Text style={{ fontSize: 9.5, fontFamily: fontFamily.Poppins.Bold, color: primaryColor }}>
                                    SCHOLAR DIRECTORY
                                </Text>
                            </View>
                            <View style={{ backgroundColor: primaryColor + '25', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                                <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Bold, color: primaryColor }}>
                                    Profiles
                                </Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', marginBottom: 12 }}>
                            {`Manage profile directories for Class ${user?.class || 'N/A'}-${user?.section || 'N/A'} scholars.`}
                        </Text>
                        <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>
                                Complete list of registered students
                            </Text>
                            <ChevronRight size={14} color="#94A3B8" />
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 80 }} />
            </Animated.ScrollView>
            </View>

            {/* ⚠️ DIALOG: EMERGENCY MODAL */}
            {showEmergencyModal && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100,
                    padding: 24
                }}>
                    <View style={{
                        backgroundColor: '#FFFFFF',
                        width: '100%',
                        borderRadius: 28,
                        padding: 24,
                        elevation: 8,
                        shadowColor: '#EF4444',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        borderWidth: 1,
                        borderColor: '#FEE2E2'
                    }}>
                        <View style={{
                            height: 48,
                            width: 48,
                            borderRadius: 24,
                            backgroundColor: '#FEF2F2',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 16
                        }}>
                            <ShieldAlert size={24} color="#EF4444" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, fontFamily: 'Poppins-Bold' }}>
                            {emergencyAlert?.title || 'Emergency Notice'}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 24, fontFamily: 'Poppins-Medium' }}>
                            {emergencyAlert?.message || 'Important alert details.'}
                        </Text>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await AsyncStorage.setItem('acknowledged_emergency_alert', JSON.stringify({
                                        title: emergencyAlert?.title || '',
                                        message: emergencyAlert?.message || ''
                                    }));
                                } catch (e) {
                                    console.log("Failed to save emergency alert acknowledgment:", e);
                                }
                                setShowEmergencyModal(false);
                            }}
                            style={{
                                backgroundColor: primaryColor,
                                height: 48,
                                borderRadius: 14,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: primaryColor,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Acknowledge Notice
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Wrapper>
    );
};

export default TeacherDashboard;
