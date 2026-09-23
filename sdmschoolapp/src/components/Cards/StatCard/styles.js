import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../utils';

export const styles = StyleSheet.create({
    card: {
        width: '47%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: COLORS.gray,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.secondary,
    },
});
