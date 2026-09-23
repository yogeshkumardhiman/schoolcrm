import React, { useEffect, useRef } from "react";
import { View, Pressable, Text, StyleSheet, Animated } from "react-native";
import { Home, Calendar, User, Bell } from "lucide-react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, fontFamily } from "../utils";

const TabBarItem = ({ route, index, state, navigation, label, IconComponent, activeColor }) => {
    const isFocused = state.index === index;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.05 : 1,
            useNativeDriver: true,
            friction: 8,
        }).start();
    }, [isFocused, scaleAnim]);

    const handlePress = () => {
        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    const inactiveColor = '#94A3B8'; // Soft slate-gray for non-active tabs

    return (
        <Pressable
            onPress={handlePress}
            style={styles.tabItem}
            android_ripple={{ color: `${activeColor}10`, borderless: true }}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
                <IconComponent
                    size={22}
                    color={isFocused ? activeColor : inactiveColor}
                    strokeWidth={isFocused ? 2.3 : 1.8}
                />
                <Text
                    style={[
                        styles.text,
                        {
                            color: isFocused ? activeColor : inactiveColor,
                            fontFamily: isFocused ? fontFamily.Poppins.Bold : fontFamily.Poppins.Medium,
                        },
                    ]}
                >
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const TabBar = ({ state, navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, role } = useSelector(state => state.auth);
    const { primaryColor } = useSelector(state => state.config);
    const isTeacher = role?.toLowerCase()?.includes('teacher');
    const isStudent = role?.toLowerCase() === 'student';
    const isClassTeacher = isTeacher && user?.class && user?.section;

    // Dynamic active color from admin CRM settings
    const dynamicActiveColor = primaryColor || COLORS.primary;

    // Filter routes based on role and responsibility
    const filteredRoutes = state?.routes?.filter(route => {
        if (route.name === "ActivityScreen") {
            return isClassTeacher || !isTeacher;
        }
        if (route.name === "MarksScreen" || route.name === "NoticeScreen") {
            return isStudent;
        }
        return ["HomeScreen", "ActivityScreen", "NoticeScreen", "ProfileScreen"].includes(route.name);
    });

    return (
        <View style={[styles.outerContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.mainContainer}>
                {filteredRoutes.map((route, index) => {
                    let IconComponent = Home;
                    let label = "";

                    switch (route.name) {
                        case "HomeScreen":
                            IconComponent = Home;
                            label = "Home";
                            break;
                        case "ActivityScreen":
                            IconComponent = Calendar;
                            label = "Attendance";
                            break;
                        case "NoticeScreen":
                            IconComponent = Bell;
                            label = "Notices";
                            break;
                        case "ProfileScreen":
                            IconComponent = User;
                            label = "Profile";
                            break;
                        default:
                            IconComponent = Home;
                            label = "Home";
                    }

                    return (
                        <TabBarItem
                            key={route.key}
                            route={route}
                            index={state.routes.indexOf(route)}
                            state={state}
                            navigation={navigation}
                            label={label}
                            IconComponent={IconComponent}
                            activeColor={dynamicActiveColor}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: 'rgba(108, 99, 255, 0.08)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 10,
    },
    mainContainer: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
    },
    tabItem: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    }
});

export default TabBar;
