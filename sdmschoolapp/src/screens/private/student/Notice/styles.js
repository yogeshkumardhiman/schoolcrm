import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Sleek background color matching dashboard
    },
    
    mainContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    // 📋 FIGMA CARD STYLES
    figmaNoticeCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
        shadowColor: 'rgba(108, 99, 255, 0.04)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 2,
    },
    figmaIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    figmaNoticeContent: {
        flex: 1,
        marginRight: 8,
    },
    figmaNoticeTag: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    figmaNoticeTitle: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
        marginTop: 4,
    },
    figmaNoticePreview: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#4B5563', // Soft Dark Gray
        marginTop: 4,
        lineHeight: 16,
    },
    figmaNoticeDate: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#9CA3AF', // Light Gray Date
        marginTop: 8,
    },
    figmaChevron: {
        opacity: 0.8,
    },

    // 🛡️ DETAIL SPECIFIC (StudentNoticeDetail)
    priorityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    priorityText: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Black,
        marginLeft: 8,
        letterSpacing: 1,
    },
    detailCard: {
        backgroundColor: COLORS.white,
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    detailTitle: {
        fontSize: 22,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#64748B',
        marginLeft: 6,
    },
    metaDivider: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 12,
    },
    contentDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
    },
    detailDesc: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: '#334155',
        lineHeight: 24,
        marginBottom: 30,
    },
    institutionalSeal: {
        alignItems: 'center',
        marginTop: 20,
    },
    sealLine: {
        width: 40,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    sealText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.ExtraBold,
        color: '#94A3B8',
        marginVertical: 10,
        letterSpacing: 2,
    },
    acknowledgeBtn: {
        marginTop: 30,
        width: '100%',
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    acknowledgeBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acknowledgeBtnText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.white,
        letterSpacing: 1,
    },
});
