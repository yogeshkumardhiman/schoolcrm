import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { formatDate } from '../../../utils';
import { styles } from './styles';

const SUBJECT_COLORS = {
  MATHEMATICS: { color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.08)' },
  MATHS: { color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.08)' },
  MATH: { color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.08)' },
  SCIENCE: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
  ENGLISH: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  'SOCIAL SCIENCE': { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)' },
  HINDI: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' },
};

const HomeworkItem = ({ subject = '', title, dueDate, status, onMarkComplete }) => {
    const isCompleted = status === 'COMPLETED';
    
    const subKey = (subject || '').trim().toUpperCase();
    const theme = SUBJECT_COLORS[subKey] || { color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.08)' };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={isCompleted ? 1 : 0.8}
            onPress={isCompleted ? null : onMarkComplete}
        >
            {/* Subject Color Rounded Icon Box */}
            <View style={[styles.homeworkIconBox, { backgroundColor: theme.bg }]}>
                <BookOpen size={20} color={theme.color} strokeWidth={2.2} />
            </View>

            <View style={styles.homeworkInfo}>
                <Text style={styles.homeworkSubject}>{subject}</Text>
                <Text style={styles.homeworkTitle}>{title}</Text>
                <Text style={styles.homeworkDate}>Due: {formatDate(dueDate)}</Text>
            </View>

            {/* Status Pill Badge */}
            <View style={[
                styles.statusBadge,
                { 
                    backgroundColor: isCompleted ? '#DCFCE7' : '#FEF3C7',
                    borderColor: isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    borderWidth: 0.5
                }
            ]}>
                <Text style={[styles.statusText, { color: isCompleted ? '#16A34A' : '#D97706' }]}>
                    {isCompleted ? 'Completed' : 'Pending'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default HomeworkItem;
