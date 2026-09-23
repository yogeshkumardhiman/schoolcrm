import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, RefreshControl, Image, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronLeft, CheckCircle2, AlertCircle, RefreshCw, User, Calendar, BookOpen, AlertTriangle } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { COLORS, STRINGS, fontFamily, getResolvedUrl } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { fetchHomeworkStats, updateStudentHomeworkSubmission } from '../../../../slices/teacher';
import Skeleton from '../../../../components/common/Skeleton';

const TeacherHomeworkDetail = ({ route, navigation }) => {
    const { homework } = route.params;
    const homeworkId = homework?.id || homework?._id;

    const dispatch = useDispatch();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [togglingId, setTogglingId] = useState(null); // Keep track of student id being updated
    const scrollY = useRef(new Animated.Value(0)).current;

    const getStats = () => {
        if (!refreshing) setLoading(true);
        dispatch(fetchHomeworkStats(homeworkId, (data) => {
            if (data) {
                setStudents(Array.isArray(data) ? data : []);
            }
            setLoading(false);
            setRefreshing(false);
        }));
    };

    useEffect(() => {
        getStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [homeworkId]);

    const onRefresh = () => {
        setRefreshing(true);
        getStats();
    };

    const handleToggleStatus = (student) => {
        const currentStatus = student.completionStatus;
        const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

        setTogglingId(student.id);
        const payload = {
            studentId: student.id,
            homeworkId: homeworkId,
            status: nextStatus
        };

        dispatch(updateStudentHomeworkSubmission(payload, (res) => {
            setTogglingId(null);
            if (res) {
                // Instantly update local state for a smooth UI experience
                setStudents(prev => prev.map(s => 
                    s.id === student.id ? { ...s, completionStatus: nextStatus } : s
                ));
            }
        }));
    };

    const completedCount = students.filter(s => s.completionStatus === 'COMPLETED').length;
    const pendingCount = students.length - completedCount;

    return (
        <Wrapper
            showHeader
            scrollY={scrollY}
            headerProps={{
                title: "ENGAGEMENT DETAIL",
                showBack: true,
                children: (
                    <View style={{ marginTop: 10 }}>
                        <Text style={{
                            fontSize: 16,
                            fontFamily: fontFamily.Poppins.Bold,
                            color: COLORS.white,
                        }} numberOfLines={1}>{homework.title.toUpperCase()}</Text>
                        <View style={{
                            flexDirection: 'row',
                            gap: 12,
                            marginTop: 10,
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 10,
                            }}>
                                <BookOpen size={12} color={COLORS.white} />
                                <Text style={{
                                    fontSize: 8,
                                    fontFamily: fontFamily.Poppins.Black,
                                    color: COLORS.white,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase',
                                }}>{homework.subject}</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 10,
                            }}>
                                <Calendar size={12} color={COLORS.white} />
                                <Text style={{
                                    fontSize: 8,
                                    fontFamily: fontFamily.Poppins.Black,
                                    color: COLORS.white,
                                    letterSpacing: 0.5,
                                }}>CLASS {homework.class}-{homework.section}</Text>
                            </View>
                        </View>
                    </View>
                )
            }}
        >
            <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                
                {/* 📊 SUMMARY MINI ANALYTICS BAR */}
                <View style={{
                    flexDirection: 'row',
                    gap: 16,
                    paddingHorizontal: 24,
                    paddingTop: 20,
                    paddingBottom: 10,
                }}>
                    {/* Compliant Stats */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 20,
                        padding: 16,
                    }}>
                        <View>
                            <Text style={{
                                fontSize: 9,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.success,
                                letterSpacing: 0.5,
                            }}>COMPLIANT</Text>
                            <Text style={{
                                fontSize: 24,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.success,
                                marginTop: 4,
                            }}>{loading ? '--' : completedCount}</Text>
                        </View>
                        <CheckCircle2 size={32} color="rgba(16, 185, 129, 0.15)" />
                    </View>

                    {/* Pending Stats */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: 20,
                        padding: 16,
                    }}>
                        <View>
                            <Text style={{
                                fontSize: 9,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.warning,
                                letterSpacing: 0.5,
                            }}>PENDING</Text>
                            <Text style={{
                                fontSize: 24,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.warning,
                                marginTop: 4,
                            }}>{loading ? '--' : pendingCount}</Text>
                        </View>
                        <AlertCircle size={32} color="rgba(245, 158, 11, 0.15)" />
                    </View>
                </View>

                {/* 🧬 REGISTRY HEADLINE */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                    paddingTop: 15,
                    paddingBottom: 10,
                }}>
                    <Text style={{
                        fontSize: 10,
                        fontFamily: fontFamily.Poppins.Black,
                        color: COLORS.gray,
                        letterSpacing: 1.5,
                    }}>SCHOLAR ROSTER</Text>
                    
                    <View style={{
                        backgroundColor: COLORS.black,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                    }}>
                        <Text style={{
                            fontSize: 8,
                            fontFamily: fontFamily.Poppins.Black,
                            color: COLORS.white,
                            letterSpacing: 0.5,
                        }}>{loading ? '--' : students.length} TOTAL</Text>
                    </View>
                </View>

                {/* 👥 SCHOLARS LIST */}
                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: COLORS.white,
                                borderRadius: 20,
                                padding: 14,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(0,0,0,0.02)',
                            }}>
                                <Skeleton width={44} height={44} borderRadius={12} style={{ marginRight: 16 }} />
                                <View style={{ flex: 1, gap: 6 }}>
                                    <Skeleton width="60%" height={14} borderRadius={4} />
                                    <Skeleton width="40%" height={10} borderRadius={3} />
                                </View>
                                <Skeleton width={70} height={28} borderRadius={8} />
                            </View>
                        ))
                    ) : students.length > 0 ? (
                        students.map((student) => {
                            const isCompleted = student.completionStatus === 'COMPLETED';
                            const isToggling = togglingId === student.id;

                            return (
                                <View
                                    key={student.id || student._id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: COLORS.white,
                                        borderRadius: 22,
                                        padding: 14,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(0,0,0,0.02)',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.01,
                                        shadowRadius: 5,
                                        elevation: 1,
                                    }}
                                >
                                    {/* Student Image */}
                                    <View style={{
                                        width: 46,
                                        height: 46,
                                        backgroundColor: COLORS.background,
                                        borderRadius: 14,
                                        overflow: 'hidden',
                                        marginRight: 16,
                                        borderWidth: 1,
                                        borderColor: COLORS.border,
                                    }}>
                                        {student.image ? (
                                            <Image 
                                                source={{ uri: getResolvedUrl(student.image) }} 
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        ) : (
                                            <View style={{
                                                width: '100%',
                                                height: '100%',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                                <User size={20} color={COLORS.gray} />
                                            </View>
                                        )}
                                    </View>

                                    {/* Student Details */}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 13,
                                            fontFamily: fontFamily.Poppins.Bold,
                                            color: COLORS.black,
                                            textTransform: 'uppercase',
                                        }} numberOfLines={1}>{student.name}</Text>
                                        <Text style={{
                                            fontSize: 9,
                                            fontFamily: fontFamily.Poppins.Bold,
                                            color: COLORS.gray,
                                            marginTop: 2,
                                            letterSpacing: 0.5,
                                        }}>ROLL NO: {student.rollNo || 'N/A'}</Text>
                                    </View>

                                    {/* Status Switcher Action */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        {/* Status Badge */}
                                        <View style={{
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                            borderRadius: 8,
                                            backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                                        }}>
                                            <Text style={{
                                                fontSize: 8,
                                                fontFamily: fontFamily.Poppins.Black,
                                                color: isCompleted ? COLORS.success : COLORS.gray,
                                                letterSpacing: 0.5,
                                            }}>{isCompleted ? 'VERIFIED' : 'PENDING'}</Text>
                                        </View>

                                        {/* Toggle Action Button */}
                                        <TouchableOpacity
                                            style={{
                                                minWidth: 70,
                                                height: 32,
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                backgroundColor: isCompleted ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                                                borderColor: isCompleted ? COLORS.danger + '40' : COLORS.success + '40',
                                            }}
                                            disabled={isToggling}
                                            activeOpacity={0.8}
                                            onPress={() => handleToggleStatus(student)}
                                        >
                                            {isToggling ? (
                                                <ActivityIndicator size="small" color={isCompleted ? COLORS.danger : COLORS.success} />
                                            ) : (
                                                <Text style={{
                                                    fontSize: 9,
                                                    fontFamily: fontFamily.Poppins.Black,
                                                    color: isCompleted ? COLORS.danger : COLORS.success,
                                                    letterSpacing: 0.5,
                                                }}>{isCompleted ? 'REVOKE' : 'VERIFY'}</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 100,
                            gap: 16,
                        }}>
                            <AlertTriangle size={48} color={COLORS.lightGray} />
                            <Text style={{
                                fontSize: 16,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.black,
                            }}>No Scholars Found</Text>
                            <Text style={{
                                fontSize: 12,
                                fontFamily: fontFamily.Poppins.Medium,
                                color: COLORS.gray,
                                textAlign: 'center',
                                paddingHorizontal: 40,
                            }}>There are no active students enrolled in Class {homework.class}-{homework.section}.</Text>
                        </View>
                    )}
                </Animated.ScrollView>
            </View>
        </Wrapper>
    );
};

export default TeacherHomeworkDetail;
