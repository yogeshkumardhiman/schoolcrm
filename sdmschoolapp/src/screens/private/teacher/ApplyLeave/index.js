import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { Calendar as CalendarIcon, Clock, MessageSquare, ShieldCheck, X, FileText, ChevronRight, History } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import CustomCalendar from '../../../../components/CustomCalendar';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import Skeleton from '../../../../components/common/Skeleton';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { StatusModal } from '../../../../components/common/StatusModal';
import { requestLeave, fetchMyLeaves } from '../../../../slices/teacher';
import { CustomButton } from '../../../../components/CustomButton';

const ApplyLeave = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { primaryColor, secondaryColor } = useSelector(state => state.config || {});
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [leaveType, setLeaveType] = useState('FULL_DAY');
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [pickerType, setPickerType] = useState('start'); // 'start' or 'end'
    const [myLeaves, setMyLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'info', title: '', message: '' });

    useEffect(() => {
        const loadLeaveHistory = () => {
            setLoading(true);
            dispatch(fetchMyLeaves((res) => {
                if (res) setMyLeaves(res);
                setLoading(false);
            }));
        };
        loadLeaveHistory();
    }, [dispatch]);

    const handleApply = () => {
        if (!reason.trim()) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'INPUT REQUIRED',
                message: 'Please provide a strategic reason for your absence petition.'
            });
            return;
        }

        const payload = {
            startDate,
            endDate,
            reason,
            type: leaveType
        };

        setSubmitting(true);
        dispatch(requestLeave(payload, (res) => {
            setSubmitting(false);
            if (res) {
                setStatusModal({
                    visible: true,
                    type: 'success',
                    title: 'PETITION SUBMITTED',
                    message: 'Your leave petition has been logged and is awaiting administrative authorization.',
                    onConfirm: () => navigation.goBack()
                });
            }
        }));
    };

    const openCalendar = (type) => {
        setPickerType(type);
        setIsCalendarVisible(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return COLORS.green;
            case 'REJECTED': return COLORS.red;
            default: return COLORS.orange || '#F59E0B';
        }
    };

    return (
        <Wrapper
            noTopInset={true}
            showHeader
            headerProps={{
                title: STRINGS.leaveGovernance,
                showBack: true,
                paddingBottom: 20
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* 📝 PETITION FORM */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{STRINGS.newAbsencePetition}</Text>
                    </View>

                    <View style={styles.formCard}>
                        {/* Date Range Selection */}
                        <View style={styles.dateRangeRow}>
                            <TouchableOpacity 
                                style={styles.dateSelector}
                                onPress={() => openCalendar('start')}
                            >
                                <Text style={styles.inputLabel}>{STRINGS.startDate}</Text>
                                <View style={styles.dateDisplay}>
                                    <CalendarIcon size={16} color={primaryColor || COLORS.primary} />
                                    <Text style={[styles.dateText, { color: primaryColor || COLORS.primary }]}>{startDate}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.dateConnector}>
                                <ChevronRight size={20} color={COLORS.gray + '50'} />
                            </View>

                            <TouchableOpacity 
                                style={styles.dateSelector}
                                onPress={() => openCalendar('end')}
                            >
                                <Text style={styles.inputLabel}>{STRINGS.endDate}</Text>
                                <View style={styles.dateDisplay}>
                                    <CalendarIcon size={16} color={primaryColor || COLORS.primary} />
                                    <Text style={[styles.dateText, { color: primaryColor || COLORS.primary }]}>{endDate}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Leave Type Toggle */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{STRINGS.petitionType}</Text>
                            <View style={styles.typeSwitcher}>
                                <TouchableOpacity
                                    onPress={() => setLeaveType('FULL_DAY')}
                                    style={[styles.typeBtn, leaveType === 'FULL_DAY' && styles.typeActive]}
                                >
                                    <Text style={[styles.typeText, leaveType === 'FULL_DAY' && styles.typeActiveText, leaveType === 'FULL_DAY' && { color: primaryColor || COLORS.primary }]}>{STRINGS.fullDay}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setLeaveType('HALF_DAY')}
                                    style={[styles.typeBtn, leaveType === 'HALF_DAY' && styles.typeActive]}
                                >
                                    <Text style={[styles.typeText, leaveType === 'HALF_DAY' && styles.typeActiveText, leaveType === 'HALF_DAY' && { color: primaryColor || COLORS.primary }]}>{STRINGS.halfDay}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Reason Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{STRINGS.reasonForAbsence}</Text>
                            <TextInput
                                placeholder="Strategic reason for petition..."
                                style={styles.reasonInput}
                                placeholderTextColor={COLORS.gray + '80'}
                                multiline
                                value={reason}
                                onChangeText={setReason}
                            />
                        </View>

                        {/* Submit Action */}
                        <CustomButton
                            title={STRINGS.commitPetition}
                            icon={ShieldCheck}
                            onPress={handleApply}
                            loading={submitting}
                            disabled={submitting}
                            style={{
                                height: 56,
                                borderRadius: 16,
                                marginTop: 24,
                            }}
                            colors={[primaryColor || COLORS.primary, secondaryColor || primaryColor || COLORS.primary]}
                        />
                    </View>

                    {/* 📜 DISCOVERY LOG (History) */}
                    <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <History size={18} color={COLORS.secondary} />
                            <Text style={styles.sectionTitle}>{STRINGS.petitionHistory}</Text>
                        </View>
                    </View>

                    <View style={styles.historyContainer}>
                        {loading ? (
                            <View style={{ gap: 15 }}>
                                {[1, 2].map(i => (
                                    <View key={i} style={styles.historyCard}>
                                        <View style={styles.historyMain}>
                                            <View style={styles.historyInfo}>
                                                <Skeleton width={180} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                                                <Skeleton width={120} height={12} borderRadius={4} />
                                            </View>
                                            <Skeleton width={80} height={24} borderRadius={10} />
                                        </View>
                                        <View style={styles.historyFooter}>
                                            <Skeleton width={100} height={10} borderRadius={4} />
                                            <View style={styles.dot} />
                                            <Skeleton width={60} height={10} borderRadius={4} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : myLeaves.length > 0 ? (
                            myLeaves.map((item, index) => (
                                <View key={index} style={styles.historyCard}>
                                    <View style={styles.historyMain}>
                                        <View style={styles.historyInfo}>
                                            <Text style={styles.historyDates}>{item.startDate} {item.startDate !== item.endDate ? `to ${item.endDate}` : ''}</Text>
                                            <Text style={styles.historyReason} numberOfLines={1}>{item.reason}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.historyFooter}>
                                        <Clock size={12} color={COLORS.gray} />
                                        <Text style={styles.historyTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                        <View style={styles.dot} />
                                        <Text style={styles.historyTime}>{item.type.replace('_', ' ')}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <FileText size={40} color={COLORS.gray + '40'} />
                                <Text style={styles.emptyText}>{STRINGS.noActivePetitions}</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* 🗓️ CALENDAR MODAL SECTOR */}
                <Modal
                    visible={isCalendarVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsCalendarVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setIsCalendarVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>SELECT {pickerType === 'start' ? STRINGS.startDate : STRINGS.endDate}</Text>
                                <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                                    <X size={24} color={COLORS.secondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.calendarWrapper}>
                                <CustomCalendar
                                    hideLegend={true}
                                    current={pickerType === 'start' ? startDate : endDate}
                                    minDate={new Date().toISOString().split('T')[0]}
                                    onDayPress={(day) => {
                                        if (pickerType === 'start') setStartDate(day.dateString);
                                        else setEndDate(day.dateString);
                                        setIsCalendarVisible(false);
                                    }}
                                    markedDates={{
                                        [pickerType === 'start' ? startDate : endDate]: { selected: true }
                                    }}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <StatusModal
                    visible={statusModal.visible}
                    type={statusModal.type}
                    title={statusModal.title}
                    message={statusModal.message}
                    onClose={() => setStatusModal({ ...statusModal, visible: false })}
                    onOk={() => {
                        setStatusModal({ ...statusModal, visible: false });
                        if (statusModal.onConfirm) statusModal.onConfirm();
                    }}
                />
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default ApplyLeave;
