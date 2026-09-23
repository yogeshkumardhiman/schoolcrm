import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import PublicRoutes from './publicRoutes';
import PrivateRoutes from './privateRoutes';
import { navigationRef } from './navigationService';

const AppNavigator = ({ showBoarding }) => {
    const { token, role } = useSelector(state => state.auth);
    return (
        <NavigationContainer ref={navigationRef}>
            {!token ? (
                <PublicRoutes showBoarding={showBoarding} />
            ) : (
                <PrivateRoutes role={role} />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;


