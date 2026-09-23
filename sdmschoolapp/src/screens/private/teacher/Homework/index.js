import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { BookOpen, Plus, ChevronRight, Inbox, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getTeacherHomeworks } from '../../../../slices/teacher';
import Skeleton from '../../../../components/common/Skeleton';

const TeacherHomeworkList = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const fetchHomeworks = () => {
        if (!refreshing) setLoading(true);
        dispatch(getTeacherHomeworks((data) => {
            if (data) {
                // Ensure it is an array
                setHomeworks(Array.isArray(data) ? data : []);
            }
            setLoading(false);
            setRefreshing(false);
        }));
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchHomeworks();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHomeworks();
    };

    return (
        <Wrapper
            showHeader
            scrollY={scrollY}
            headerProps={{
                title: "ASSIGNMENTS",
                showBack: true,
                children: (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: 16,
                        borderRadius: 18,
                        marginTop: 15,
                        gap: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                    }}>
                        <View style={{
                            width: 44,
                            height: 44,
                            backgroundColor: COLORS.white,
                            borderRadius: 14,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <BookOpen size={24} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={{
                                fontSize: 10,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.white,
                                letterSpacing: 1.5,
                            }}>CURRICULUM REGISTRY</Text>
                            <Text style={{
                                fontSize: 9,
                                fontFamily: fontFamily.Poppins.Bold,
                                color: 'rgba(255,255,255,0.7)',
                                marginTop: 2,
                            }}>Manage assigned homework tasks</Text>
                        </View>
                    </View>
                )
            }}
        >
            <View style={{ flex: 1 }}>
                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1, backgroundColor: COLORS.background }}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 }}
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
                        [1, 2, 3].map(i => (
                            <View key={i} style={{
                                backgroundColor: COLORS.white,
                                borderRadius: 24,
                                padding: 20,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: 'rgba(0,0,0,0.03)',
                            }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Skeleton width={80} height={18} borderRadius={8} />
                                    <Skeleton width={100} height={14} borderRadius={4} />
                                </View>
                                <Skeleton width="70%" height={18} borderRadius={6} style={{ marginBottom: 8 }} />
                                <Skeleton width="90%" height={12} borderRadius={4} style={{ marginBottom: 16 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Skeleton width={120} height={12} borderRadius={4} />
                                    <Skeleton width={60} height={18} borderRadius={8} />
                                </View>
                            </View>
                        ))
                    ) : homeworks.length > 0 ? (
                        homeworks.map(item => {
                            const completedCount = item.submissions?.filter(s => s.status === 'COMPLETED').length || 0;
                            const totalCount = item.submissions?.length || 0;
                            const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            return (
                                <TouchableOpacity
                                    key={item.id || item._id}
                                    style={{
                                        backgroundColor: COLORS.white,
                                        borderRadius: 24,
                                        padding: 20,
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: 'rgba(0,0,0,0.03)',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.02,
                                        shadowRadius: 10,
                                        elevation: 2,
                                    }}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('TeacherHomeworkDetail', { homework: item })}
                                >
                                    {/* Card Header */}
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}>
                                        <View style={{
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 8,
                                            backgroundColor: item.isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                                        }}>
                                            <Text style={{
                                                fontSize: 8,
                                                fontFamily: fontFamily.Poppins.Black,
                                                color: item.isUrgent ? COLORS.danger : COLORS.primary,
                                                letterSpacing: 1,
                                            }}>{item.isUrgent ? 'URGENT' : item.priority || 'MEDIUM'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={12} color={COLORS.gray} />
                                            <Text style={{
                                                fontSize: 10,
                                                fontFamily: fontFamily.Poppins.SemiBold,
                                                color: COLORS.gray,
                                            }}>Due: {item.dueDate ? item.dueDate.split('T')[0] : 'N/A'}</Text>
                                        </View>
                                    </View>

                                    {/* Assignment details */}
                                    <Text style={{
                                        fontSize: 15,
                                        fontFamily: fontFamily.Poppins.Bold,
                                        color: COLORS.black,
                                        marginBottom: 4,
                                    }} numberOfLines={1}>{item.title}</Text>
                                    
                                    <Text style={{
                                        fontSize: 10,
                                        fontFamily: fontFamily.Poppins.Black,
                                        color: COLORS.primary,
                                        letterSpacing: 1,
                                        marginBottom: 10,
                                        textTransform: 'uppercase',
                                    }}>{item.subject}</Text>

                                    <Text style={{
                                        fontSize: 12,
                                        fontFamily: fontFamily.Poppins.Medium,
                                        color: COLORS.gray,
                                        lineHeight: 18,
                                        marginBottom: 16,
                                    }} numberOfLines={2}>{item.content || item.description}</Text>

                                    {/* Divider */}
                                    <View style={{
                                        height: 1,
                                        backgroundColor: COLORS.border,
                                        marginBottom: 16,
                                        opacity: 0.5,
                                    }} />

                                    {/* Card Footer Progress */}
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Users size={14} color={COLORS.gray} />
                                            <Text style={{
                                                fontSize: 10,
                                                fontFamily: fontFamily.Poppins.Black,
                                                color: COLORS.gray,
                                                letterSpacing: 0.5,
                                            }}>CLASS {item.class}-{item.section}</Text>
                                        </View>
                                        
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                                paddingHorizontal: 8,
                                                paddingVertical: 4,
                                                borderRadius: 8,
                                                gap: 4,
                                            }}>
                                                <CheckCircle size={10} color={COLORS.success} />
                                                <Text style={{
                                                    fontSize: 9,
                                                    fontFamily: fontFamily.Poppins.Black,
                                                    color: COLORS.success,
                                                }}>{completedCount}/{totalCount || 30}</Text>
                                            </View>
                                            <ChevronRight size={16} color={COLORS.primary} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 100,
                            gap: 16,
                        }}>
                            <Inbox size={48} color={COLORS.lightGray} />
                            <Text style={{
                                fontSize: 18,
                                fontFamily: fontFamily.Poppins.Black,
                                color: COLORS.black,
                            }}>Empty Hub</Text>
                            <Text style={{
                                fontSize: 12,
                                fontFamily: fontFamily.Poppins.Medium,
                                color: COLORS.gray,
                                textAlign: 'center',
                                paddingHorizontal: 40,
                            }}>You have not deployed any homework assignments yet.</Text>
                        </View>
                    )}
                    <View style={{ height: 120 }} />
                </Animated.ScrollView>

                {/* 🚀 DEPLOY NEW HOMEWORK FAB */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 30,
                        right: 24,
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: COLORS.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: COLORS.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('AddHomework')}
                >
                    <Plus size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </Wrapper>
    );
};

export default TeacherHomeworkList;
