import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { COLORS } from '../../utils';
import { styles } from './styles';

export const CustomInput = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconPress,
  secureTextEntry,
  error,
  keyboardType = 'default' 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? { borderColor: COLORS.danger } : {}]}>
        {Icon && <Icon size={20} color={COLORS.textMuted} style={styles.icon} />}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={styles.input}
        />
        {RightIcon && (
          <RightIcon 
            size={20} 
            color={COLORS.textMuted} 
            onPress={onRightIconPress}
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
