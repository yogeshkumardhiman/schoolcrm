import { StyleSheet } from 'react-native';
import { COLORS, screenWidth, screenHeight, fontFamily } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    mainContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    eventCardDetail: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    eventHeader: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    eventHeaderInfo: {
        marginLeft: 15,
    },
    eventTitleDetail: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.white,
    },
    eventDateDetail: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    eventBody: {
        padding: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    detailLabel: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.ExtraBold,
        color: COLORS.secondary,
        marginTop: 1,
    },
    actionRow: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 0,
        justifyContent: 'space-between',
    },
    primaryBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 2,
        marginRight: 10,
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.ExtraBold,
        color: COLORS.white,
    },
    secondaryBtn: {
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flex: 1,
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.ExtraBold,
        color: COLORS.secondary,
    },
});
