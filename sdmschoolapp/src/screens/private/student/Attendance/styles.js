import { StyleSheet } from 'react-native';
import { fontFamily, COLORS } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Sleek background color
    },
    
    // 📊 FIGMA 3-COLUMN SUMMARY GRID
    figmaSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
    },
    figmaSummaryTile: {
        width: '31%',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.02)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 1,
    },
    figmaTileDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginBottom: 4,
    },
    figmaTileValue: {
        fontSize: 20,
        fontFamily: fontFamily.Poppins.Bold,
        textAlign: 'center',
    },
    figmaTileLabel: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Medium,
        marginTop: 2,
        textAlign: 'center',
    },

    mainContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },

    // 📅 INTERACTIVE CALENDAR CARD
    calendarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB', // Slate border
        shadowColor: 'rgba(108, 99, 255, 0.04)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 3,
    },
    arrowBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 10,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 3,
        marginRight: 6,
    },
    legendLabel: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#6B7280', // Secondary Text
    },

    sectionTitle: {
        fontSize: 16,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
        marginBottom: 12,
        marginTop: 10,
    },

    // ACTIVITY LIST ITEMS
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: 'rgba(108, 99, 255, 0.02)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 1,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityStatus: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
    },
    activityDate: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280',
        marginTop: 2,
    },
});
