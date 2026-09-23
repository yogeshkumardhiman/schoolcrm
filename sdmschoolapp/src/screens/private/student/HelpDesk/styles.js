import { StyleSheet } from 'react-native';
import { fontFamily } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Modern soft background
    },
    scrollContent: {
        padding: 16,
        paddingTop: 24,
    },
    
    // 🎧 FIGMA HEADPHONE DECORATION
    figmaCenterBox: {
        alignItems: 'center',
        marginVertical: 20,
    },
    figmaHeadphoneCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(108, 99, 255, 0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.15)',
    },
    figmaCenterTitle: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
        marginTop: 16,
    },
    figmaCenterDesc: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },

    // 📋 FIGMA MENU ITEMS
    figmaMenuContainer: {
        marginTop: 8,
    },
    figmaMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: 'rgba(108, 99, 255, 0.03)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 1,
    },
    figmaMenuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    figmaMenuInfo: {
        flex: 1,
        marginLeft: 12,
    },
    figmaMenuTitle: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    figmaMenuDesc: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        marginTop: 2,
    },
    figmaArrowBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F5F7FB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // 🔀 DYNAMIC VIEW CONTROLS
    backToDeskLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    backToDeskText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
        marginLeft: 4,
    },

    // 💰 LEGACY QUERY ITEMS
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    newBtn: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    newBtnText: {
        color: '#FFFFFF',
        fontFamily: fontFamily.Poppins.Bold,
        fontSize: 12,
    },
    queryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: 'rgba(108, 99, 255, 0.02)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    subjectBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    subjectText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#FFFFFF',
    },
    message: {
        fontSize: 13,
        color: '#4B5563',
        fontFamily: fontFamily.Poppins.Regular,
        lineHeight: 18,
    },
    replySection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    replyLabel: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6C63FF',
        marginBottom: 4,
    },
    replyText: {
        fontSize: 12,
        color: '#374151',
        fontFamily: fontFamily.Poppins.Medium,
        fontStyle: 'italic',
    },
    dateText: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'right',
    },

    // 📝 MODALS & INPUTS
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    label: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#4B5563',
        marginBottom: 6,
        marginTop: 16,
    },
    picker: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
    },
    pickerText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 120,
        textAlignVertical: 'top',
        color: '#1F2937',
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Medium,
    },
    submitBtn: {
        backgroundColor: '#6C63FF',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 3,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
    },
    categoryItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    categoryText: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    }
});
