import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS } from '../../../../utils';
import { getStaffTimetable, getSubstitutions } from '../../../../slices/teacher';
import Skeleton from '../../../../components/common/Skeleton';

import { Wrapper } from '../../../../components/Wrapper';
import PeriodCard from './PeriodCard';
import { styles } from './styles';

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const TimeTable = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    
    // Get current day, default to MON if Sunday
    const currentDayIndex = new Date().getDay();
    const initialDay = currentDayIndex === 0 ? "MON" : DAYS[currentDayIndex - 1];
    
    const [selectedDay, setSelectedDay] = useState(initialDay);
    const [timetable, setTimetable] = useState([]);
    const [substitutions, setSubstitutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Use Redux Actions with callbacks
            dispatch(getStaffTimetable(user.id, (ttData) => {
                if (ttData) setTimetable(ttData);
                
                dispatch(getSubstitutions((subData) => {
                    if (subData) setSubstitutions(subData);
                    setLoading(false);
                }));
            }));
        };

        fetchData();
    }, [user.id, dispatch]);

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = selectedDay === (new Date().getDay() === 0 ? "MON" : DAYS[new Date().getDay() - 1]);

    const regularTimetable = timetable.filter(t => t.day === selectedDay);
    
    // Merge substitutions if it's today
    let displayTimetable = [...regularTimetable];
    if (isToday) {
        substitutions.forEach(sub => {
            // Find if there's a regular class at this period
            const idx = displayTimetable.findIndex(t => Number(t.period) === Number(sub.period));
            if (idx !== -1) {
                // If there's a clash, substitution usually takes priority or we show both
                // For now, let's mark it as a substitution duty
                displayTimetable[idx] = { ...displayTimetable[idx], isSubstitution: true, subInfo: sub };
            } else {
                displayTimetable.push({ 
                     period: sub.period, 
                     class: sub.class, 
                     section: sub.section, 
                     subject: 'Substitution Duty', 
                     isSubstitution: true, 
                     subInfo: sub 
                });
            }
        });
    }

    const sortedTimetable = displayTimetable.sort((a, b) => a.period - b.period);

    const renderDaySelector = () => (
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
    );

    return (
        <Wrapper 
            showHeader
            headerProps={{
                showBack: true,
                title: STRINGS.myTimetable,
                children: renderDaySelector()
            }}
        >

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View>
                        {[1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={styles.periodCard}>
                                <Skeleton width={46} height={46} borderRadius={14} />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Skeleton width={120} height={17} borderRadius={4} style={{ marginBottom: 8 }} />
                                    <Skeleton width={80} height={12} borderRadius={4} />
                                </View>
                                <View style={{ gap: 6, alignItems: 'flex-end' }}>
                                    <Skeleton width={60} height={12} borderRadius={4} />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : sortedTimetable.length > 0 ? (
                    sortedTimetable.map((item, index) => (
                        <PeriodCard
                            key={index} 
                            item={item} 
                            isActive={item.isSubstitution} 
                        />
                    ))
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

export default TimeTable;
