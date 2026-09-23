import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, STRINGS } from '../../utils';
import { styles } from './styles';

export const CustomButton = ({
    title,
    onPress,
    loading,
    style,
    textStyle,
    variant = 'primary', // 'primary', 'secondary', 'outline', 'pill', 'commit'
    icon: Icon,
    iconSize = 20,
    iconColor = COLORS.white,
    disabled = false,
    colors // New prop for dynamic server colors
}) => {
    const isCommit = variant === 'commit';
    const isPill = variant === 'pill';
    const isOutline = variant === 'outline';
    const isSecondary = variant === 'secondary';

    const getColors = () => {
        if (colors) return colors;
        if (isOutline) return [COLORS.transparent, COLORS.transparent];
        if (isSecondary) return [COLORS.secondary, '#1E293B'];
        return [COLORS.primary, '#1E40AF'];
    };

    const ButtonWrapper = isOutline ? View : LinearGradient;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                // isCommit && styles.commitButton,
                // isPill && styles.pillButton,
                // isOutline && styles.outlineButton,
                disabled && { opacity: 0.5 },
                style
            ]}
            onPress={onPress}
            disabled={loading || disabled}
            activeOpacity={0.8}
        >
            <ButtonWrapper
                colors={getColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                    styles.gradientStyle,
                    isPill && { borderRadius: 15 },
                    style?.height && { height: style.height },
                    style?.borderRadius && { borderRadius: style.borderRadius }
                ]}
            >
                {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color={isOutline ? COLORS.primary : COLORS.white} style={{ marginRight: 10 }} />
                        <Text style={[
                            styles.text,
                            isCommit && styles.commitText,
                            isPill && styles.pillText,
                            isOutline && { color: COLORS.primary },
                            textStyle
                        ]}>
                            {STRINGS.saving}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.content}>
                        <Text style={[
                            styles.text,
                            isCommit && styles.commitText,
                            isPill && styles.pillText,
                            isOutline && { color: COLORS.primary },
                            textStyle
                        ]}>
                            {title}
                        </Text>
                        {Icon && (
                            <View style={[styles.iconContainer, isPill && { marginLeft: 0 }]}>
                                <Icon size={isPill ? 16 : iconSize} color={isOutline ? COLORS.primary : iconColor} />
                            </View>
                        )}
                    </View>
                )}
            </ButtonWrapper>
        </TouchableOpacity>
    );
};
