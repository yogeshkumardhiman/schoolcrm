import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import CustomCalendar from '../../../../components/CustomCalendar';
import { UserCheck, UserX, Clock, Calendar as CalendarIcon, Info, ChevronRight } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { fetchMyAttendance } from '../../../../slices/teacher';
import { COLORS, fontFamily } from '../../../../utils';
import Skeleton from '../../../../components/common/Skeleton';
import { Wrapper } from '../../../../components/Wrapper';
import { styles } from './styles';

const AttendanceHistory = ({ navigation }) => {
    const dispatch = useDispatch();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));

    useEffect(() => {
        dispatch(fetchMyAttendance((res) => {
            if (res) setHistory(res);
            setLoading(false);
        }));
    }, [dispatch]);

    // 📊 Calculate Stats for the currently visible month
    const stats = useMemo(() => {
        const filtered = history.filter(item => item.date && item.date.startsWith(currentMonth));
        return {
            present: filtered.filter(a => a.status === 'PRESENT').length,
            absent: filtered.filter(a => a.status === 'ABSENT').length,
            leave: filtered.filter(a => a.status === 'LEAVE').length,
            total: filtered.length
        };
    }, [history, currentMonth]);

    // 🎨 Generate Marked Dates for Calendar
    const markedDates = useMemo(() => {
        const marked = {};
        history.forEach(item => {
            if (!item.date) return;
            const date = item.date.split('T')[0];
            marked[date] = {
                marked: true,
                dotColor: item.status === 'PRESENT' ? COLORS.green : item.status === 'LEAVE' ? COLORS.orange || '#F59E0B' : COLORS.red,
                customStyles: {
                    container: {
                        backgroundColor: item.status === 'PRESENT' ? COLORS.green + '20' : item.status === 'LEAVE' ? '#FFF3E0' : '#FEE2E2',
                        borderRadius: 10
                    },
                    text: {
                        color: item.status === 'PRESENT' ? COLORS.green : item.status === 'LEAVE' ? '#D97706' : COLORS.red,
                        fontWeight: 'bold'
                    }
                }
            };
        });
        return marked;
    }, [history]);

    const StatCard = ({ icon: Icon, label, value, color, bg }) => (
        <View style={[styles.statCard, { backgroundColor: bg }]}>
            <View style={[styles.statIconBox, { backgroundColor: color + '20' }]}>
                <Icon size={20} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    return (
        <Wrapper
            noTopInset={true}
            showHeader
            headerProps={{
                title: "ATTENDANCE REGISTRY",
                showBack: true,
                paddingBottom: 20
            }}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {loading ? (
                    <View>
                        {/* 📈 MONTHLY INSIGHTS SKELETON */}
                        <View style={styles.statsGrid}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}>
                                    <Skeleton width={36} height={36} borderRadius={10} />
                                    <View style={{ gap: 4, flex: 1 }}>
                                        <Skeleton width={30} height={18} borderRadius={4} />
                                        <Skeleton width={45} height={8} borderRadius={4} />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* 🗓️ ATTENDANCE CALENDAR SKELETON */}
                        <View style={styles.calendarContainer}>
                            <View style={{ padding: 14, gap: 14 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Skeleton width={120} height={18} borderRadius={4} />
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <Skeleton width={28} height={28} borderRadius={14} />
                                        <Skeleton width={28} height={28} borderRadius={14} />
                                    </View>
                                </View>
                                <Skeleton width="100%" height={200} borderRadius={16} />
                            </View>
                        </View>

                        {/* 📋 QUICK SUMMARY SKELETON */}
                        <View style={styles.summaryBox}>
                            <View style={styles.summaryHeader}>
                                <Skeleton width={16} height={16} borderRadius={4} />
                                <Skeleton width={180} height={10} borderRadius={4} />
                            </View>
                            <View style={[styles.summaryContent, { gap: 8 }]}>
                                <Skeleton width={200} height={14} borderRadius={4} />
                                <Skeleton width={150} height={14} borderRadius={4} />
                            </View>
                        </View>

                        {/* 🕒 DAILY LOGS SKELETON */}
                        <View style={{ marginBottom: 20 }}>
                            <Skeleton width={100} height={12} borderRadius={4} style={{ marginBottom: 12 }} />
                            {[1, 2].map(i => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' }}>
                                    <Skeleton width={36} height={36} borderRadius={10} />
                                    <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
                                        <Skeleton width={120} height={13} borderRadius={4} />
                                        <Skeleton width={70} height={11} borderRadius={4} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <>
                        {/* 📈 MONTHLY INSIGHTS */}
                        <View style={styles.statsGrid}>
                            <StatCard 
                                icon={UserCheck} 
                                label="PRESENT" 
                                value={stats.present} 
                                color={COLORS.green} 
                                bg="#E8F5E9" 
                            />
                            <StatCard 
                                icon={Clock} 
                                label="LEAVES" 
                                value={stats.leave} 
                                color={COLORS.orange || '#F59E0B'} 
                                bg="#FFF3E0" 
                            />
                            <StatCard 
                                icon={UserX} 
                                label="ABSENT" 
                                value={stats.absent} 
                                color={COLORS.red} 
                                bg="#FEE2E2" 
                            />
                        </View>

                        {/* 🗓️ ATTENDANCE CALENDAR */}
                        <View style={styles.calendarContainer}>
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
                                markedDates={markedDates}
                                onMonthChange={(month) => {
                                    setCurrentMonth(month.dateString.substring(0, 7));
                                }}
                            />
                        </View>

                        {/* 📋 QUICK SUMMARY */}
                        <View style={styles.summaryBox}>
                            <View style={styles.summaryHeader}>
                                <Info size={16} color={COLORS.gray} />
                                <Text style={styles.summaryTitle}>MONTHLY SUMMARY ({new Date(currentMonth).toLocaleDateString('en-US', { month: 'long' }).toUpperCase()})</Text>
                            </View>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryText}>
                                    Total Working Records: <Text style={{ fontFamily: fontFamily.Poppins.Bold }}>{stats.total}</Text>
                                </Text>
                                <Text style={styles.summaryText}>
                                    Compliance Rating: <Text style={{ fontFamily: fontFamily.Poppins.Bold, color: COLORS.green }}>{stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%</Text>
                                </Text>
                            </View>
                        </View>

                        {/* 🕒 DAILY LOGS FOR SELECTED MONTH */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={[styles.summaryTitle, { marginBottom: 12 }]}>DAILY LOGS</Text>
                            {history.filter(item => item.date && item.date.startsWith(currentMonth)).sort((a,b) => new Date(b.date) - new Date(a.date)).map((item, index) => (
                                <View key={index} style={styles.logCard}>
                                    <View style={[styles.statIconBox, { backgroundColor: (item.status === 'PRESENT' ? COLORS.green : item.status === 'LEAVE' ? COLORS.orange : COLORS.red) + '15' }]}>
                                        {item.status === 'PRESENT' ? <UserCheck size={18} color={COLORS.green} /> : <Clock size={18} color={COLORS.orange} />}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: COLORS.primary }}>
                                            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </Text>
                                        <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, marginTop: 2 }}>
                                            {item.status === 'PRESENT' ? (
                                                item.checkInTime ? (
                                                    item.checkOutTime 
                                                        ? `In: ${item.checkInTime} • Out: ${item.checkOutTime} (${item.workingHours || 'N/A'})`
                                                        : `Checked In @ ${item.checkInTime} (Pending Out)`
                                                ) : 'Marked Present'
                                            ) : item.status === 'LEAVE' ? 'On Approved Leave' : 'Absent'}
                                        </Text>
                                    </View>
                                    <ChevronRight size={16} color={COLORS.gray + '50'} />
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={styles.historyBtn}
                            onPress={() => navigation.navigate('ApplyLeave')}
                        >
                            <Text style={styles.historyBtnText}>APPLY FOR LEAVE</Text>
                            <ChevronRight size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </Wrapper>
    );
};

export default AttendanceHistory;
