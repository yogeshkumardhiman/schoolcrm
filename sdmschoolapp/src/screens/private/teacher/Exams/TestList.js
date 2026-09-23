import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { ChevronLeft, Plus, ClipboardList, Calendar, Award, X, Save } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { CustomButton } from '../../../../components/CustomButton';
import Skeleton from '../../../../components/common/Skeleton';
import { fetchExamsList, createExam } from '../../../../slices/teacher';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const TestList = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    
    // New Exam State
    const [newExam, setNewExam] = useState({
        title: '',
        subjects: [{ name: '', maxMarks: '50' }],
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        class: user?.class || '10TH'
    });

    const fetchExams = React.useCallback(async () => {
        setLoading(true);
        try {
            dispatch(fetchExamsList(user?.class || '10TH', (data) => {
                if (data) {
                    setTests(data);
                }
                setLoading(false);
            }));
        } catch (e) {
            console.log("⚓ Exam Fetch Failure:", e);
            setLoading(false);
        }
    }, [dispatch, user?.class]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const handleAddExam = async () => {
        if (!newExam.title) return;
        
        // Filter out empty subjects
        const validSubjects = newExam.subjects.filter(s => s.name.trim() !== '');
        if (validSubjects.length === 0) return;

        setIsSubmitting(true);
        try {
            dispatch(createExam({
                ...newExam,
                subjects: validSubjects
            }, (data) => {
                setIsSubmitting(false);
                if (data) {
                    setModalVisible(false);
                    fetchExams();
                    // Reset form
                    setNewExam({
                        title: '',
                        subjects: [{ name: '', maxMarks: '50' }],
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
                        class: user?.class || '10TH'
                    });
                }
            }));
        } catch (e) {
            console.log("⚓ Exam Creation Failure:", e);
            setIsSubmitting(false);
        }
    };

    const handleAddSubjectRow = () => {
        setNewExam(prev => ({
            ...prev,
            subjects: [...prev.subjects, { name: '', maxMarks: '50' }]
        }));
    };

    const handleUpdateSubjectRow = (index, field, value) => {
        const updatedSubjects = [...newExam.subjects];
        updatedSubjects[index][field] = value;
        setNewExam({ ...newExam, subjects: updatedSubjects });
    };

    const handleRemoveSubjectRow = (index) => {
        if (newExam.subjects.length > 1) {
            const updatedSubjects = newExam.subjects.filter((_, i) => i !== index);
            setNewExam({ ...newExam, subjects: updatedSubjects });
        }
    };

    return (
        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            headerProps={{
                title: STRINGS.examRegistry,
                showBack: true,
                paddingBottom: 45
            }}
        >

            {/* EXAMS LISTING AXIS */}
            {loading ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingTop: 32 }}>
                    <View style={styles.listHeader}>
                        <Skeleton width={120} height={18} borderRadius={4} />
                        <Skeleton width={60} height={14} borderRadius={4} />
                    </View>
                    {[1, 2, 3].map(i => (
                        <View key={i} style={styles.testCard}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                                <Skeleton width={80} height={20} borderRadius={6} />
                                <Skeleton width={100} height={16} borderRadius={4} />
                            </View>
                            <Skeleton width="60%" height={22} borderRadius={4} style={{ marginBottom: 15 }} />
                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                <Skeleton width={100} height={16} borderRadius={4} />
                                <Skeleton width={80} height={16} borderRadius={4} />
                            </View>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingTop: 32, paddingBottom: 100 }}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>{STRINGS.activeProtocols}</Text>
                        <Text style={styles.countText}>{tests.length} {STRINGS.modules}</Text>
                    </View>

                    {tests.map((test) => (
                        <TouchableOpacity 
                            key={test.id || test._id} 
                            style={styles.testCard}
                            onPress={() => navigation.navigate('AddMarks', { test: { ...test, name: test.title, max: test.maxMarks ? test.maxMarks.toString() : '100' }, studentId: route?.params?.studentId })}
                        >
                            <View style={styles.testHeader}>
                                <View style={[styles.testBadge, { backgroundColor: test.status === 'COMPLETED' ? '#F0FDF4' : test.status === 'MARKING' ? '#FFFBEB' : '#EFF6FF' }]}>
                                    <Text style={[styles.testBadgeText, { color: test.status === 'COMPLETED' ? '#16A34A' : test.status === 'MARKING' ? '#D97706' : '#2563EB' }]}>{test.status || 'MARKING'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={12} color={COLORS.gray} />
                                    <Text style={styles.testDate}>{test.date}</Text>
                                </View>
                            </View>
                            
                            <Text style={styles.testTitle}>{test.title}</Text>
                            
                            <View style={styles.testMeta}>
                                <View style={styles.metaItem}>
                                    <ClipboardList size={14} color={COLORS.primary} />
                                    <Text style={styles.metaText}>
                                        {test.subjects && test.subjects.length > 0 
                                            ? `${test.subjects.length} ${STRINGS.subjectsCount}` 
                                            : (test.subject || STRINGS.noSubjects)}
                                    </Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Award size={14} color={COLORS.accent} />
                                    <Text style={styles.metaText}>
                                        {test.subjects && test.subjects.length > 0 
                                            ? `MAX: ${test.subjects.reduce((sum, s) => sum + parseInt(s.maxMarks || 0), 0)} Total` 
                                            : `MAX: ${test.maxMarks}`}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* FLOATING ACTION BUTTON */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Plus size={24} color="#fff" />
            </TouchableOpacity>

            {/* 🏗️ CREATE EXAM MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, minHeight: '60%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <Text style={{ fontSize: 20, fontFamily: fontFamily.Poppins.Black, color: COLORS.secondary }}>{STRINGS.newAssessment}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color={COLORS.secondary} /></TouchableOpacity>
                        </View>

                        <View style={{ gap: 20 }}>
                            <View>
                                <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Black, color: COLORS.gray, marginBottom: 8, letterSpacing: 1 }}>{STRINGS.examTitlePlaceholder}</Text>
                                <TextInput 
                                    value={newExam.title} 
                                    onChangeText={t => setNewExam({...newExam, title: t})}
                                    placeholder="EX: UNIT TEST 1"
                                    style={{ borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 12, fontSize: 16, fontFamily: fontFamily.Poppins.Bold, color: COLORS.secondary }}
                                />
                            </View>

                            <View>
                                <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Black, color: COLORS.gray, marginBottom: 8, letterSpacing: 1 }}>SUBJECTS</Text>
                                {newExam.subjects.map((sub, idx) => (
                                    <View key={idx} style={{ flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                        <TextInput 
                                            value={sub.name} 
                                            onChangeText={t => handleUpdateSubjectRow(idx, 'name', t)}
                                            placeholder={`Subject ${idx + 1} (e.g. Maths)`}
                                            style={{ flex: 2, borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8, fontSize: 14, fontFamily: fontFamily.Poppins.Bold, color: COLORS.secondary }}
                                        />
                                        <TextInput 
                                            value={sub.maxMarks} 
                                            onChangeText={t => handleUpdateSubjectRow(idx, 'maxMarks', t.replace(/[^0-9]/g, ''))}
                                            placeholder={STRINGS.maxMarksLabel}
                                            keyboardType="numeric"
                                            maxLength={3}
                                            style={{ flex: 1, borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8, fontSize: 14, fontFamily: fontFamily.Poppins.Bold, color: COLORS.secondary, textAlign: 'center' }}
                                        />
                                        <TouchableOpacity 
                                            onPress={() => handleRemoveSubjectRow(idx)}
                                            style={{ padding: 4 }}
                                        >
                                            <X size={16} color={COLORS.gray} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginTop: 4, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8 }}
                                    onPress={handleAddSubjectRow}
                                >
                                    <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Bold, color: COLORS.primary }}>{STRINGS.addSubject}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Black, color: COLORS.gray, marginBottom: 8, letterSpacing: 1 }}>{STRINGS.scheduledDate}</Text>
                                    <TextInput 
                                        value={newExam.date} 
                                        onChangeText={t => setNewExam({...newExam, date: t})}
                                        style={{ borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 12, fontSize: 16, fontFamily: fontFamily.Poppins.Bold, color: COLORS.secondary }}
                                    />
                                </View>
                            </View>

                            <CustomButton 
                                title={STRINGS.architectAssessment}
                                onPress={handleAddExam}
                                icon={Save}
                                variant="commit"
                                style={{ marginTop: 24 }}
                                loading={isSubmitting}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </Wrapper>
    );
};

export default TestList;
