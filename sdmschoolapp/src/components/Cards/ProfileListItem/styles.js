import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../utils';

export const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconBox: {
        width: 36,
        height: 36,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: COLORS.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.ExtraBold,
        color: COLORS.secondary,
        marginTop: 1,
    },
});
