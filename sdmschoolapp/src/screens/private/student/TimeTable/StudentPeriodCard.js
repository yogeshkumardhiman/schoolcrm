import React from 'react';
import { View, Text } from 'react-native';
import { Clock, User } from 'lucide-react-native';
import { styles } from '../../teacher/TimeTable/styles';
import { COLORS } from '../../../../utils';

const StudentPeriodCard = ({ item }) => {
    return (
        <View style={styles.periodCard}>
            <View style={styles.periodNumberBox}>
                <Text style={styles.periodNumber}>{item.period}</Text>
            </View>
            <View style={styles.periodInfo}>
                <Text style={styles.className}>{item.subject}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <User size={12} color={COLORS.gray} />
                    <Text style={[styles.subjectName, { marginLeft: 4 }]}>{item.teacherName}</Text>
                </View>
            </View>
            <View style={styles.timeBox}>
                <Clock size={12} color={COLORS.gray} />
                <Text style={styles.timeText}>Period {item.period}</Text>
            </View>
        </View>
    );
};

export default StudentPeriodCard;
