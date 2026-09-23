import { StyleSheet } from 'react-native';
import { COLORS, screenWidth, fontFamily } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Sleek dark/light theme soft grey
    },

    // 💳 FIGMA PROFILE GRADIENT CARD
    figmaProfileCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
        backgroundColor: '#FFFFFF', // Need background color for shadow on iOS
    },
    figmaProfileGradient: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatarContainer: {
        width: '100%',
        alignItems: 'center',
    },
    avatarBorder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        padding: 3,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
        backgroundColor: '#E2E8F0',
    },
    studentName: {
        fontSize: 22,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    studentSub: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Medium,
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: 4,
        textAlign: 'center',
    },

    // 👨‍👩‍👧 DETAILS SECTIONS
    parentSection: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
        marginLeft: 8,
    },
    parentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB', // Slate border
        shadowColor: 'rgba(108, 99, 255, 0.03)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 2,
    },

    // 📋 ROW ITEMS FOR FIGMA MOCKUP
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280', // Secondary Text
        marginLeft: 10,
    },
    infoValue: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
        textAlign: 'right',
        flex: 1.2,
    },

    // 🚪 LOGOUT BUTTON
    logoutBtn: {
        marginHorizontal: 16,
        marginTop: 32,
        height: 56,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#FEE2E2',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    logoutText: {
        fontSize: 15,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#EF4444', // Danger Red
        marginLeft: 8,
    },

    // 🛠️ EDIT STATES FOR TEACHERS
    editBtn: {
        position: 'absolute',
        top: 24,
        right: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        padding: 10,
        borderRadius: 12,
        zIndex: 10,
    },
    bioSection: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    bioCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    bioText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
        fontFamily: fontFamily.Poppins.Medium,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        color: '#1F2937',
        fontFamily: fontFamily.Poppins.SemiBold,
        marginTop: 4,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingHorizontal: 16,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#6C63FF',
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    cancelEditBtn: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontFamily: fontFamily.Poppins.Bold,
        fontSize: 14,
    },
    governanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    governanceText: {
        flex: 1,
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },

    // 🛡️ MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 20,
    },
    modalIconBox: {
        width: 72,
        height: 72,
        backgroundColor: '#FEF2F2',
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
        marginBottom: 8,
    },
    modalDesc: {
        fontSize: 13,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalActionRow: {
        flexDirection: 'row',
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        marginRight: 10,
    },
    cancelBtnText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#4B5563',
    },
    confirmBtn: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        borderRadius: 14,
    },
    confirmBtnText: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#FFFFFF',
    },
    // 📷 CAMERA & SCANNER STYLES
    scannerOverlay: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scannerHeader: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 99,
    },
    scannerTitle: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#FFFFFF',
    },
    closeScanBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraStyle: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scannerFooter: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 99,
    },
    scannerTip: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#FFFFFF',
        textAlign: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
});
