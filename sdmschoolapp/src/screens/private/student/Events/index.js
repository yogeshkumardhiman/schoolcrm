import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, RefreshControl } from 'react-native';
import { Calendar as LucideCalendar, Trophy, Clock, MapPin, Users, ChevronLeft, Share2, Sparkles, BookOpen, Music } from 'lucide-react-native';
import CustomCalendar from '../../../../components/CustomCalendar';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getEventsRecord } from '../../../../slices/student';

const StudentEvents = ({ navigation }) => {
    const dispatch = useDispatch();
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const getLocalDateString = (date = new Date()) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDateString());

    const fetchEvents = useCallback(() => {
        setRefreshing(true);
        dispatch(getEventsRecord((data) => {
            setRefreshing(false);
            if (data) {
                setEvents(data);
            }
        }));
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [fetchEvents])
    );

    // Format events for react-native-calendars
    const getMarkedDates = () => {
        const marked = {};
        
        events.forEach((item) => {
            if (item.date) {
                let dotColor = '#4F46E5'; // Default indigo
                if (item.type === 'HOLIDAY') {
                    dotColor = '#EF4444'; // Red/Rose
                } else if (item.type === 'GOVT_HOLIDAY') {
                    dotColor = '#F59E0B'; // Orange/Amber
                } else if (item.type === 'EVENT') {
                    dotColor = '#8B5CF6'; // Purple
                } else if (item.color) {
                    dotColor = item.color;
                }

                marked[item.date] = {
                    marked: true,
                    dotColor: dotColor,
                };
            }
        });

        // Add selected day highlight
        marked[selectedDate] = {
            ...marked[selectedDate],
            selected: true,
            selectedColor: '#4F46E5',
            selectedTextColor: '#FFFFFF',
        };

        return marked;
    };

    const handleShare = async (event) => {
        try {
            const dateStr = new Date(event.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            await Share.share({
                title: event.title,
                message: `📢 *SDM School Calendar Broadcast* 📢\n\n📅 *Event:* ${event.title}\n🗓️ *Date:* ${dateStr}\n⏰ *Time:* ${event.time || 'All Day'}\n📍 *Venue:* ${event.location || 'Main Campus'}\n👥 *Target:* ${event.participants || 'All Students'}\n\n_${event.description || ''}_`,
            });
        } catch (error) {
            console.log('Share failure', error);
        }
    };

    // Filter events happening on the selected day
    const selectedDayEvents = events.filter((e) => {
        if (e.endDate && e.endDate !== e.date) {
            return selectedDate >= e.date && selectedDate <= e.endDate;
        }
        return e.date === selectedDate;
    });

    // Future upcoming events
    const upcomingEvents = events
        .filter((e) => e.date >= new Date().toISOString().split('T')[0])
        .sort((a, b) => a.date.localeCompare(b.date));

    // Category styling helper
    const getCategoryDetails = (type) => {
        switch (type) {
            case 'HOLIDAY':
                return { label: 'School Holiday', color: '#EF4444', icon: Sparkles };
            case 'GOVT_HOLIDAY':
                return { label: 'Govt. Gazetted Holiday', color: '#F59E0B', icon: BookOpen };
            case 'EVENT':
            default:
                return { label: 'School Event', color: '#8B5CF6', icon: Trophy };
        }
    };

    const getEventIcon = (iconName) => {
        switch (iconName?.toLowerCase()) {
            case 'music': return Music;
            case 'book': return BookOpen;
            case 'trophy': return Trophy;
            default: return Trophy;
        }
    };

    return (
        <Wrapper
            showHeader
            headerProps={{
                showBack: true,
                theme: 'light',
                title: 'Academic Calendar',
            }}
        >
            <View style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchEvents}
                            colors={['#4F46E5']}
                            tintColor="#4F46E5"
                        />
                    }
                >
                    
                    {/* Modern Calendar Grid */}
                    <CustomCalendar
                        selectedDate={selectedDate}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={getMarkedDates()}
                    />

                    {/* Selected Day Agenda Header */}
                    <View style={{ paddingHorizontal: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Black, color: '#0F172A', textTransform: 'uppercase', tracking: 1.5 }}>
                            Selected Date Agenda
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: '#64748B' }}>
                            {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </Text>
                    </View>

                    {/* Selected Day Agenda Cards */}
                    <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
                        {selectedDayEvents.length === 0 ? (
                            <View style={{ backgroundColor: '#FFFFFF', padding: 25, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#CBD5E1' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                    <Sparkles size={20} color="#94A3B8" />
                                </View>
                                <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Black, color: '#475569', textTransform: 'uppercase' }}>Rest & Self Study Day</Text>
                                <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Bold, color: '#94A3B8', marginTop: 2, textAlign: 'center' }}>No administrative schedules committed for this date.</Text>
                            </View>
                        ) : (
                            selectedDayEvents.map((item) => {
                                const cat = getCategoryDetails(item.type);
                                const IconComponent = getEventIcon(item.icon) || Trophy;
                                return (
                                    <View key={item.id} style={styles.eventCardDetail}>
                                        <View style={[styles.eventHeader, { backgroundColor: cat.color }]}>
                                            <IconComponent size={20} color={COLORS.white} />
                                            <View style={styles.eventHeaderInfo}>
                                                <Text style={styles.eventTitleDetail}>{item.title}</Text>
                                                <Text style={styles.eventDateDetail}>
                                                    {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {item.endDate && item.endDate !== item.date && (
                                                        <> - {new Date(item.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                    )}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.eventBody}>
                                            {item.description ? (
                                                <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.SemiBold, color: '#475569', marginBottom: 16, lineHeight: 18 }}>
                                                    {item.description}
                                                </Text>
                                            ) : null}

                                            <View style={styles.detailRow}>
                                                <View style={styles.iconBox}>
                                                    <Clock size={16} color="#64748B" />
                                                </View>
                                                <View>
                                                    <Text style={styles.detailLabel}>Time Interval</Text>
                                                    <Text style={styles.detailValue}>{item.time || 'All Day'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <View style={styles.iconBox}>
                                                    <MapPin size={16} color="#64748B" />
                                                </View>
                                                <View>
                                                    <Text style={styles.detailLabel}>Location</Text>
                                                    <Text style={styles.detailValue}>{item.location || 'Main Campus'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <View style={styles.iconBox}>
                                                    <Users size={16} color="#64748B" />
                                                </View>
                                                <View>
                                                    <Text style={styles.detailLabel}>Participants</Text>
                                                    <Text style={styles.detailValue}>{item.participants || 'All Classes'}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.actionRow}>
                                            <TouchableOpacity 
                                                onPress={() => handleShare(item)}
                                                style={[styles.secondaryBtn, { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }]}
                                            >
                                                <Share2 size={16} color={COLORS.secondary} />
                                                <Text style={styles.secondaryBtnText}>Share Invitation</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    {/* Upcoming Chronicle list */}
                    <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Black, color: '#0F172A', textTransform: 'uppercase', tracking: 1.5, marginBottom: 12 }}>
                            Upcoming School Calendar Chronicle
                        </Text>
                        
                        {upcomingEvents.slice(0, 5).map((item) => {
                            const cat = getCategoryDetails(item.type);
                            return (
                                <TouchableOpacity 
                                    key={item.id}
                                    onPress={() => setSelectedDate(item.date)}
                                    style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 18, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F1F5F9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5 }}
                                >
                                    <View style={{ flex: 1, gap: 4 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cat.color }} />
                                            <Text style={{ fontSize: 8.5, fontFamily: fontFamily.Poppins.Bold, color: '#94A3B8', textTransform: 'uppercase' }}>
                                                {cat.label}
                                            </Text>
                                        </View>
                                        <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Black, color: '#1E293B', textTransform: 'uppercase' }} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Bold, color: '#64748B' }}>
                                            {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            {item.endDate && item.endDate !== item.date && (
                                                <> - {new Date(item.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>
                                            )}
                                        </Text>
                                    </View>
                                    
                                    <View style={{ width: 34, height: 34, backgroundColor: '#F8FAFC', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                        <LucideCalendar size={16} color="#64748B" />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>
        </Wrapper>
    );
};

export default StudentEvents;
