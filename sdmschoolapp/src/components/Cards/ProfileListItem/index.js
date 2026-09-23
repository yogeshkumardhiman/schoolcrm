import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../../utils';
import { styles } from './styles';

const ProfileListItem = ({ Icon, label, value }) => {
    return (
        <View style={styles.item}>
            <View style={styles.iconBox}>
                <Icon size={18} color={COLORS.gray} />
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
};

export default ProfileListItem;
