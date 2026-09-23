import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../utils';

export const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
    },
    gradientStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 56,
        borderRadius: 10,
    },
    outlineButton: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.transparent,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    text: {
        fontSize: 14,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.white,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    commitButton: {
        height: 64,
        borderRadius: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    commitText: {
        fontSize: 14,
        letterSpacing: 2.5,
    },
    pillButton: {
        height: 40,
        borderRadius: 15,
    },
    pillText: {
        fontSize: 11,
        letterSpacing: 0.5,
    },
    iconContainer: {
        marginLeft: 4,
    }
});
