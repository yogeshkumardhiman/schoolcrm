import { StyleSheet } from 'react-native';
import { fontFamily,COLORS } from '../../../utils';



export const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 15,
    },
    statusIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 22,
        fontFamily: fontFamily.Poppins.Black,
        letterSpacing: 1,
        marginBottom: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    statusMessage: {
        fontSize: 14,
        color: COLORS.secondary + '90',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        fontFamily: fontFamily.Poppins.SemiBold,
    },
    footer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    }
});
