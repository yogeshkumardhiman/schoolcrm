import React from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { COLORS } from '../../../utils';
import { styles } from './styles';

const EventItem = ({ title, date, icon: Icon = Calendar, color = COLORS.primary }) => {
    return (
        <View style={styles.container}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon size={22} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
        </View>
    );
};

export default EventItem;
