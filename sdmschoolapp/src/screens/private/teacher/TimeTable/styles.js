import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, fontFamily } from '../../../../utils';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    placeholder: {
        width: 40,
    },
    daySelector: {
        marginTop: 12,
        paddingHorizontal: 5,
    },
    dayTab: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeDayTab: {
        backgroundColor: COLORS.white,
    },
    dayTabText: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
    },
    activeDayTabText: {
        color: COLORS.primary,
    },
    content: {
        padding: 20,
    },
    periodCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activePeriodCard: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    periodNumberBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activePeriodNumberBox: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    periodNumber: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary,
    },
    activePeriodNumber: {
        color: COLORS.white,
    },
    periodInfo: {
        flex: 1,
        marginLeft: 16,
    },
    className: {
        fontSize: 17,
        fontFamily: fontFamily.Poppins.Bold,
        color: COLORS.secondary,
    },
    subjectName: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: COLORS.gray,
        textTransform: 'uppercase',
    },
    timeBox: {
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: COLORS.gray,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Medium,
        color: COLORS.gray,
        textAlign: 'center',
    },
});
