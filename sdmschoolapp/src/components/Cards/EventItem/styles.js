import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../utils';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.ExtraBold,
        color: COLORS.secondary,
        letterSpacing: 0.2,
    },
    date: {
        fontSize: 11,
        fontFamily: fontFamily.Poppins.SemiBold,
        color: COLORS.gray,
        marginTop: 2,
    },
});
