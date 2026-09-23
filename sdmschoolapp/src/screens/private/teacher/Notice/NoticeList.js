import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { Megaphone, Plus, Bell, ChevronRight, Inbox, Clock } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS, formatDate, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getInstitutionalNotices } from '../../../../slices/teacher'; // Assuming equivalent exists or using general
import Skeleton from '../../../../components/common/Skeleton';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeacherNoticeList = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchNotices = () => {
            setLoading(true);
            // Using institutional notices which usually contain staff/general notices
            dispatch(getInstitutionalNotices(async (data) => {
                if (data) {
                    setNotices(data);
                    if (Array.isArray(data) && data.length > 0) {
                        const maxId = Math.max(...data.map(item => Number(item.id) || 0));
                        try {
                            await AsyncStorage.setItem('lastReadNoticeId', String(maxId));
                        } catch (err) {
                            console.log("Failed to save lastReadNoticeId for teacher", err);
                        }
                    }
                }
                setLoading(false);
            }));
        };
        fetchNotices();
    }, [dispatch]);

    return (
        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            scrollY={scrollY}
            headerProps={{
                title: "COMMUNICATION HUB",
                showBack: true,
                theme: 'dark',
                children: (
                    <View style={styles.summaryCard}>
                        <View style={styles.announcementIcon}>
                            <Megaphone size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.summaryText}>OFFICIAL ACADEMY UPDATES</Text>
                    </View>
                )
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
                    <View style={styles.mainContent}>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <View key={i} style={[styles.noticeCard, { padding: 16 }]}>
                                    <Skeleton width="40%" height={12} borderRadius={4} style={{ marginBottom: 12 }} />
                                    <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                                    <Skeleton width="100%" height={14} borderRadius={4} />
                                </View>
                            ))
                        ) : notices.length > 0 ? (
                            notices.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.noticeCard}
                                    onPress={() => navigation.navigate('StudentNoticeDetail', { notice: item })}
                                >
                                    <View style={styles.noticeHeader}>
                                        <View style={[styles.tagBadge, { backgroundColor: item.color + '15' }]}>
                                            <Text style={[styles.noticeTag, { color: item.color }]}>{item.tag || 'GENERAL'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Clock size={12} color={COLORS.gray} />
                                            <Text style={styles.noticeDate}>{formatDate(item.date)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.noticeTitle}>{item.title}</Text>
                                    <Text numberOfLines={2} style={styles.noticePreview}>{item.content}</Text>

                                    <View style={styles.readMoreRow}>
                                        <Text style={styles.readMoreText}>{STRINGS.seeAll}</Text>
                                        <ChevronRight size={14} color={COLORS.primary} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Inbox size={48} color={COLORS.gray + '20'} />
                                <Text style={styles.emptyTitle}>Empty Inbox</Text>
                                <Text style={styles.emptyDesc}>No institutional notices have been issued yet.</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ height: 120 }} />
                </Animated.ScrollView>

                {/* 🚀 EMIT NOTICE FAB */}
                <TouchableOpacity 
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddNotice')}
                >
                    <Plus size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </Wrapper>
    );
};

export default TeacherNoticeList;
