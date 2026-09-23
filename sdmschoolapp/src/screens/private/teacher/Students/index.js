import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Search, Plus, SortAsc, RefreshCcw } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, showToast, STRINGS } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getClassRegistry, fetchAdminStudents, reorderRolls } from '../../../../slices/teacher';
import Skeleton from '../../../../components/common/Skeleton';

const StudentRegistry = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, role } = useSelector(state => state.auth);
    const isAdmin = role?.toLowerCase()?.includes('admin') || role === 'SUPER_ADMIN';
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReordering, setIsReordering] = useState(false);

    const fetchRegistry = React.useCallback(() => {
        setIsLoading(true);
        if (isAdmin) {
            dispatch(fetchAdminStudents((data) => {
                if (data) {
                    const studentList = Array.isArray(data) ? data : (data.students || []);
                    setStudents(studentList.map(s => ({
                        id: s.id || s._id,
                        name: s.name,
                        roll: s.rollNo || s.admissionNo,
                        image: s.image,
                        status: s.feesStatus,
                        section: s.section,
                        class: s.class
                    })));
                }
                setIsLoading(false);
            }));
        } else {
            dispatch(getClassRegistry(user?.class, user?.section, (data) => {
                if (data) {
                    setStudents(data.map(s => ({
                        id: s.id || s._id,
                        name: s.name,
                        roll: s.rollNo || s.admissionNo,
                        image: s.image,
                        status: s.feesStatus,
                        section: s.section,
                        class: s.class
                    })));
                }
                setIsLoading(false);
            }));
        }
    }, [isAdmin, dispatch, user?.class, user?.section]);

    React.useEffect(() => {
        fetchRegistry();
    }, [fetchRegistry]);

    const handleAutoReorder = () => {
        setIsReordering(true);
        dispatch(reorderRolls((res) => {
            setIsReordering(false);
            if (res?.success) {
                showToast({ type: 'success', message: res.message });
                fetchRegistry(); // Refresh list
            } else {
                showToast({ type: 'error', message: 'Institutional Reordering Failed' });
            }
        }));
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll?.toString()?.includes(searchQuery)
    );

    return (
        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            headerProps={{
                title: STRINGS.scholarDirectory,
                showBack: true,
                theme: 'dark',
                paddingBottom: 45,
                children: (
                    <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>{filteredStudents.length} {STRINGS.totalScholars} • {isAdmin ? 'SCHOOL WIDE' : `CLASS ${user?.class || '10TH'}-${user?.section || 'A'}`}</Text>
                    </View>
                )
            }}
        >

            {/* 🔍 SEARCH & AUTO-REORDER AXIS */}
            <View style={styles.searchSection}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <View style={styles.searchBar}>
                        <Search size={20} color={COLORS.secondary} />
                        <TextInput
                            placeholder={STRINGS.findScholar}
                            placeholderTextColor={COLORS.secondary + '80'}
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.reorderBtn, isReordering && { opacity: 0.5 }]}
                        onPress={handleAutoReorder}
                        disabled={isReordering}
                    >
                        {isReordering ? <RefreshCcw size={20} color={COLORS.white} /> : <SortAsc size={20} color={COLORS.white} />}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 📋 DATA TABLE GRID */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCol, { width: '20%' }]}>{STRINGS.rollNo.toUpperCase()}</Text>
                    <Text style={[styles.headerCol, { width: '55%' }]}>{STRINGS.student.toUpperCase()} NAME</Text>
                    <Text style={[styles.headerCol, { width: '25%', textAlign: 'right' }]}>{STRINGS.fees.toUpperCase()}</Text>
                </View>

                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <View key={i} style={styles.tableRow}>
                            <Skeleton width="15%" height={12} borderRadius={4} />
                            <View style={{ width: '5%' }} />
                            <Skeleton width="50%" height={12} borderRadius={4} />
                            <View style={{ width: '5%' }} />
                            <Skeleton width="20%" height={12} borderRadius={4} />
                        </View>
                    ))
                ) : (
                    filteredStudents.map((s) => (
                        <TouchableOpacity
                            key={s.id}
                            style={styles.tableRow}
                            onPress={() => navigation.navigate('StudentProfile', { studentId: s.id })}
                        >
                            {/* ADM ID */}
                            <View style={styles.idCol}>
                                <Text style={styles.idText}>{s.roll || '—'}</Text>
                            </View>

                            {/* SCHOLAR NAME */}
                            <View style={styles.nameCol}>
                                <Text style={styles.studentName} numberOfLines={1}>{s.name}</Text>
                                <Text style={styles.classInfo}>{s.class} - {s.section}</Text>
                            </View>

                            {/* FEE STATUS */}
                            <View style={styles.statusCol}>
                                <View style={[styles.miniBadge, { backgroundColor: s.status === 'PAID' ? '#DCFCE7' : '#FEE2E2' }]}>
                                    <Text style={[styles.miniBadgeText, { color: s.status === 'PAID' ? '#166534' : '#991B1B' }]}>
                                        {s.status}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* 🚀 INITIATE PROVISIONING - ONLY FOR ADMINS/MANAGEMENT */}
            {isAdmin && (
                <View style={styles.actionFooter}>
                    <TouchableOpacity style={styles.mainButton}>
                        <Plus size={20} color={COLORS.white} />
                        <Text style={styles.mainButtonText}>{STRINGS.enrollScholar}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Wrapper>
    );
};

export default StudentRegistry;
