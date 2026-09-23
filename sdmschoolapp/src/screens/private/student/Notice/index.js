import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { Megaphone, Award, Users, Bell, ChevronRight, Filter, Search, MessageSquare } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily, getResolvedUrl } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getInstitutionalNotices } from '../../../../slices/student';
import Skeleton from '../../../../components/common/Skeleton';

// Save the maximum notice ID loaded as last read
const updateLastRead = async (noticeList) => {
    try {
        if (noticeList && noticeList.length > 0) {
            const ids = noticeList.map(n => Number(n.id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                const maxId = Math.max(...ids);
                await AsyncStorage.setItem('lastReadNoticeId', String(maxId));
            }
        }
    } catch (e) {
        console.error("Failed to save last read notice ID:", e);
    }
};

const StudentNotice = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { primaryColor, logoUrl } = useSelector(state => state.config);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const scrollY = useRef(new Animated.Value(0)).current;

    const isValidUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.trim().toLowerCase().startsWith('http');
    };

    // Load notices dynamically for current page
    const loadNotices = React.useCallback((targetPage, isRefresh = false) => {
        if (!isRefresh && targetPage === 1) setLoading(true);
        if (targetPage > 1) setLoadingMore(true);

        dispatch(getInstitutionalNotices(user?.class, user?.section, user?.id, targetPage, 10, (data) => {
            if (data && data.notices) {
                if (targetPage === 1) {
                    setNotices(data.notices);
                } else {
                    setNotices(prev => {
                        // Avoid duplicates if multiple calls happen
                        const existingIds = new Set(prev.map(n => n.id));
                        const newNotices = data.notices.filter(n => !existingIds.has(n.id));
                        return [...prev, ...newNotices];
                    });
                }
                setTotalPages(data.totalPages || 1);
                setTotalCount(data.totalCount || 0);
                updateLastRead(data.notices);
            } else if (Array.isArray(data)) {
                if (targetPage === 1) setNotices(data);
                setTotalPages(1);
                updateLastRead(data);
            } else if (targetPage === 1) {
                setNotices([]);
                setTotalPages(1);
            }
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }));
    }, [user?.class, user?.section, user?.id, dispatch]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        loadNotices(1, true);
    };

    useEffect(() => {
        loadNotices(page);
    }, [loadNotices, page]);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    };

    // 🎨 Helper to match tag designs with premium color tints
    const getNoticeDesign = (tag = '') => {
        const cleanTag = (tag || '').toUpperCase();
        if (cleanTag.includes('HOLIDAY')) {
            return {
                color: '#EF4444', // Red
                bgColor: '#FFF1F2', // Pinkish Red Tint
                Icon: Megaphone
            };
        } else if (cleanTag.includes('RESULT') || cleanTag.includes('MARK')) {
            return {
                color: '#6C63FF', // Violet/Indigo
                bgColor: '#EEF2FF', // Violet Tint
                Icon: Award
            };
        } else if (cleanTag.includes('SUBSTITUTION') || cleanTag.includes('TEACHER')) {
            return {
                color: '#10B981', // Green
                bgColor: '#ECFDF5', // Green Tint
                Icon: Users
            };
        } else if (cleanTag.includes('DIRECT') || cleanTag.includes('PERSONAL')) {
            return {
                color: primaryColor || '#2563EB',
                bgColor: primaryColor ? `${primaryColor}15` : '#EFF6FF',
                Icon: MessageSquare,
                isAppLogo: false
            };
        } else {
            return {
                color: '#06B6D4', // Cyan Blue
                bgColor: '#ECFEFF', // Cyan Tint
                Icon: Bell
            };
        }
    };

    // 📅 Helper to group notices dynamically by month
    const groupNoticesByMonth = (noticesList) => {
        const groups = {};
        noticesList.forEach(item => {
            let monthYear = 'Announcements';
            try {
                if (item.date && typeof item.date === 'string') {
                    const parts = item.date.split('/');
                    if (parts.length === 3) {
                        const dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                        if (!isNaN(dateObj.getTime())) {
                            monthYear = dateObj.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                        }
                    } else {
                        const dateObj = new Date(item.date);
                        if (!isNaN(dateObj.getTime())) {
                            monthYear = dateObj.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                        }
                    }
                }
            } catch (e) {
                console.log("[Notice Date Parse Error]:", e);
            }
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(item);
        });
        return groups;
    };

    const filteredNotices = notices.filter(n => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (n.title || '').toLowerCase().includes(q) || 
               (n.content || '').toLowerCase().includes(q) ||
               (n.tag || '').toLowerCase().includes(q);
    });

    const groupedNotices = groupNoticesByMonth(filteredNotices);

    return (
        <Wrapper
            showHeader
            statusBarColor="#FFFFFF"
            statusBarStyle="dark-content"
            headerProps={{
                title: "Notice Board",
                showBack: false,
                theme: 'light',
                rightComponent: (
                    <TouchableOpacity
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={0.7}
                    >
                        <Filter size={16} color="#1F2937" />
                    </TouchableOpacity>
                )
            }}
        >
            <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 44 }}>
                        <Search size={18} color="#64748B" />
                        <TextInput 
                            style={{ flex: 1, marginLeft: 8, fontFamily: fontFamily.Poppins.Medium, fontSize: 13, color: '#1E293B', padding: 0 }}
                            placeholder="Search notices..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.container}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[primaryColor || '#2563EB']}
                        />
                    }
                >
                    <View style={styles.mainContent}>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <View key={i} style={[styles.figmaNoticeCard, { padding: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' }]}>
                                    <View style={[styles.figmaIconBox, { backgroundColor: '#F1F5F9' }]} />
                                    <View style={{ flex: 1 }}>
                                        <Skeleton width="40%" height={12} borderRadius={4} style={{ marginBottom: 12 }} />
                                        <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                                        <Skeleton width="100%" height={14} borderRadius={4} />
                                    </View>
                                </View>
                            ))
                        ) : notices.length === 0 ? (
                            /* Empty State Message */
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, paddingHorizontal: 32 }}>
                                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                                    <Bell size={36} color="#2563EB" strokeWidth={1.8} />
                                </View>
                                <Text style={{ fontSize: 16, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
                                    No Notices Found
                                </Text>
                                <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Medium, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 }}>
                                    You're all caught up! There are no new announcements, notices, or reminders for you at this moment.
                                </Text>
                            </View>
                        ) : (
                            Object.keys(groupedNotices).map(monthName => (
                                <View key={monthName} style={{ marginBottom: 16 }}>
                                    {/* Group Header Month Name */}
                                    <View style={{ marginBottom: 12, marginTop: 4, paddingLeft: 4 }}>
                                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            {monthName}
                                        </Text>
                                    </View>

                                    {/* Notices in Group */}
                                    {groupedNotices[monthName].map(item => {
                                        const design = getNoticeDesign(item.tag);
                                        const CardIcon = design.Icon;
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[styles.figmaNoticeCard, { backgroundColor: design.bgColor }]}
                                                onPress={() => navigation.navigate('StudentNoticeDetail', { notice: item })}
                                                activeOpacity={0.85}
                                            >
                                                {/* Left Side Icon Box */}
                                                <View style={[styles.figmaIconBox, design.isAppLogo && { backgroundColor: '#FFFFFF', overflow: 'hidden', padding: 2 }]}>
                                                    {design.isAppLogo ? (
                                                        <Image 
                                                            source={{ uri: getResolvedUrl(logoUrl) }} 
                                                            style={{ width: '100%', height: '100%', borderRadius: 18 }} 
                                                            resizeMode="contain" 
                                                        />
                                                    ) : (
                                                        <CardIcon size={20} color={design.color} />
                                                    )}
                                                </View>

                                                {/* Center Text Details */}
                                                <View style={styles.figmaNoticeContent}>
                                                    <Text style={[styles.figmaNoticeTag, { color: design.color }]}>
                                                        {item.tag || 'NOTICE'}
                                                    </Text>
                                                    <Text style={styles.figmaNoticeTitle} numberOfLines={1}>
                                                        {item.title}
                                                    </Text>
                                                    <Text numberOfLines={2} style={styles.figmaNoticePreview}>
                                                        {item.content}
                                                    </Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                                        <Text style={[styles.figmaNoticeDate, { marginTop: 0 }]}>
                                                            {item.date}
                                                        </Text>
                                                        {item.createdAt && (
                                                            <Text style={{ fontSize: 9.5, fontFamily: fontFamily.Poppins.Medium, color: '#94A3B8' }}>
                                                                •  {formatTime(item.createdAt)}
                                                            </Text>
                                                        )}
                                                        {item.createdByRole && (
                                                            <Text style={{ fontSize: 9.5, fontFamily: fontFamily.Poppins.SemiBold, color: design.color, textTransform: 'capitalize', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }}>
                                                                By {item.createdByRole.toLowerCase()}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Right Chevron */}
                                                <ChevronRight size={18} color={design.color} style={styles.figmaChevron} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))
                        )}

                        {/* Pagination Page Selector Controls */}
                        {!loading && page < totalPages && !searchQuery && (
                            <TouchableOpacity
                                onPress={() => setPage(page + 1)}
                                disabled={loadingMore}
                                style={{
                                    alignSelf: 'center',
                                    paddingVertical: 12,
                                    paddingHorizontal: 24,
                                    borderRadius: 24,
                                    backgroundColor: primaryColor || '#2563EB',
                                    marginBottom: 30,
                                    marginTop: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    shadowColor: primaryColor || '#2563EB',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4
                                }}
                            >
                                {loadingMore && <ActivityIndicator size="small" color="#FFFFFF" />}
                                <Text style={{ color: '#FFFFFF', fontFamily: fontFamily.Poppins.Bold, fontSize: 13, letterSpacing: 0.5 }}>
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ height: 100 }} />
                </Animated.ScrollView>
            </View>
        </Wrapper>
    );
};

export default StudentNotice;
