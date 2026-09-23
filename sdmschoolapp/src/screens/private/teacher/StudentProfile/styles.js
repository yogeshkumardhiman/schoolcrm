import { StyleSheet } from 'react-native';
import { COLORS, fontFamily, screenWidth } from '../../../../utils';

export const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        letterSpacing: 2
    },
    header: {
        paddingTop: 50,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 10
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerProfile: {
        alignItems: 'center',
        marginTop: 10
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center'
    },
    actionCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 4,
        marginBottom: 15,
        overflow: 'hidden'
    },
    profileImage: {
        height: '100%',
        width: '100%',
        borderRadius: 46 // slightly less than container to fit inside padding
    },
    studentName: {
        fontSize: 22,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.white,
        marginBottom: 4
    },
    studentId: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Black,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 2,
        marginBottom: 16
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8
    },
    classBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    classBadgeText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Black,
        color: '#60A5FA'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8
    },
    statusBadgeText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Black
    },
    kpiRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: -30,
        gap: 12
    },
    kpiItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    kpiLabel: {
        fontSize: 8,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        opacity: 0.4,
        marginBottom: 4
    },
    kpiValue: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#0F172A'
    },
    kpiSub: {
        fontSize: 7,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.primary,
        marginTop: 2
    },
    tabNav: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12
    },
    tabButtonActive: {
        backgroundColor: '#F1F5F9'
    },
    tabLabel: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        opacity: 0.5
    },
    tabLabelActive: {
        color: COLORS.primary,
        opacity: 1
    },
    tabContent: {
        padding: 20
    },
    markCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    markInfo: {
        flex: 1
    },
    markSubject: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1E293B'
    },
    markExam: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Medium,
        color: COLORS.secondary,
        marginTop: 2
    },
    markValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    markValue: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.primary
    },
    markTotal: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: COLORS.secondary,
        opacity: 0.5
    },
    financeSummary: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center'
    },
    financeItem: {
        flex: 1,
        alignItems: 'center'
    },
    financeLabel: {
        fontSize: 8,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        opacity: 0.4
    },
    financeValue: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        marginTop: 4
    },
    financeDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0'
    },
    paymentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    paymentMonth: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1E293B'
    },
    paymentDate: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Medium,
        color: COLORS.secondary,
        marginTop: 2
    },
    paymentAmount: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#10B981'
    },
    attendanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    attendanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    attendanceDate: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#1E293B'
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    statusText: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Black
    },
    bioCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    infoIconBox: {
        height: 32,
        width: 32,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    infoTextBox: {
        flex: 1
    },
    infoLabel: {
        fontSize: 8,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        opacity: 0.4,
        letterSpacing: 1
    },
    infoValue: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1E293B',
        marginTop: 2
    },
    emptyState: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        marginTop: 12,
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.gray,
        opacity: 0.5,
        letterSpacing: 1
    },
    // 📅 CALENDAR STYLES
    calendarContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden'
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingVertical: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginHorizontal: 10
    },
    recentTitle: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        letterSpacing: 1.5,
        marginBottom: 12,
        opacity: 0.6
    },
    // 📊 SUMMARY STYLES
    monthlySummary: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        paddingVertical: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center'
    },
    summaryBox: {
        flex: 1,
        alignItems: 'center'
    },
    summaryValue: {
        fontSize: 20,
        fontFamily: fontFamily.Poppins.Black,
        color: '#065F46' // DARK GREEN
    },
    summaryLabel: {
        fontSize: 7,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.gray,
        letterSpacing: 0.5,
        marginTop: 2
    },
    // Redesigned Academics tab styles
    examLabel: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Black,
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 10,
        textTransform: 'uppercase'
    },
    examCapsuleScroll: {
        marginBottom: 16
    },
    examCapsuleScrollContent: {
        gap: 8,
        paddingRight: 20
    },
    examCapsuleWrapper: {
        minWidth: 100
    },
    examCapsuleActive: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    examCapsuleInactive: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    examCapsuleTextActive: {
        fontSize: screenWidth(3.5),
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.white
    },
    examCapsuleTextInactive: {
        fontSize: screenWidth(3.5),
        fontFamily: fontFamily.Poppins.Bold,
        color: '#64748B'
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20
    },
    enterMarksTitle: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary,
        marginBottom: 16
    },
    subjectRow: {
        marginBottom: 16
    },
    subjectLabel: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: '#64748B',
        marginBottom: 8
    },
    inputPillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    marksTextInput: {
        flex: 1,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        paddingHorizontal: 16,
        marginRight: 12,
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.primary
    },
    marksTextInputDisabled: {
        flex: 1,
        height: 48,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        paddingHorizontal: 16,
        justifyContent: 'center',
        marginRight: 12
    },
    marksTextInputDisabledText: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary
    },
    marksTextInputPlaceholderText: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#94A3B8'
    },
    percentageBadge: {
        height: 48,
        borderRadius: 14,
        paddingHorizontal: 16,
        minWidth: 72,
        alignItems: 'center',
        justifyContent: 'center'
    },
    percentageBadgeText: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold
    },
    allocateMarksButton: {
        marginTop: 10,
        marginBottom: 10
    },
    allocateMarksGradient: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    allocateMarksText: {
        color: COLORS.white,
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        letterSpacing: 0.5
    },
    downloadReportBtn: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20
    },
    downloadReportText: {
        color: COLORS.secondary,
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        letterSpacing: 0.5
    }
});
