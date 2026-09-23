import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Send, Book, Users, Calendar, AlertCircle, Info } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { deployHomework } from '../../../../slices/teacher';
import { StatusModal } from '../../../../components/common/StatusModal';
import { CustomButton } from '../../../../components/CustomButton';

const AddHomework = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { primaryColor, secondaryColor } = useSelector(state => state.config || {});
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(user?.subject || 'MATHEMATICS');
    const [isUrgent, setIsUrgent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });

    const handleDeploy = () => {
        if (!title.trim() || !description.trim()) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'MISSING INFORMATION',
                message: STRINGS.provideTitleInstructions
            });
            return;
        }

        setStatusModal({
            visible: true,
            type: 'info',
            title: 'DEPLOYMENT CONFIRMATION',
            message: `${STRINGS.deployToTarget} Class ${user?.class || '10TH'}-${user?.section || 'A'} - ${selectedSubject}?`,
            showCancel: true,
            okTitle: STRINGS.deploy,
            onConfirm: () => {
                const payload = {
                    title,
                    description,
                    subject: selectedSubject,
                    class: user?.class,
                    section: user?.section,
                    teacherId: user?.id || user?._id,
                    teacherName: user?.name,
                    isUrgent,
                    dueDate: new Date(Date.now() + 86400000).toISOString() // Default to tomorrow
                };
                setSubmitting(true);
                dispatch(deployHomework(payload, (res) => {
                    setSubmitting(false);
                    if (res) {
                        setStatusModal({
                            visible: true,
                            type: 'success',
                            title: 'MISSION SUCCESS',
                            message: 'Assignment has been successfully deployed to the class hub.',
                            onConfirm: () => navigation.goBack()
                        });
                    }
                }));
            }
        });
    };

    return (
        <Wrapper 
            showHeader
            headerProps={{
                title: STRINGS.assignmentHub,
                showBack: true,
                children: (
                    <View style={{ width: '100%', marginTop: 8 }}>
                        <View style={styles.metaBadgeRow}>
                            <View style={styles.metaBadge}>
                                <Users size={14} color={primaryColor || COLORS.primary} />
                                <Text style={[styles.metaBadgeText, { color: primaryColor || COLORS.primary }]}>{STRINGS.class.toUpperCase()} {user?.class || '10TH'}-{user?.section || 'A'}</Text>
                            </View>
                            <View style={styles.metaBadge}>
                                <Book size={14} color={primaryColor || COLORS.primary} />
                                <Text style={[styles.metaBadgeText, { color: primaryColor || COLORS.primary }]}>{selectedSubject}</Text>
                            </View>
                        </View>
                    </View>
                )
            }}
        >

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* 📝 ASSIGNMENT FORM */}
                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{STRINGS.assignmentTitle}</Text>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="e.g. Quadratic Equations Revision"
                                placeholderTextColor={COLORS.gray}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{STRINGS.protocolDescription}</Text>
                            <TextInput
                                style={styles.descInput}
                                placeholder={STRINGS.scholarsInstructions}
                                placeholderTextColor={COLORS.gray}
                                multiline
                                numberOfLines={6}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* ⏱️ DEADLINE PROTOCOL */}
                    <TouchableOpacity style={styles.deadlineRow}>
                        <View style={styles.deadlineIconBox}>
                            <Calendar size={20} color={COLORS.secondary} />
                        </View>
                        <View style={styles.deadlineInfo}>
                            <Text style={styles.deadlineLabel}>{STRINGS.submissionDeadline}</Text>
                            <Text style={styles.deadlineValue}>APRIL 12, 2026</Text>
                        </View>
                        <ChevronLeft size={20} color={COLORS.gray} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    {/* ⚠️ PRIORITY FLAG */}
                    <TouchableOpacity
                        style={[
                            styles.priorityCard, 
                            isUrgent && styles.urgentActive,
                            isUrgent && primaryColor && { backgroundColor: primaryColor, borderColor: primaryColor }
                        ]}
                        onPress={() => setIsUrgent(!isUrgent)}
                    >
                        <AlertCircle size={22} color={isUrgent ? COLORS.white : COLORS.secondary} />
                        <View style={styles.priorityTextContainer}>
                            <Text style={[styles.priorityTitle, isUrgent && { color: COLORS.white }]}>{STRINGS.flagAsUrgent}</Text>
                            <Text style={[styles.priorityDesc, isUrgent && { color: 'rgba(255,255,255,0.7)' }]}>{STRINGS.urgentNotifyDesc}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.infoBox}>
                        <Info size={18} color={COLORS.gray} />
                        <Text style={styles.infoText}>{STRINGS.lockAssignmentMsg}</Text>
                    </View>

                </ScrollView>

                {/* 🚀 DEPLOY ACTION */}
                <View style={styles.footer}>
                    <CustomButton
                        title={STRINGS.deployAssignment}
                        icon={Send}
                        onPress={handleDeploy}
                        loading={submitting}
                        disabled={submitting}
                        style={{
                            height: 64,
                            borderRadius: 22,
                        }}
                        colors={[primaryColor || COLORS.primary, secondaryColor || primaryColor || COLORS.primary]}
                    />
                </View>
            </KeyboardAvoidingView>

            <StatusModal
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                showCancel={statusModal.showCancel}
                okTitle={statusModal.okTitle}
                onClose={() => setStatusModal({ ...statusModal, visible: false })}
                onOk={() => {
                    setStatusModal({ ...statusModal, visible: false });
                    if (statusModal.onConfirm) statusModal.onConfirm();
                }}
            />
        </Wrapper>
    );
};

export default AddHomework;
