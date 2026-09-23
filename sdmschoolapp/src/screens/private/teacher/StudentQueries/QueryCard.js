import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { CheckCircle, Edit3, CornerDownRight, Hash, User, Calendar } from 'lucide-react-native';
import { COLORS, fontFamily, getResolvedUrl } from '../../../../utils';
import { styles } from './styles';
import moment from 'moment';

const QueryCard = ({ item, onRespond, onEdit, strings }) => {
    const isResolved = item.status === 'RESOLVED';
    const profileImg = item.studentImage ? getResolvedUrl(item.studentImage) : null;
    const formattedDate = item.date ? moment(item.date).format('DD MMM, YYYY • h:mm A') : 'N/A';

    return (
        <View style={styles.queryCard}>
            {/* 🔝 HEADER: Student Info & Subject */}
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={styles.imageContainer}>
                        {profileImg ? (
                            <Image
                                source={{ uri: profileImg }}
                                style={styles.studentAvatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.studentAvatar, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                                <User size={24} color="#94A3B8" />
                            </View>
                        )}
                    </View>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.studentName?.toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Hash size={10} color="#64748B" />
                            <Text style={styles.studentClass}>{item.studentId || item.admissionNo || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>{item.subject?.toUpperCase() || 'GENERAL'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                        <Calendar size={10} color="#94A3B8" />
                        <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Bold, color: '#94A3B8' }}>{formattedDate}</Text>
                    </View>
                </View>
            </View>

            {/* 📝 STUDENT MESSAGE */}
            <View style={styles.messageBox}>
                <Text style={styles.messageText}>{item.message}</Text>
            </View>

            {/* 🏛️ TEACHER REPLY (Only if Resolved) */}
            {isResolved && (
                <View style={styles.teacherReplyBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                        <CornerDownRight size={14} color={COLORS.primary} />
                        <Text style={styles.replyHeader}>TEACHER'S RESPONSE</Text>
                    </View>
                    <Text style={styles.replyText}>{item.teacherReply || 'No response recorded.'}</Text>
                </View>
            )}

            {/* ⚙️ ACTIONS */}
            <View style={styles.cardFooter}>
                {isResolved ? (
                    <View style={styles.resolvedContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CheckCircle size={16} color="#10B981" />
                            <Text style={styles.resolvedText}>{strings.resolved?.toUpperCase() || 'RESOLVED'}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => onEdit(item)}
                            style={styles.editActionBtn}
                        >
                            <Edit3 size={14} color={COLORS.primary} />
                            <Text style={styles.editActionText}>{strings.editResponse?.toUpperCase() || 'EDIT RESPONSE'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.replyBtn} 
                        onPress={() => onRespond(item)}
                    >
                        <Text style={styles.replyBtnText}>{strings.respondNow?.toUpperCase() || 'RESPOND NOW'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default React.memo(QueryCard);
