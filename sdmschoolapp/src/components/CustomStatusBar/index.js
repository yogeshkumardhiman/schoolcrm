import React from 'react';
import { StatusBar, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomStatusBar = ({
    backgroundColor = 'transparent',
    barStyle = 'light-content',
    translucent = true
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ height: translucent ? 0 : insets.top, backgroundColor }}>
            <StatusBar
                translucent={translucent}
                backgroundColor={backgroundColor}
                barStyle={barStyle}
                animated={true}
            />
        </View>
    );
};

export default CustomStatusBar;
