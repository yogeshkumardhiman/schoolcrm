import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Dimensions } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS, getResolvedUrl, screenWidth, } from '../../../utils';
import { styles } from './styles';

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    // 🎨 Dynamic configurations from server
    const { primaryColor, secondaryColor, schoolName, logoUrl } = useSelector(state => state.config);

    // 📡 Smooth Fade-in and Scale-up entrance telemetry animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            if (navigation) {
                navigation.replace('AppIntroSlider');
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation, fadeAnim, scaleAnim]);

    // 📏 Dynamic responsive sizing — IMPORTANT: icon must be SMALLER than circle!
    const { width: deviceWidth } = Dimensions.get('window');
    const circleSize = Math.min(deviceWidth * 0.38, 160);   // Circle container (~148px)
    const iconSize = circleSize * 0.45;                      // Icon = 45% of circle (~66px)
    const logoImgSize = circleSize * 0.65;                   // Uploaded logo = 65% of circle

    const isValidUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.trim().toLowerCase().startsWith('http');
    };

    return (
        <LinearGradient
            colors={[primaryColor || '#6C63FF', secondaryColor || primaryColor || '#8B5CF6']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                {/* Dynamically scaled white background circle */}
                <View style={[
                    styles.iconCircle,
                    {
                        width: circleSize,
                        height: circleSize,
                        borderRadius: circleSize / 2,
                        overflow: 'hidden'
                    }
                ]}>
                    {isValidUrl(logoUrl) ? (
                        <Image
                            source={{ uri: getResolvedUrl(logoUrl) }}
                            style={{ width: screenWidth(50), height: screenWidth(50), borderRadius: logoImgSize / 2 }}
                            resizeMode="contain"
                        />
                    ) : (
                        <GraduationCap size={iconSize} color={primaryColor || '#6C63FF'} strokeWidth={1.8} />
                    )}
                </View>
                <Text style={styles.appName}>{schoolName || STRINGS.appName}</Text>
                <Text style={styles.tagline}>{STRINGS.tagline}</Text>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.version}>{STRINGS.version}</Text>
            </View>
        </LinearGradient>
    );
};

export default SplashScreen;