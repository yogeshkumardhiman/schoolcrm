import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { BookOpen, Filter } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import HomeworkItem from '../../../../components/Cards/HomeworkItem';
import { getHomeworkRecords, getHomeworkStatus, updateHomeworkStatus } from '../../../../slices/student';
import Skeleton from '../../../../components/common/Skeleton';
import { StatusModal } from '../../../../components/common/StatusModal';

const StudentHomework = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const scrollY = useRef(new Animated.Value(0)).current;

    const [homeworkList, setHomeworkList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', type: 'info', onOk: null });
    const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'PENDING', 'COMPLETED'

    const fetchHomework = React.useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch Class Homework
            dispatch(getHomeworkRecords(user?.class, user?.section || 'A', async (hwData) => {
                if (hwData) {
                    try {
                        // 2. Fetch Personal Statuses
                        dispatch(getHomeworkStatus(user?.id || user?._id, (statuses) => {
                            const hwStatuses = statuses || [];

                            // 3. Merge Statuses
                            const merged = hwData.map(hw => {
                                const match = hwStatuses.find(s => String(s.homeworkId) === String(hw.id || hw._id));
                                return { 
                                    ...hw, 
                                    status: match ? match.status : 'PENDING',
                                    feedback: match ? match.feedback : null,
                                    grade: match ? match.grade : null
                                };
                            });
                            setHomeworkList(merged);
                            setLoading(false);
                            setRefreshing(false);
                        }));
                    } catch (e) {
                        setHomeworkList(hwData);
                        setLoading(false);
                        setRefreshing(false);
                    }
                } else {
                    setLoading(false);
                    setRefreshing(false);
                }
            }));
        } catch (error) {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.class, user?.section, user?.id, user?._id, dispatch]);

    useEffect(() => {
        fetchHomework();
    }, [fetchHomework]);

    const handleMarkComplete = (item) => {
        setStatusModal({
            visible: true,
            title: 'TASK COMPLETION',
            message: `Are you sure you have completed the ${item.subject} assignment: "${item.title}"?`,
            type: 'info',
            onOk: async () => {
                try {
                    setRefreshing(true);
                    dispatch(updateHomeworkStatus({
                        studentId: user?.id || user?._id,
                        homeworkId: item.id || item._id,
                        status: 'COMPLETED'
                    }, (success) => {
                        if (success) {
                            fetchHomework();
                        } else {
                            Alert.alert('Protocol Error', 'Failed to update task status.');
                            setRefreshing(false);
                        }
                    }));
                } catch (e) {
                    Alert.alert('Protocol Error', 'Failed to update task status.');
                    setRefreshing(false);
                }
            }
        });
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchHomework();
    }, [fetchHomework]);
    const pendingCount = homeworkList.filter(i => i.status !== 'COMPLETED').length;
    const completedCount = homeworkList.length - pendingCount;

    const filteredHomeworkList = homeworkList.filter(item => {
        if (selectedFilter === 'PENDING') {
            return item.status !== 'COMPLETED';
        }
        if (selectedFilter === 'COMPLETED') {
            return item.status === 'COMPLETED';
        }
        return true;
    });

    return (
        <Wrapper
            showHeader={true}
            scrollY={scrollY}
            headerProps={{
                title: STRINGS.homework,
                showBack: true,
                theme: 'light',
                rightComponent: (
                    <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F7FB', borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
                        <Filter size={16} color="#1F2937" strokeWidth={2.2} />
                    </TouchableOpacity>
                )
            }}
        >
    
        <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.container}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
        >
            {/* 🏷️ FILTER TABS */}
            {!loading && (
                <View style={styles.filterSection}>
                    {['ALL', 'PENDING', 'COMPLETED'].map(filter => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setSelectedFilter(filter)}
                            style={[
                                styles.tab,
                                selectedFilter === filter && styles.activeTab
                            ]}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedFilter === filter && styles.activeTabText
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.mainContent}>
                {loading ? (
                    [1, 2, 3].map(i => (
                        <View key={i} style={[styles.skeletonCard, { marginBottom: 16, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16 }]}>
                            <Skeleton width="40%" height={12} borderRadius={4} style={{ marginBottom: 12 }} />
                            <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                            <Skeleton width="60%" height={12} borderRadius={4} />
                        </View>
                    ))
                ) : filteredHomeworkList.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 80 }}>
                        <BookOpen size={64} color={COLORS.border} />
                        <Text style={{ marginTop: 16, color: COLORS.gray, fontFamily: 'Poppins-SemiBold' }}>
                            {selectedFilter === 'ALL' ? STRINGS.noDataFound : `No ${selectedFilter.toLowerCase()} homework`}
                        </Text>
                    </View>
                ) : (
                    filteredHomeworkList.map(item => (
                        <HomeworkItem
                            key={item.id || item._id}
                            subject={item.subject}
                            title={item.title}
                            dueDate={item.dueDate || 'N/A'}
                            status={item.status}
                            feedback={item.feedback}
                            grade={item.grade}
                            onMarkComplete={() => handleMarkComplete(item)}
                        />
                    ))
                )}
            </View>
            <View style={{ height: 100 }} />
        </Animated.ScrollView>

        <StatusModal
            visible={statusModal.visible}
            title={statusModal.title}
            message={statusModal.message}
            type={statusModal.type}
            onClose={() => setStatusModal({ ...statusModal, visible: false })}
            onOk={() => {
                setStatusModal({ ...statusModal, visible: false });
                if (statusModal.onOk) statusModal.onOk();
            }}
        />
    </Wrapper>
    )

};

export default StudentHomework;
