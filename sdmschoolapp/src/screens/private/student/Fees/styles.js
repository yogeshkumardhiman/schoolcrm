import { StyleSheet } from 'react-native';
import { fontFamily, COLORS } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Modern soft background
    },
    
    // 💳 FIGMA IN-BODY FEES CARD
    figmaFeesCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
    },
    figmaFeesGradient: {
        padding: 20,
    },
    figmaFeesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    figmaFeesLabel: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: 'rgba(255,255,255,0.85)',
    },
    figmaFeesAmount: {
        fontSize: 26,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#FFFFFF',
        marginTop: 4,
    },
    figmaFeesSplit: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 16,
    },
    figmaFeesStat: {
        flex: 1,
    },
    figmaFeesStatLabel: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Medium,
        color: 'rgba(255,255,255,0.7)',
    },
    figmaFeesStatVal: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#FFFFFF',
        marginTop: 2,
    },

    // 💰 CONTENT
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
        marginBottom: 12,
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: 'rgba(108, 99, 255, 0.03)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    itemDate: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        marginTop: 2,
    },
    itemAmount: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#22C55E', // Success Green
    },
    
    // Receipt button
    receiptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(108, 99, 255, 0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 4,
        justifyContent: 'center',
    },
    receiptBtnText: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
        textTransform: 'uppercase',
    },

    // 🚌 TRANSPORT SECTION
    transportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.15)',
        borderStyle: 'dashed',
    }
});
