import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Modern soft background
    },
    contentContainer: {
        paddingBottom: 120,
    },

    // 👤 FIGMA INLINE HEADER
    figmaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 8,
    },
    figmaHeaderGreeting: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280', // Secondary Text
    },
    figmaHeaderName: {
        fontSize: 20,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
        marginTop: 2,
        letterSpacing: -0.3,
    },
    figmaHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    figmaBellBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    figmaBellBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    figmaAvatarBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    figmaAvatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    figmaAvatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    figmaAvatarPlaceholderText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
    },

    // 👤 FIGMA CARD (Circular Attendance & Student Info)
    figmaProfileCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Slate border
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: 'rgba(108, 99, 255, 0.08)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 4,
    },
    figmaProfileImgWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF', // Blue backdrop circle
        justifyContent: 'center',
        alignItems: 'center',
    },
    figmaProfileImg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#E5E7EB',
    },
    figmaProfileInitialBox: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    figmaProfileInitialText: {
        fontSize: 22,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
    },
    figmaProfileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    figmaProfileName: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text color
    },
    figmaBadgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
        gap: 6,
    },
    figmaClassBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    figmaClassText: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
    },
    figmaRollBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    figmaRollText: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#4B5563',
    },

    // Teacher Capsule
    figmaTeacherCapsule: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 5,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    figmaTeacherIconBox: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#E8F7F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    figmaTeacherTextBox: {
        justifyContent: 'center',
    },
    figmaTeacherLabel: {
        fontSize: 8.5,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#9CA3AF',
        lineHeight: 10,
    },
    figmaTeacherNameText: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
        lineHeight: 12,
    },

    // Attendance Svg
    figmaAttendanceSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    figmaAttendancePercentText: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
        lineHeight: 20,
    },
    figmaAttendanceLabelText: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        lineHeight: 11,
    },

    // ⚡ FIGMA QUICK ACCESS 4-COLUMN GRID
    figmaSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    figmaSectionTitle: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    figmaViewAll: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
    },
    figmaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        marginTop: 4,
    },
    figmaGridItem: {
        width: '25%',
        padding: 6,
        marginVertical: 4,
    },
    figmaGridCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Soft border
        shadowColor: 'rgba(108, 99, 255, 0.03)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
        height: 92,
    },
    figmaGridIconBox: {
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    figmaGridText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text color
        textAlign: 'center',
        lineHeight: 12,
    },

    // 📬 FIGMA HOMEWORK CARD
    figmaHomeworkCard: {
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: 'rgba(108, 99, 255, 0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 1,
    },
    figmaHomeworkIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    figmaHomeworkInfo: {
        flex: 1,
        marginLeft: 12,
    },
    figmaHomeworkSubject: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    figmaHomeworkTitle: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        marginTop: 2,
    },
    figmaHomeworkDate: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#9CA3AF',
        marginTop: 4,
    },
    figmaHomeworkStatus: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    figmaHomeworkStatusText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#D97706',
    }
});
