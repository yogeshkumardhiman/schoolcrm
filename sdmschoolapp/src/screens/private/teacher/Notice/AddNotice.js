import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Send, Bell, Users, LayoutGrid, Info, Megaphone } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { broadcastClassNotice } from '../../../../slices/teacher';
import { StatusModal } from '../../../../components/common/StatusModal';
import { CustomButton } from '../../../../components/CustomButton';

const AddNotice = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { primaryColor, secondaryColor } = useSelector(state => state.config || {});
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState('class'); // 'class' or 'school'
    const [category, setCategory] = useState('General');
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });

    const categories = ['General', 'Urgent', 'Holiday', 'Event'];

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'MISSING INFORMATION',
                message: STRINGS.provideTitleContent
            });
            return;
        }

        const targetGroup = `Class ${user?.class || '10TH'}-${user?.section || 'A'}`;

        setStatusModal({
            visible: true,
            type: 'info',
            title: 'BROADCAST CONFIRMATION',
            message: `${STRINGS.releaseToTarget} ${targetGroup}?`,
            showCancel: true,
            okTitle: STRINGS.release,
            onConfirm: () => {
                const payload = {
                    senderId: user?.id || user?._id,
                    class: user?.class,
                    section: user?.section,
                    title: title,
                    message: content,
                    type: category,
                    senderName: user?.name
                };
                setSubmitting(true);
                dispatch(broadcastClassNotice(payload, (res) => {
                    setSubmitting(false);
                    if (res) {
                        setStatusModal({
                            visible: true,
                            type: 'success',
                            title: 'BROADCAST SUCCESS',
                            message: 'Notice has been successfully transmitted to the institutional registry.',
                            onConfirm: () => navigation.goBack()
                        });
                    }
                }));
            }
        });
    };

    return (

        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            headerProps={{
                title: STRINGS.noticeEmitter,
                showBack: true,
                children: (
                    <View style={{ width: '100%', marginTop: 8 }}>
                        <View style={styles.targetSwitcher}>
                            <TouchableOpacity
                                onPress={() => setTarget('class')}
                                style={[styles.targetBtn, styles.targetActive]}
                            >
                                <Users size={16} color={primaryColor || COLORS.primary} />
                                <Text style={[styles.targetText, { color: primaryColor || COLORS.primary }]}>{STRINGS.myClass} ({user?.class || '10TH'}-{user?.section || 'A'})</Text>
                            </TouchableOpacity>
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

                     {/* 🏷️ CATEGORY SELECTOR */}
                    <Text style={styles.sectionTitle}>{STRINGS.selectCategory}</Text>
                    <View style={styles.categoryRow}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                style={[
                                    styles.categoryPill, 
                                    category === cat && styles.categoryActive,
                                    category === cat && primaryColor && { backgroundColor: primaryColor, borderColor: primaryColor }
                                ]}
                            >
                                <Text style={[styles.categoryText, category === cat && styles.categoryActiveText]}>{cat.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 📝 NOTICE FORM */}
                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{STRINGS.noticeTitleLabel}</Text>
                            <TextInput
                                placeholder="e.g. Schedule Revision for Mondays"
                                style={styles.titleInput}
                                placeholderTextColor={COLORS.gray}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{STRINGS.noticeContentLabel}</Text>
                            <TextInput
                                placeholder="Detailed administrative content..."
                                style={styles.contentInput}
                                placeholderTextColor={COLORS.gray}
                                multiline
                                numberOfLines={8}
                                textAlignVertical="top"
                                value={content}
                                onChangeText={setContent}
                            />
                        </View>
                    </View>

                    <View style={styles.guaranteeBox}>
                        <Info size={18} color={COLORS.secondary} />
                        <Text style={styles.guaranteeText}>{STRINGS.instantBroadcastMsg}</Text>
                    </View>

                </ScrollView>

                {/* 🚀 EMISSION ACTION */}
                <View style={styles.footer}>
                    <CustomButton
                        title={STRINGS.releaseNotice}
                        icon={Megaphone}
                        onPress={handlePost}
                        loading={submitting}
                        disabled={submitting}
                        style={{
                            height: 64,
                            borderRadius: 22,
                        }}
                        colors={[primaryColor || COLORS.primary, secondaryColor || primaryColor || COLORS.primary]}
                    />
                </View>

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
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default AddNotice;
