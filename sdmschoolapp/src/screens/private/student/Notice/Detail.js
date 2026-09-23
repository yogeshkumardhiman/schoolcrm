import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, Bell, ShieldAlert, ChevronLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, STRINGS, formatDate } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';


const StudentNoticeDetail = ({ navigation, route }) => {
    const { notice } = route.params || {};

    if (!notice) return null;

    return (
        <Wrapper
            noTopInset={true}
            translucent={true}
            statusBarColor="transparent"
            statusBarStyle="light-content"
            showHeader
            headerProps={{
                showBack: true,
                title: STRINGS.noticeDetail,
                paddingBottom: 20,
            }}
        >
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

                    <View style={styles.mainContent}>
                        {/* 🎒 PRIORITY BANNER */}
                        <View style={[styles.priorityBanner, {
                            backgroundColor: COLORS.primary + '15'
                        }]}>
                            <ShieldAlert size={20} color={COLORS.primary} />
                            <Text style={[styles.priorityText, {
                                color: COLORS.primary
                            }]}>{STRINGS.highPriority}</Text>
                        </View>

                        {/* 📝 NOTICE CONTENT */}
                        <View style={styles.detailCard}>
                            <Text style={styles.detailTitle}>{notice.title}</Text>

                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <Calendar size={14} color="#94A3B8" />
                                    <Text style={styles.metaText}>{formatDate(notice.date)}</Text>
                                </View>
                                <View style={styles.metaDivider} />
                                <View style={styles.metaItem}>
                                    <Bell size={14} color="#94A3B8" />
                                    <Text style={styles.metaText}>{notice.tag}</Text>
                                </View>
                            </View>

                            <View style={styles.contentDivider} />

                            <Text style={styles.detailDesc}>{notice.content}</Text>

                            <View style={styles.institutionalSeal}>
                                <View style={styles.sealLine} />
                                <Text style={styles.sealText}>{STRINGS.adminSeal}</Text>
                                <View style={styles.sealLine} />
                            </View>
                        </View>

                        {/* 🚀 ACTION CALL */}
                        <TouchableOpacity
                            style={styles.acknowledgeBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <LinearGradient
                                colors={COLORS.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.acknowledgeBtnGradient}
                            >
                                <Text style={styles.acknowledgeBtnText}>{STRINGS.acknowledgeNotice}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>
        </Wrapper>
    );
};

export default StudentNoticeDetail;
