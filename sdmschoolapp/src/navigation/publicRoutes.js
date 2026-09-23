import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/public/SplashScreen';
import AppIntroSlider from '../screens/public/AppIntroSlider';
import LoginScreen from '../screens/public/LoginScreen';

const Stack = createNativeStackNavigator();

const PublicRoutes = ({ showBoarding }) => {
    return (
        <Stack.Navigator 
            initialRouteName={showBoarding ? "AppIntroSlider" : "LoginScreen"}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="AppIntroSlider" component={AppIntroSlider} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
        </Stack.Navigator>
    );
};

export default PublicRoutes;