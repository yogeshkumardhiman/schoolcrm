import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from '../../../utils'

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    appName: {
        fontSize: 28,
        fontFamily: fontFamily.Poppins.Black,
        color: COLORS.white,
        letterSpacing: 2,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        fontFamily: fontFamily.Poppins.Medium,
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    version: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: fontFamily.Poppins.SemiBold,
    },
});
