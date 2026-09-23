import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { width as SCREEN_WIDTH } from '../../utils';

const Skeleton = ({ width, height, borderRadius = 8, style }) => {
    const shimmerAnim = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        const startShimmer = () => {
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ).start();
        };

        startShimmer();
    }, [shimmerAnim]);

    // --- 🛠️ CRASH PREVENTION CALIBRATION ---
    // Animated outputRange MUST be numbers for useNativeDriver.
    // If width is a string (e.g. "40%"), we fallback to SCREEN_WIDTH for the animation range.
    const numericWidth = typeof width === 'number' ? width : SCREEN_WIDTH;

    const translateX = shimmerAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-numericWidth, numericWidth],
    });

    return (
        <View
            style={[
                styles.container,
                { width, height, borderRadius },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E2E8F0', // Slate-200
        overflow: 'hidden',
    },
});

export default Skeleton;
