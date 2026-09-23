import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../utils';
import { styles } from './styles';

const StatCard = ({ Icon, label, value, color, onPress }) => {
    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={onPress} 
            disabled={!onPress}
            style={styles.card}
        >
            <View style={[styles.iconBox, { backgroundColor: color || COLORS.primary }]}>
                <Icon size={20} color={COLORS.white} />
            </View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </TouchableOpacity>
    );
};

export default StatCard;
