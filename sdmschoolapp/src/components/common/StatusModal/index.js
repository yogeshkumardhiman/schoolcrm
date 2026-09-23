import React from 'react';
import { View, Text, Modal, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { CheckCircle2, Bell, X, Info } from 'lucide-react-native';
import { COLORS, STRINGS } from '../../../utils';
import { styles } from './styles';
import { CustomButton } from '../../CustomButton';

/**
 * @typedef {'success' | 'error' | 'info'} StatusType
 */

export const StatusModal = ({
    visible,
    type,
    title,
    message,
    onClose,
    onOk,
    okTitle,
    showCancel = false,
    cancelTitle = STRINGS.cancel
}) => {

    const getTheme = () => {
        switch (type) {
            case 'success':
                return {
                    color: COLORS.green,
                    icon: CheckCircle2,
                    defaultTitle: 'MISSION ACCOMPLISHED',
                    defaultOk: 'DISMISS HUB'
                };
            case 'error':
                return {
                    color: COLORS.red,
                    icon: Bell,
                    defaultTitle: 'SYSTEM BREACH',
                    defaultOk: 'RETRY MISSION'
                };
            case 'info':
            default:
                return {
                    color: COLORS.primary,
                    icon: Info,
                    defaultTitle: 'INSTITUTIONAL NOTICE',
                    defaultOk: 'UNDERSTOOD'
                };
        }
    };

    const theme = getTheme();
    const IconComponent = theme.icon;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header Icon */}
                    <View style={[
                        styles.statusIconCircle,
                        { backgroundColor: theme.color + '15' }
                    ]}>
                        <IconComponent size={40} color={theme.color} />
                    </View>

                    {/* Content */}
                    <Text style={[styles.statusTitle, { color: theme.color }]}>
                        {title || theme.defaultTitle}
                    </Text>

                    <Text style={styles.statusMessage}>{message}</Text>

                    {/* Actions */}
                    <View style={styles.footer}>
                        <CustomButton
                            title={okTitle || theme.defaultOk}
                            variant={type === 'success' ? 'commit' : 'primary'}
                            style={{ width: showCancel ? '48%' : '100%' }}
                            onPress={onOk || onClose}
                        />
                        {showCancel && (
                            <CustomButton
                                title={cancelTitle}
                                variant="outline"
                                style={{ width: '48%' }}
                                onPress={onClose}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
