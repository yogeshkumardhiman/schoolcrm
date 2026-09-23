import { StyleSheet } from 'react-native';
import { fontFamily, COLORS } from '../../../../utils';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB', // Modern soft background
    },
    
    // 📚 CONTENT LAYOUT
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    
    // 🏷️ FIGMA SEGMENTED TAB SELECTOR
    filterSection: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB', // Docked soft gray container
        borderRadius: 14,
        padding: 4,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 4,
    },
    tab: {
        flex: 1,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#6C63FF', // Mockup purple active fill
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    tabText: {
        fontSize: 12,
        fontFamily: fontFamily.Poppins.Bold,
        color: '#4B5563', // Secondary gray
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    skeletonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    }
});
