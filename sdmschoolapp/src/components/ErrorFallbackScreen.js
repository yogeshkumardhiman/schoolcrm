import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { AlertOctagon, RefreshCw } from 'lucide-react-native';

const ErrorFallbackScreen = ({ error, resetErrorBoundary }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
            <View style={styles.card}>
                <View style={styles.iconCircle}>
                    <AlertOctagon size={48} color="#EF4444" strokeWidth={1.8} />
                </View>
                
                <Text style={styles.title}>System Exception Detected</Text>
                
                <Text style={styles.description}>
                    The campus terminal encountered an unexpected rendering anomaly. Rest assured, your academic profile and marks logs are perfectly secure.
                </Text>

                <View style={styles.errorDetailsBox}>
                    <Text style={styles.errorLabel}>Diagnostic Code:</Text>
                    <Text style={styles.errorText} numberOfLines={3}>
                        {error?.message || "Unknown Runtime Error"}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={resetErrorBoundary}
                    activeOpacity={0.8}
                >
                    <RefreshCw size={18} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Restart Workspace</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'System',
    },
    description: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
        fontFamily: 'System',
    },
    errorDetailsBox: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    errorLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    errorText: {
        fontSize: 11,
        color: '#4B5563',
        fontFamily: 'monospace',
        lineHeight: 16,
    },
    button: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        height: 52,
        borderRadius: 16,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default ErrorFallbackScreen;
