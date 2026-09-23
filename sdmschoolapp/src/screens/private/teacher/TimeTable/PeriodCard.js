import React from 'react';
import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';
import { styles } from './styles';

const PeriodCard = ({ item, isActive }) => {
    return (
        <View style={[styles.periodCard, isActive && styles.activePeriodCard]}>
            <View style={[styles.periodNumberBox, isActive && styles.activePeriodNumberBox]}>
                <Text style={[styles.periodNumber, isActive && styles.activePeriodNumber]}>
                    {item.period}
                </Text>
            </View>
            <View style={styles.periodInfo}>
                <Text style={styles.className}>{item.class}</Text>
                <Text style={styles.subjectName}>{item.subject}</Text>
            </View>
            <View style={styles.timeBox}>
                <Clock size={12} color="#94A3B8" />
                <Text style={styles.timeText}>Period {item.period}</Text>
            </View>
        </View>
    );
};

export default PeriodCard;
