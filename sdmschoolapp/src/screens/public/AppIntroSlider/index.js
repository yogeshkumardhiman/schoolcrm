import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { GraduationCap, BookOpen, Bell, ArrowRight } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

import { styles } from './styles';
import { COLORS, STRINGS, CACHE, CACHE_PARAMS } from '../../../utils';

const AppIntroSlider = ({ navigation, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    // 🎨 Dynamic configurations from server
    const { primaryColor, secondaryColor, schoolName } = useSelector(state => state.config);

    const SLIDES = [
        {
            id: '1',
            title: `Welcome to ${schoolName || STRINGS.appName}`,
            description: `Your premium, unified digital campus workspace and student learning hub.`,
            icon: GraduationCap,
            gradient: [primaryColor, secondaryColor || primaryColor],
        },
        {
            id: '2',
            title: STRINGS.introTitle2 || "Real-time Operations",
            description: STRINGS.introDesc2 || "Track notices, class assignments, fees status, and metrics on the fly.",
            icon: BookOpen,
            gradient: [secondaryColor || primaryColor, primaryColor],
        },
        {
            id: '3',
            title: STRINGS.introTitle3 || "Instant Communication",
            description: STRINGS.introDesc3 || "Receive critical announcements, schedules, and alerts directly from school admin.",
            icon: Bell,
            gradient: [primaryColor, '#1E293B'],
        },
    ];

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // --- 🏁 TERMINATE ONBOARDING SEQUENCE ---
            try {
                await CACHE.set(CACHE_PARAMS.onboarding, true);
            } catch (e) {
                console.log("⚓ Onboarding Persistence Failure", e);
            }

            if (onFinish) {
                onFinish();
            } else {
                navigation.replace('LoginScreen');
            }
        }
    };

    const renderItem = ({ item }) => {
        const IconComponent = item.icon;
        return (
            <LinearGradient colors={item.gradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <SafeAreaView style={styles.content}>
                    <View style={styles.iconContainer}>
                        <IconComponent size={120} color={COLORS.white} strokeWidth={1} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { width: i === currentIndex ? 24 : 8, backgroundColor: i === currentIndex ? COLORS.white : 'rgba(255,255,255,0.4)' },
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: COLORS.white }]}
                    onPress={handleNext}
                >
                    <Text style={[styles.nextButtonText, { color: SLIDES[currentIndex].gradient[0] }]}>
                        {currentIndex === SLIDES.length - 1 ? STRINGS.getStarted : STRINGS.next}
                    </Text>
                    <ArrowRight size={20} color={SLIDES[currentIndex].gradient[0]} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AppIntroSlider;




