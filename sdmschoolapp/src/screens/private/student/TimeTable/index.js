import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Clock, User } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS } from '../../../../utils';
import { getTimetable } from '../../../../slices/student';
import Skeleton from '../../../../components/common/Skeleton';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const PERIOD_TIMES = {
  1: '08:00 AM - 08:45 AM',
  2: '08:45 AM - 09:30 AM',
  3: '09:45 AM - 10:30 AM',
  4: '10:30 AM - 11:15 AM',
  5: '11:20 AM - 12:05 PM',
  6: '12:15 PM - 01:00 PM',
  7: '01:00 PM - 01:45 PM',
  8: '01:45 PM - 02:30 PM',
};

const StudentTimeTable = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const currentDayIndex = new Date().getDay();
    const initialDay = currentDayIndex === 0 ? "MON" : DAYS[currentDayIndex - 1];

    const [selectedDay, setSelectedDay] = useState(initialDay);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            const className = user?.class || '10TH';
            const section = user?.section || 'A';

            dispatch(getTimetable(className, section, (data) => {
                if (data) setTimetable(data);
                setLoading(false);
            }));
        };

        fetchTimetable();
    }, [user.class, user.section, dispatch]);

    const filteredTimetable = [];
    const seenPeriods = new Set();
    timetable
        .filter(t => t.day === selectedDay)
        .sort((a, b) => a.period - b.period)
        .forEach(item => {
            if (!seenPeriods.has(item.period)) {
                seenPeriods.add(item.period);
                filteredTimetable.push(item);
            }
        });

    return (
        <Wrapper
            showHeader
            headerProps={{
                showBack: true,
                theme: 'light', // Mockup flat white header
                title: STRINGS.weeklySchedule,
                rightComponent: (
                    <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F7FB', borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
                        <Calendar size={16} color="#1F2937" strokeWidth={2.2} />
                    </TouchableOpacity>
                ),
                children: (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.daySelector}
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {DAYS.map((day) => (
                            <TouchableOpacity
                                key={day}
                                activeOpacity={0.7}
                                style={[styles.dayTab, selectedDay === day && styles.activeDayTab]}
                                onPress={() => setSelectedDay(day)}
                            >
                                <Text style={[styles.dayTabText, selectedDay === day && styles.activeDayTabText]}>
                                    {STRINGS.dayNames[day]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )
            }}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLine} />
                        {[1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={styles.timelineRow}>
                                <View style={styles.timelineLeft}>
                                    <View style={[styles.timelineCircle, { backgroundColor: '#F1F5F9' }]}>
                                        <Skeleton width={16} height={16} borderRadius={8} />
                                    </View>
                                </View>
                                <View style={styles.timelineCard}>
                                    <View style={styles.timelineInfo}>
                                        <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Skeleton width={80} height={12} borderRadius={4} />
                                        </View>
                                    </View>
                                    <View style={styles.timelineTimeBox}>
                                        <Skeleton width={100} height={12} borderRadius={4} />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : filteredTimetable.length > 0 ? (
                    <View style={styles.timelineContainer}>
                        {/* timeline vertical path line */}
                        <View style={styles.timelineLine} />

                        {filteredTimetable.map((item, index) => {
                            const timeRange = PERIOD_TIMES[item.period] || '08:00 AM - 08:45 AM';
                            const isCurrentPeriod = index === 0; // Highlight first period for mockup look

                            return (
                                <View key={index} style={styles.timelineRow}>
                                    {/* Timeline Circle with active border logic */}
                                    <View style={styles.timelineLeft}>
                                        <View style={[styles.timelineCircle, isCurrentPeriod && styles.timelineCircleActive]}>
                                            <Text style={[styles.timelineText, isCurrentPeriod && styles.timelineTextActive]}>
                                                {item.period}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Period card */}
                                    <View style={styles.timelineCard}>
                                        <View style={styles.timelineInfo}>
                                            <Text style={styles.timelineSubject}>{item.subject}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <User size={12} color="#6B7280" strokeWidth={2} />
                                                <Text style={[styles.timelineTeacher, { marginLeft: 4 }]}>
                                                    {item.teacherName || 'Faculty'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.timelineTimeBox}>
                                            <Clock size={12} color="#9CA3AF" strokeWidth={2.2} />
                                            <Text style={styles.timelineTimeText}>
                                                {timeRange}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Calendar size={64} color={COLORS.border} strokeWidth={1} />
                        <Text style={styles.emptyText}>{STRINGS.noClassesToday}</Text>
                    </View>
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default StudentTimeTable;
