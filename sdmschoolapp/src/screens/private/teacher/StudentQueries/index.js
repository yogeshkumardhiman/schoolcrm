import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Clock, X, Search, Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { StatusModal } from '../../../../components/common/StatusModal';
import { getStudentQueries, respondToQuery, getAllStudentQueries } from '../../../../slices/teacher';
import QueryCard from './QueryCard';
import Skeleton from '../../../../components/common/Skeleton';
import CustomCalendar from '../../../../components/CustomCalendar';
import moment from 'moment';

const QuerySkeleton = () => (
    <View style={styles.queryCard}>
        <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Skeleton width={48} height={48} borderRadius={14} />
                <View style={{ gap: 6 }}>
                    <Skeleton width={120} height={16} borderRadius={4} />
                    <Skeleton width={80} height={12} borderRadius={4} />
                </View>
            </View>
            <Skeleton width={100} height={20} borderRadius={8} />
        </View>
        <Skeleton width="100%" height={60} borderRadius={16} style={{ marginBottom: 15 }} />
        <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 }}>
            <Skeleton width="100%" height={48} borderRadius={12} />
        </View>
    </View>
);

const StudentQueries = () => {
    const { user, role } = useSelector(state => state.auth);
    const isAdmin = role?.toLowerCase()?.includes('admin') || role === 'SUPER_ADMIN';
    const [queries, setQueries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, PENDING, RESOLVED
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // 📅 DATE FILTER STATES
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [showCalendar, setShowCalendar] = useState(false);
    const [isMonthFilter, setIsMonthFilter] = useState(true); // Toggle between specific date and whole month
    
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'success', title: '', message: '' });

    const dispatch = useDispatch();

    const fetchQueries = React.useCallback(() => {
        setLoading(true);
        if (isAdmin) {
            dispatch(getAllStudentQueries((res) => {
                if (res) {
                    setQueries(res);
                }
                setLoading(false);
                setRefreshing(false);
            }));
        } else {
            dispatch(getStudentQueries(user?.class, user?.section || 'A', (res) => {
                console.log(`[DEBUG] Fetched ${res?.length || 0} queries for ${user?.class}-${user?.section}`);
                if (res) {
                    setQueries(res);
                }
                setLoading(false);
                setRefreshing(false);
            }));
        }
    }, [isAdmin, dispatch, user?.class, user?.section]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchQueries();
    }, [fetchQueries]);

    useEffect(() => {
        fetchQueries();
    }, [fetchQueries]);

    const handleReply = () => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        const payload = {
            teacherReply: replyText,
            responderName: user.name
        };

        dispatch(respondToQuery(selectedQuery.id || selectedQuery._id, payload, (res) => {
            setSubmitting(false);
            if (res) {
                setQueries(queries.map(q => 
                    (q.id === selectedQuery.id || q._id === selectedQuery._id) 
                    ? { ...q, teacherReply: replyText, status: 'RESOLVED' } 
                    : q
                ));
                setSelectedQuery(null);
                setReplyText('');
                setStatusModal({ 
                    visible: true, 
                    type: 'success', 
                    title: 'RESPONSE COMMITTED', 
                    message: "The scholar has been notified of your resolution." 
                });
            } else {
                setStatusModal({ 
                    visible: true, 
                    type: 'error', 
                    title: 'COMMITMENT FAILED', 
                    message: "Failed to commit resolution to institutional vault." 
                });
            }
        }));
    };

    // 🔍 ANALYTICS & FILTERING LOGIC
    const activeDateQueries = useMemo(() => {
        return queries.filter(q => {
            const qDate = moment(q.date);
            if (isMonthFilter) {
                return qDate.format('MM-YYYY') === moment(selectedDate).format('MM-YYYY');
            }
            return qDate.format('YYYY-MM-DD') === selectedDate;
        });
    }, [queries, selectedDate, isMonthFilter]);

    const filteredQueries = useMemo(() => {
        return activeDateQueries.filter(q => {
            const matchesSearch = (q.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 q.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 q.message?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = activeFilter === 'ALL' || 
                               (activeFilter === 'PENDING' && q.status !== 'RESOLVED') || 
                               (activeFilter === 'RESOLVED' && q.status === 'RESOLVED');
            return matchesSearch && matchesStatus;
        }).sort((a,b) => (a.status === 'RESOLVED' ? 1 : -1));
    }, [activeDateQueries, searchQuery, activeFilter]);

    const renderListHeader = () => (
        <View style={{ paddingBottom: 10 }}>
            {/* 📊 TELEMETRY BANNER (Context Aware) */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statVal}>{activeDateQueries.length}</Text>
                    <Text style={styles.statLab}>{isMonthFilter ? 'MONTHLY' : 'DAILY'}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#EEF2F6' }]}>
                    <Text style={[styles.statVal, { color: '#F59E0B' }]}>
                        {activeDateQueries.filter(q => q.status !== 'RESOLVED').length}
                    </Text>
                    <Text style={styles.statLab}>PENDING</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statVal, { color: '#10B981' }]}>
                        {activeDateQueries.filter(q => q.status === 'RESOLVED').length}
                    </Text>
                    <Text style={styles.statLab}>RESOLVED</Text>
                </View>
            </View>

            {/* 🗓️ DATE SELECTOR BAR */}
            <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0F7FF', padding: 12, borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CalendarIcon size={18} color={COLORS.primary} />
                    <Text style={{ fontFamily: fontFamily.Poppins.Bold, color: COLORS.secondary, fontSize: 13 }}>
                        {isMonthFilter ? moment(selectedDate).format('MMMM YYYY') : moment(selectedDate).format('DD MMMM YYYY')}
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={() => setShowCalendar(true)}
                    style={{ backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary + '30' }}
                >
                    <Text style={{ color: COLORS.primary, fontSize: 10, fontFamily: fontFamily.Poppins.Black }}>CHANGE PERIOD</Text>
                </TouchableOpacity>
            </View>

            {/* 🔍 SEARCH & FILTERS */}
            <View style={styles.filterSection}>
                <View style={styles.searchContainer}>
                    <Search size={18} color="#94A3B8" />
                    <TextInput 
                        placeholder="Find scholar or subject..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94A3B8"
                    />
                </View>
                <View style={styles.tabsContainer}>
                    {['ALL', 'PENDING', 'RESOLVED'].map(f => (
                        <TouchableOpacity 
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            style={[styles.tab, activeFilter === f && styles.activeTab]}
                        >
                            <Text style={[styles.tabText, activeFilter === f && styles.activeTabText]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <Wrapper noTopInset={true} translucent={true} showHeader headerProps={{ title: STRINGS.scholarQueries.toUpperCase(), showBack: true }}>
            <FlatList
                data={filteredQueries}
                keyExtractor={(item) => (item.id || item._id).toString()}
                contentContainerStyle={styles.scrollContent}
                ListHeaderComponent={renderListHeader}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <QueryCard 
                        item={item}
                        strings={STRINGS}
                        onRespond={(q) => {
                            setSelectedQuery(q);
                            setReplyText('');
                        }}
                        onEdit={(q) => {
                            setSelectedQuery(q);
                            setReplyText(q.teacherReply || '');
                        }}
                    />
                )}
                ListEmptyComponent={() => loading ? (
                    <View>
                        <QuerySkeleton />
                        <QuerySkeleton />
                        <QuerySkeleton />
                    </View>
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 80 }}>
                        <Clock size={64} color="#CBD5E1" />
                        <Text style={{ marginTop: 20, color: '#94A3B8', fontFamily: fontFamily.Poppins.ExtraBold }}>NO DATA FOR THIS PERIOD</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>Try selecting another date or clear filters</Text>
                    </View>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />

            {/* 🗓️ CALENDAR MODAL */}
            <Modal visible={showCalendar} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={styles.modalTitle}>SELECT PERIOD</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <X size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            <TouchableOpacity 
                                onPress={() => setIsMonthFilter(true)}
                                style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: isMonthFilter ? COLORS.primary : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text style={{ color: isMonthFilter ? COLORS.white : '#64748B', fontFamily: fontFamily.Poppins.Bold, fontSize: 12 }}>MONTH VIEW</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setIsMonthFilter(false)}
                                style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: !isMonthFilter ? COLORS.primary : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text style={{ color: !isMonthFilter ? COLORS.white : '#64748B', fontFamily: fontFamily.Poppins.Bold, fontSize: 12 }}>SINGLE DAY</Text>
                            </TouchableOpacity>
                        </View>

                        <CustomCalendar
                            hideLegend={true}
                            current={selectedDate}
                            onDayPress={day => {
                                setSelectedDate(day.dateString);
                                if (!isMonthFilter) setShowCalendar(false);
                            }}
                            markedDates={{
                                [selectedDate]: { selected: true }
                            }}
                        />

                        {isMonthFilter && (
                            <TouchableOpacity 
                                style={[styles.submitBtn, { height: 50, marginTop: 20 }]}
                                onPress={() => setShowCalendar(false)}
                            >
                                <Text style={styles.submitText}>APPLY MONTH FILTER</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            {/* REPLY MODAL */}
            <Modal visible={!!selectedQuery} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={styles.modalTitle}>{STRINGS.respondTo} {selectedQuery?.studentName?.toUpperCase()}</Text>
                            <TouchableOpacity onPress={() => setSelectedQuery(null)}>
                                <X size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.originalMsg}>Q: "{selectedQuery?.message}"</Text>

                        <TextInput
                            style={styles.input}
                            placeholder={STRINGS.typeResponse}
                            multiline
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholderTextColor="#94A3B8"
                        />

                        <TouchableOpacity 
                            style={[styles.submitBtn, (!replyText.trim() || submitting) && { opacity: 0.5 }]} 
                            onPress={handleReply}
                            disabled={submitting || !replyText.trim()}
                        >
                            {submitting ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 12 }} />
                                    <Text style={styles.submitText}>{STRINGS.saving}</Text>
                                </View>
                            ) : (
                                <Text style={styles.submitText}>{STRINGS.submitResponse}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedQuery(null)}>
                            <Text style={styles.cancelText}>{STRINGS.cancelEdit}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <StatusModal
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => setStatusModal({ ...statusModal, visible: false })}
            />
        </Wrapper>
    );
};

export default StudentQueries;
