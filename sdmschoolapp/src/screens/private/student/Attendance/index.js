import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Info } from 'lucide-react-native';
import CustomCalendar from '../../../../components/CustomCalendar';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getAttendanceRecord } from '../../../../slices/student';

const StudentAttendance = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [rawAttendanceList, setRawAttendanceList] = useState([]);
    const [summary, setSummary] = useState({ present: 0, absent: 0, leave: 0, percentage: 0 });
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const studentId = user?.id || user?._id || user?.admissionNo;
        if (!studentId) return;
        
        console.log("Fetching attendance for user ID:", studentId);
        dispatch(getAttendanceRecord(studentId, (data) => {
            console.log("Attendance data received:", data);
            if (data) {
                setRawAttendanceList(data);
                const formatted = {};
                let p = 0, a = 0, l = 0;
                data.forEach(item => {
                    const status = item.status?.toUpperCase();
                    let color = '#10B981'; // Present (Green)
                    if (status === 'PRESENT') p++;
                    else if (status === 'ABSENT') { a++; color = '#EF4444'; } // Absent (Red)
                    else if (status === 'LEAVE') { l++; color = '#F59E0B'; } // Leave (Orange)

                    const dateKey = item.date ? item.date.split('T')[0] : '';
                    if (dateKey) {
                        formatted[dateKey] = {
                            marked: true,
                            customStyles: {
                                container: { 
                                    backgroundColor: color, 
                                    borderRadius: 18,
                                    shadowColor: color,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 2 
                                },
                                text: { color: 'white', fontFamily: fontFamily.Poppins.Bold }
                            }
                        };
                    }
                });
                setAttendanceData(formatted);
            }
        }));
    }, [user?.id, user?._id, user?.admissionNo, dispatch]);

    useEffect(() => {
        if (!rawAttendanceList) return;
        
        const currentYearMonth = selectedMonth.substring(0, 7);
        let p = 0, a = 0, l = 0;
        
        const monthData = rawAttendanceList.filter(item => {
            const dateKey = item.date ? item.date.split('T')[0] : '';
            return dateKey.startsWith(currentYearMonth);
        });

        monthData.forEach(item => {
            const status = item.status?.toUpperCase();
            if (status === 'PRESENT') p++;
            else if (status === 'ABSENT') a++;
            else if (status === 'LEAVE') l++;
        });

        const total = monthData.length;
        const percentage = total > 0 ? ((p / total) * 100).toFixed(0) : 0;
        setSummary({ present: p, absent: a, leave: l, percentage });
    }, [rawAttendanceList, selectedMonth]);

    const recentActivity = [...rawAttendanceList]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((item, idx) => {
            const status = item.status?.toUpperCase() || 'PRESENT';
            let color = '#10B981';
            let Icon = CheckCircle2;
            let label = "Present";

            if (status === 'ABSENT') {
                color = '#EF4444';
                Icon = Info;
                label = "Absent";
            } else if (status === 'LEAVE') {
                color = '#F59E0B';
                Icon = Clock;
                label = "Leave";
            }

            let formattedDate = item.date;
            try {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                formattedDate = new Date(item.date).toLocaleDateString('en-US', options);
            } catch (e) {}

            return {
                id: idx,
                date: formattedDate,
                status: label,
                color,
                Icon
            };
        });

    // 📊 Figma 3-Column horizontal summary capsules
    const renderFigmaSummaryTile = (label, value, color, bgColor) => {
        return (
            <View style={[styles.figmaSummaryTile, { backgroundColor: bgColor }]}>
                <View style={[styles.figmaTileDot, { backgroundColor: color }]} />
                <Text style={[styles.figmaTileValue, { color }]}>{value}</Text>
                <Text style={[styles.figmaTileLabel, { color }]}>{label}</Text>
            </View>
        );
    };

    return (
        <Wrapper
            showHeader
            statusBarColor="#FFFFFF"
            statusBarStyle="dark-content"
            headerProps={{
                title: "Attendance",
                showBack: false,
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
                    {/* 📊 FIGMA SUMMARY capsules (Present, Absent, Leave) */}
                    <View style={styles.figmaSummaryRow}>
                        {renderFigmaSummaryTile("Present", summary.present, "#10B981", "#E8F7F0")}
                        {renderFigmaSummaryTile("Absent", summary.absent, "#EF4444", "#FEE2E2")}
                        {renderFigmaSummaryTile("Leave", summary.leave, "#F59E0B", "#FEF3C7")}
                    </View>

                    <View style={styles.mainContent}>
                        {/* 📅 INTERACTIVE CALENDAR */}
                        <View style={styles.calendarCard}>
                            <CustomCalendar
                                hideLegend={true}
                                minDate={(() => {
                                    const today = new Date();
                                    const m = today.getMonth();
                                    const y = today.getFullYear();
                                    return m < 3 ? `${y - 1}-04-01` : `${y}-04-01`;
                                })()}
                                maxDate={new Date().toISOString().split('T')[0]}
                                markingType={'custom'}
                                markedDates={attendanceData}
                                onMonthChange={(month) => setSelectedMonth(month.dateString)}
                                theme={{
                                    calendarBackground: '#ffffff',
                                    textSectionTitleColor: '#9CA3AF',
                                    textDisabledColor: '#D1D5DB',
                                    textDayFontSize: 13,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 11,
                                }}
                            />

                            {/* LEGEND SECTION */}
                            <View style={styles.legendRow}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                    <Text style={styles.legendLabel}>Present</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                                    <Text style={styles.legendLabel}>Absent</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                                    <Text style={styles.legendLabel}>Leave</Text>
                                </View>
                            </View>
                        </View>

                        {/* Recent Activity Log */}
                        <Text style={styles.sectionTitle}>Activity & Logs</Text>
                        {recentActivity.map(activity => (
                            <View key={activity.id} style={styles.activityCard}>
                                <View style={[styles.activityIcon, { backgroundColor: activity.color + '12' }]}>
                                    <activity.Icon size={18} color={activity.color} />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityStatus, { color: activity.color }]}>{activity.status}</Text>
                                    <Text style={styles.activityDate}>{activity.date}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={{ height: 120 }} />
                </Animated.ScrollView>
            </View>
        </Wrapper>
    );
};

export default StudentAttendance;
