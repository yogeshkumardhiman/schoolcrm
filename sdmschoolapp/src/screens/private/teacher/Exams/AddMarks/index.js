import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ChevronLeft, Save, FilePlus, Users, CheckCircle, AlertCircle, Calculator } from 'lucide-react-native';
import { COLORS } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { StatusModal } from '../../../../components/common/StatusModal';
import { CustomButton } from '../../../../components/CustomButton';

const AddMarks = ({ navigation }) => {
    const [step, setStep] = useState(1); // 1: Create Test, 2: Enter Marks
    
    // 📊 Step 1: Test Context
    const [testLabel, setTestLabel] = useState('');
    const [maxMarks, setMaxMarks] = useState('50');
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');

    // 📝 Step 2: Marks Entry
    const [students, setStudents] = useState([
        { id: '1', name: 'YOGESH KUMAR', roll: 'ADM-2024-001', score: '' },
        { id: '2', name: 'AMIT SINGH', roll: 'ADM-2024-002', score: '' },
        { id: '3', name: 'PRIYA SHARMA', roll: 'ADM-2024-003', score: '' },
        { id: '4', name: 'NEHA GUPTA', roll: 'ADM-2024-004', score: '' },
        { id: '5', name: 'RAHUL VARMA', roll: 'ADM-2024-005', score: '' },
    ]);

    const [statusModal, setStatusModal] = useState({ visible: false, type: 'success', title: '', message: '', onConfirm: null });

    const handleScoreChange = (id, val) => {
        // Validation: Prevent score > max marks
        if (parseFloat(val) > parseFloat(maxMarks)) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'INVALID INPUT',
                message: `Score cannot exceed Max Marks (${maxMarks})`
            });
            return;
        }
        setStudents(prev => prev.map(s => s.id === id ? { ...s, score: val } : s));
    };

    const proceedToEntry = () => {
        if (!testLabel.trim()) {
            setStatusModal({
                visible: true,
                type: 'error',
                title: 'MISSING INFORMATION',
                message: "Please provide a Test Label (e.g., Unit Test 1)"
            });
            return;
        }
        setStep(2);
    };

    const submitMarks = () => {
        setStatusModal({
            visible: true,
            type: 'info',
            title: 'CONFIRM COMMITMENT',
            message: `Are you sure you want to commit scores for ${testLabel}?`,
            showCancel: true,
            okTitle: 'COMMIT',
            onConfirm: () => navigation.goBack()
        });
    };

    return (
        <Wrapper showHeader={false} noTopInset={true} noBottomPadding={true}>
            {/* 🧭 NAVIGATION HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>ACADEMIC REGISTRY</Text>
                    <View style={{ width: 44 }} />
                </View>
                
                {/* 👣 VISUAL STEPPER */}
                <View style={styles.stepperContainer}>
                    <View style={styles.stepUnit}>
                        <View style={[styles.stepIcon, step >= 1 && styles.stepActive]}>
                            <FilePlus size={16} color={step >= 1 ? COLORS.white : COLORS.gray} />
                        </View>
                        <Text style={[styles.stepLabel, step >= 1 && styles.labelActive]}>DEFINE</Text>
                    </View>
                    <View style={[styles.stepLine, step >= 2 && styles.lineActive]} />
                    <View style={styles.stepUnit}>
                        <View style={[styles.stepIcon, step >= 2 && styles.stepActive]}>
                            <Users size={16} color={step >= 2 ? COLORS.white : COLORS.gray} />
                        </View>
                        <Text style={[styles.stepLabel, step >= 2 && styles.labelActive]}>CAPTURE</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {step === 1 ? (
                    /* 🛠️ PHASE 1: DYNAMIC TEST CREATION */
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>TEST LABEL</Text>
                            <View style={styles.inputWrapper}>
                                <FilePlus size={18} color={COLORS.primary} />
                                <TextInput 
                                    placeholder="e.g. Unit Test 1" 
                                    style={styles.input}
                                    placeholderTextColor={COLORS.gray}
                                    value={testLabel}
                                    onChangeText={setTestLabel}
                                />
                            </View>
                        </View>

                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                <Text style={styles.inputLabel}>MAX MARKS</Text>
                                <View style={styles.inputWrapper}>
                                    <Calculator size={18} color={COLORS.primary} />
                                    <TextInput 
                                        placeholder="50" 
                                        keyboardType="numeric"
                                        style={styles.input}
                                        placeholderTextColor={COLORS.gray}
                                        value={maxMarks}
                                        onChangeText={setMaxMarks}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}>
                                <Text style={styles.inputLabel}>SUBJECT</Text>
                                <View style={styles.inputWrapper}>
                                    <CheckCircle size={18} color={COLORS.primary} />
                                    <Text style={styles.staticText}>{selectedSubject}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.guidanceBox}>
                            <AlertCircle size={20} color={COLORS.secondary} />
                            <Text style={styles.guidanceText}>Defining the test will open the student registry for score entry based on your active class (10A).</Text>
                        </View>

                        <TouchableOpacity onPress={proceedToEntry} style={styles.primaryAction}>
                            <Text style={styles.primaryActionText}>GENERATE REGISTRY</Text>
                            <Users size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* 📊 PHASE 2: PERFORMANCE TELEMETRY ENTRY */
                    <View style={styles.entrySection}>
                        <View style={styles.testMetaCard}>
                            <View>
                                <Text style={styles.metaLabel}>TEST FOCUS</Text>
                                <Text style={styles.metaTitle}>{testLabel.toUpperCase()}</Text>
                            </View>
                            <View style={styles.metaDivider} />
                            <View>
                                <Text style={styles.metaLabel}>LIMIT</Text>
                                <Text style={styles.metaTitle}>{maxMarks}</Text>
                            </View>
                        </View>

                        <View style={styles.registryHeader}>
                            <Text style={styles.registryTitle}>SCHOLAR REGISTRY</Text>
                            <Text style={styles.registryCount}>{students.length} Total</Text>
                        </View>

                        {students.map((student, i) => (
                            <View key={student.id} style={styles.studentEntryCard}>
                                <View style={styles.studentStatic}>
                                    <Text style={styles.studentName}>{student.name}</Text>
                                    <Text style={styles.studentRoll}>{student.roll}</Text>
                                </View>
                                <View style={styles.scoreInputWrapper}>
                                    <TextInput 
                                        placeholder="00" 
                                        keyboardType="numeric"
                                        style={styles.scoreInput}
                                        placeholderTextColor={COLORS.gray}
                                        value={student.score}
                                        onChangeText={(val) => handleScoreChange(student.id, val)}
                                    />
                                    <Text style={styles.scoreDivider}>/</Text>
                                    <Text style={styles.scoreMax}>{maxMarks}</Text>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity onPress={submitMarks} style={styles.commitButton}>
                            <Text style={styles.commitText}>COMMIT SCORES</Text>
                            <Save size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

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

export default AddMarks;
