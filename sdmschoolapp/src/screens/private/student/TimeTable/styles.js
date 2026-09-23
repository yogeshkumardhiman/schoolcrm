import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Modern soft background
    },
    
    // 📅 DOCKED DAY SELECTOR PILLS
    daySelector: {
        marginTop: 12,
        paddingHorizontal: 0,
    },
    dayTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 6,
        backgroundColor: '#F5F7FB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeDayTab: {
        backgroundColor: '#6C63FF', // Mockup purple active fill
        borderColor: '#6C63FF',
    },
    dayTabText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#4B5563',
    },
    activeDayTabText: {
        color: '#FFFFFF',
    },

    content: {
        padding: 16,
        paddingTop: 24,
    },

    // ⏳ CHROMIUM VERTICAL TIMELINE DESIGN
    timelineContainer: {
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        top: 24,
        bottom: 24,
        left: 15,
        width: 2,
        backgroundColor: '#E5E7EB', // Symmetrical grey vertical line
        zIndex: 1,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        zIndex: 2,
    },
    timelineLeft: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    timelineCircleActive: {
        borderColor: '#6C63FF',
        backgroundColor: '#6C63FF',
    },
    timelineText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6B7280',
    },
    timelineTextActive: {
        color: '#FFFFFF',
    },

    // Symmetrical Timeline Cards
    timelineCard: {
        flex: 1,
        marginLeft: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: 'rgba(108, 99, 255, 0.03)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 1,
    },
    timelineInfo: {
        flex: 1,
        paddingRight: 8,
    },
    timelineSubject: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937',
    },
    timelineTeacher: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        marginTop: 4,
    },
    timelineTimeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timelineTimeText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#9CA3AF',
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
