import React from 'react';
import { View, Text } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { fontFamily } from '../../utils';
import { styles } from './styles';

export default function CustomCalendar({ selectedDate, onDayPress, markedDates, hideLegend = false, ...props }) {
    const { primaryColor } = useSelector(state => state.config);
    const activeColor = primaryColor || '#4F46E5';
    return (
        <View style={styles.container}>
            <RNCalendar
                onDayPress={onDayPress}
                markedDates={markedDates}
                renderArrow={(direction) => (
                    direction === 'left' ?
                        <ChevronLeft size={22} color={activeColor} /> :
                        <ChevronRight size={22} color={activeColor} />
                )}
                theme={{
                    calendarBackground: '#FFFFFF',
                    textSectionTitleColor: '#64748B',
                    selectedDayBackgroundColor: activeColor,
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: activeColor,
                    dayTextColor: '#0F172A',
                    textDisabledColor: '#CBD5E1',
                    dotColor: activeColor,
                    selectedDotColor: '#FFFFFF',
                    arrowColor: activeColor,
                    monthTextColor: '#0F172A',
                    indicatorColor: activeColor,
                    textDayFontFamily: fontFamily.Poppins.Bold,
                    textMonthFontFamily: fontFamily.Poppins.ExtraBold,
                    textDayHeaderFontFamily: fontFamily.Poppins.SemiBold,
                    textDayFontSize: 13,
                    textMonthFontSize: 15,
                    textDayHeaderFontSize: 11,
                    ...props.theme
                }}
                {...props}
            />

            {/* Calendar Legend Bar */}
            {!hideLegend && (
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.eventDot]} />
                        <Text style={styles.legendText}>Event</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.holidayDot]} />
                        <Text style={styles.legendText}>Holiday</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.gazettedDot]} />
                        <Text style={styles.legendText}>Gazetted</Text>
                    </View>
                </View>
            )}
        </View>
    );
}
