import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Award, GraduationCap, Calculator, FlaskConical, BookOpen, Book, Trophy, PenTool, X, FileText, Download } from 'lucide-react-native';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { useDispatch, useSelector } from 'react-redux';
import { getAcademicResults } from '../../../../slices/student';
import Skeleton from '../../../../components/common/Skeleton';
import LinearGradient from 'react-native-linear-gradient';

const SUB_ICONS = {
    SCIENCE: FlaskConical,
    MATH: Calculator,
    MATHEMATICS: Calculator,
    ENGLISH: BookOpen,
    HINDI: Book,
    SOCIAL: BookOpen,
    SPORTS: Trophy,
    ART: PenTool,
};

const StudentExams = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { primaryColor } = useSelector(state => state.config);
    const scrollY = useRef(new Animated.Value(0)).current;

    const dynamicPrimary = primaryColor || COLORS.primary;
    const dynamicSecondary = primaryColor ? `${primaryColor}CC` : COLORS.secondary; // smooth transparency fallback

    const [performanceData, setPerformanceData] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [examTypes, setExamTypes] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [overallScore, setOverallScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reportModalVisible, setReportModalVisible] = useState(false);

    const getGrade = (per) => {
        if (per >= 90) return 'A+';
        if (per >= 80) return 'A';
        if (per >= 70) return 'B+';
        if (per >= 60) return 'B';
        if (per >= 50) return 'C';
        return 'D';
    };

    useEffect(() => {
        const studentId = user?.id || user?._id;
        if (!studentId) return;

        const fetchData = () => {
            setLoading(true);
            try {
                dispatch(getAcademicResults(studentId, (rawMarks) => {
                    if (!rawMarks || rawMarks.length === 0) {
                        setLoading(false);
                        return;
                    }

                    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    const groups = {};

                    rawMarks.forEach(m => {
                        const type = m.testName || m.examType || "GENERAL";
                        if (!groups[type]) groups[type] = {};
                        
                        const subName = m.subject?.toUpperCase() || "UNKNOWN";
                        if (!groups[type][subName]) groups[type][subName] = { obtained: 0, total: 0 };
                        
                        groups[type][subName].obtained += Number(m.marks || 0);
                        groups[type][subName].total += Number(m.total || 100);
                    });

                    const types = Object.keys(groups);
                    setExamTypes(types);
                    setGroupedData(groups);
                    
                    if (types.length > 0) {
                        const initialTab = types[0];
                        setActiveTab(initialTab);
                        updatePerformanceList(groups[initialTab]);
                    }
                    setLoading(false);
                }));
            } catch (e) {
                console.log("⚓ API Sync Failure:", e);
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user?.id, user?._id, dispatch, updatePerformanceList]);

    const updatePerformanceList = React.useCallback((subjectSummary) => {
        const colors = ['#3F43C2', '#FD3667', '#10B981', '#F59E0B', '#8B5CF6'];
        const formatted = Object.keys(subjectSummary).map((sub, idx) => {
            const data = subjectSummary[sub];
            const percentage = data.total > 0 ? Math.round((data.obtained / data.total) * 100) : 0;
            return { 
                subject: sub, 
                score: data.obtained, 
                outOf: data.total, 
                percentage, 
                grade: getGrade(percentage),
                color: colors[idx % colors.length],
                Icon: SUB_ICONS[sub.toUpperCase()] || GraduationCap
            };
        });

        setPerformanceData(formatted);
        if (formatted.length > 0) {
            const avg = formatted.reduce((acc, curr) => acc + curr.percentage, 0) / formatted.length;
            setOverallScore(Math.round(avg));
        }
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        updatePerformanceList(groupedData[tab]);
    };

    const ProgressBar = ({ progress, color }) => (
        <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
    );

    return (
        <Wrapper
            showHeader
            statusBarColor="#FFFFFF"
            statusBarStyle="dark-content"
            headerProps={{
                showBack: true,
                title: STRINGS.academicPerformance,
                theme: 'light'
            }}
        >
            <View style={{ flex: 1 }}>
                <Animated.ScrollView 
                    showsVerticalScrollIndicator={false} 
                    style={styles.container}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* 💳 FIGMA MOCKUP OVERALL RESULTS SCORE CARD */}
                    <View style={styles.figmaResultsCard}>
                        <LinearGradient
                            colors={[dynamicPrimary, dynamicSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.figmaResultsGradient}
                        >
                            <View>
                                <Text style={styles.figmaResultsLabel}>{STRINGS.overallPerformance}</Text>
                                <Text style={styles.figmaResultsValue}>{overallScore}%</Text>
                            </View>
                            <View style={styles.figmaMedalBox}>
                                <Award size={28} color={dynamicPrimary} />
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.mainContent}>
                        {/* 📑 EXAM TYPE TABS */}
                        {!loading && examTypes.length > 0 && (
                            <View style={styles.tabScrollContainer}>
                                <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
                                    {examTypes.map((type) => (
                                        <TouchableOpacity 
                                            key={type}
                                            style={[
                                                styles.tabItem, 
                                                activeTab === type && { borderColor: dynamicPrimary, backgroundColor: dynamicPrimary + '10' }
                                            ]}
                                            onPress={() => handleTabChange(type)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                styles.tabText, 
                                                activeTab === type && { color: dynamicPrimary, fontFamily: fontFamily.Poppins.Bold }
                                            ]}>{type.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </Animated.ScrollView>
                            </View>
                        )}


                        {loading ? (
                            <View style={{ padding: 20 }}>
                                <View style={styles.chartSection}>
                                    <Skeleton width="100%" height={160} borderRadius={24} />
                                </View>
                                {[1, 2, 3].map(i => (
                                    <View key={i} style={styles.subjectCard}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                                            <Skeleton width={120} height={16} borderRadius={4} />
                                            <Skeleton width={60} height={16} borderRadius={4} />
                                        </View>
                                        <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 10 }} />
                                        <Skeleton width={40} height={12} borderRadius={4} />
                                    </View>
                                ))}
                            </View>
                        ) : performanceData.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 40, color: '#cbd5e1', fontFamily: fontFamily.Poppins.Bold }}>{STRINGS.noDataFound}</Text>
                        ) : (
                            <>
                                <View style={styles.chartSection}>
                                    <View style={styles.sectionHeader}>
                                        <GraduationCap size={20} color={dynamicPrimary} />
                                        <Text style={styles.sectionTitle}>{STRINGS.subjectWise.toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.chartContainer}>
                                        {performanceData.map((item, index) => (
                                            <View key={index} style={styles.chartBarWrapper}>
                                                <View style={[styles.chartBar, { height: Math.max((item.percentage / 100) * 120, 5), backgroundColor: item.color }]} />
                                                <Text style={styles.chartLabel} numberOfLines={1}>{item.subject.substring(0, 4)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                {performanceData.map((item, index) => (
                                    <View key={index} style={styles.subjectCard}>
                                        <View style={styles.subjectHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[styles.miniIconBox, { backgroundColor: item.color + '15' }]}>
                                                    <item.Icon size={16} color={item.color} />
                                                </View>
                                                <View>
                                                    <Text style={styles.subjectName}>{item.subject}</Text>
                                                    <Text style={styles.gradeText}>{STRINGS.grade}: {item.grade}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.marksText}>{item.score}/{item.outOf}</Text>
                                        </View>
                                        <ProgressBar progress={item.percentage} color={item.color} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.percentageText}>{item.percentage}%</Text>
                                            <Text style={[styles.statusTag, { color: item.percentage >= 40 ? COLORS.success : COLORS.error }]}>
                                                {item.percentage >= 40 ? STRINGS.passed : STRINGS.failed}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity 
                                    style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: dynamicPrimary, height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: dynamicPrimary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}
                                    onPress={() => setReportModalVisible(true)}
                                >
                                    <FileText size={20} color={COLORS.white} style={{ marginRight: 10 }} />
                                    <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1 }}>{STRINGS.viewFullReportCard}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <View style={{ height: 100 }} />
                    </View>
                </Animated.ScrollView>
            </View>
                {/* 📜 REPORT CARD MODAL */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={reportModalVisible}
                    onRequestClose={() => setReportModalVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '90%', padding: 0 }}>
                            <View style={{ padding: 30, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ fontSize: 20, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{STRINGS.officialReportCard}</Text>
                                    <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray, textTransform: 'uppercase' }}>{STRINGS.academicSession} 2025-26</Text>
                                </View>
                                <TouchableOpacity onPress={() => setReportModalVisible(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                                    <X size={20} color={dynamicPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                                <View style={{ borderLeftWidth: 4, borderLeftColor: dynamicPrimary, paddingLeft: 16, marginBottom: 30 }}>
                                    <Text style={{ fontSize: 18, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{user?.name}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray }}>{STRINGS.admissionLabel}: {user?.admissionNo || 'N/A'}</Text>
                                    <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Bold, color: dynamicPrimary, textTransform: 'uppercase', marginTop: 4 }}>{STRINGS.examination}: {activeTab}</Text>
                                </View>

                                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' }}>
                                    <View style={{ flexDirection: 'row', backgroundColor: dynamicPrimary, padding: 16 }}>
                                        <Text style={{ flex: 2, color: COLORS.white, fontSize: 10, fontFamily: fontFamily.Poppins.Black, textTransform: 'uppercase' }}>{STRINGS.subject}</Text>
                                        <Text style={{ flex: 1, color: COLORS.white, fontSize: 10, fontFamily: fontFamily.Poppins.Black, textTransform: 'uppercase', textAlign: 'center' }}>{STRINGS.marksLabel}</Text>
                                        <Text style={{ flex: 1, color: COLORS.white, fontSize: 10, fontFamily: fontFamily.Poppins.Black, textTransform: 'uppercase', textAlign: 'center' }}>{STRINGS.grade}</Text>
                                    </View>
                                    
                                    {performanceData.map((item, index) => (
                                        <View key={index} style={{ flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                                            <Text style={{ flex: 2, color: '#1F2937', fontSize: 12, fontFamily: fontFamily.Poppins.Bold }}>{item.subject}</Text>
                                            <Text style={{ flex: 1, color: '#1F2937', fontSize: 12, fontFamily: fontFamily.Poppins.Black, textAlign: 'center' }}>{item.score}/{item.outOf}</Text>
                                            <Text style={{ flex: 1, color: item.color, fontSize: 12, fontFamily: fontFamily.Poppins.Black, textAlign: 'center' }}>{item.grade}</Text>
                                        </View>
                                    ))}

                                    <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 16 }}>
                                        <Text style={{ flex: 2, color: '#1F2937', fontSize: 12, fontFamily: fontFamily.Poppins.Black, textTransform: 'uppercase' }}>{STRINGS.overallPerformance}</Text>
                                        <Text style={{ flex: 1, color: '#1F2937', fontSize: 12, fontFamily: fontFamily.Poppins.Black, textAlign: 'center' }}>{overallScore}%</Text>
                                        <Text style={{ flex: 1, color: COLORS.success, fontSize: 12, fontFamily: fontFamily.Poppins.Black, textAlign: 'center' }}>{STRINGS.passed}</Text>
                                    </View>
                                </View>

                                <View style={{ marginTop: 40, padding: 24, backgroundColor: dynamicPrimary + '10', borderRadius: 24, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: dynamicPrimary + '30' }}>
                                    <Award size={40} color={dynamicPrimary} />
                                    <Text style={{ marginTop: 12, fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary, textAlign: 'center' }}>{STRINGS.instPerformanceCert}</Text>
                                    <Text style={{ marginTop: 4, fontSize: 10, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray, textAlign: 'center', lineHeight: 16 }}>{STRINGS.certificationDesc}</Text>
                                </View>

                                <TouchableOpacity style={{ marginTop: 30, backgroundColor: '#F1F5F9', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                                    <Download size={20} color={dynamicPrimary} style={{ marginRight: 10 }} />
                                    <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{STRINGS.downloadMarksheetPdf}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
        </Wrapper>
    );
};


export default StudentExams;
