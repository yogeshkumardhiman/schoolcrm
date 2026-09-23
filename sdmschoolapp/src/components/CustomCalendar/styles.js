import { StyleSheet } from 'react-native';
import { fontFamily, COLORS } from '../../utils';

export const styles = StyleSheet.create({
    container: {
        margin: 16,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: '#FAFAFA'
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    legendText: {
        fontSize: 9,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#64748B',
        textTransform: 'uppercase'
    },
    eventDot: {
        backgroundColor: '#8B5CF6'
    },
    holidayDot: {
        backgroundColor: '#EF4444'
    },
    gazettedDot: {
        backgroundColor: '#F59E0B'
    }
});