import { StyleSheet } from 'react-native';
import { fontFamily } from '../../../utils';

export const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: 'rgba(108, 99, 255, 0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    homeworkIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeworkInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    homeworkSubject: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#1F2937', // Main Text
    },
    homeworkTitle: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Medium,
        color: '#6B7280', // Secondary Text
        marginTop: 2,
    },
    homeworkDate: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#9CA3AF', // Compact due date
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.Bold,
    }
});
