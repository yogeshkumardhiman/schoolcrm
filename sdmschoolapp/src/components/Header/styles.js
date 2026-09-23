import { StyleSheet } from 'react-native';
import { COLORS, fontFamily } from "../../utils";

export const styles = StyleSheet.create({
  // 🏢 BASE CONTAINER
  headerContainer: {
    paddingTop: 46,
    paddingBottom: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },
  
  // 💡 MOCKUP LIGHT THEME (Flat White, Docker Style)
  lightHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: 'rgba(108, 99, 255, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },

  // 🌙 PREMIUM DARK THEME (Linear Gradient)
  darkHeader: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Frosted circular buttons
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  backBtnLight: {
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  backBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  title: {
    fontSize: 18,
    fontFamily: fontFamily.Poppins.Bold,
    letterSpacing: -0.3,
  },
  
  titleLight: {
    color: '#1F2937', // Main Text
  },

  titleDark: {
    color: '#FFFFFF',
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconBtnLight: {
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  iconBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Danger red status indicator
    borderWidth: 1.5,
  },
  
  badgeLight: {
    borderColor: '#FFFFFF',
  },

  badgeDark: {
    borderColor: '#6C63FF', // Primary purple match
  },

  childrenContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 2,
    zIndex: 10,
  },

  // Geometric Vector Line Patterns (Subtle depth overlay for Dark gradient headers only)
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    top: -80,
    left: -40,
  },
  patternCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    top: -10,
    right: -20,
  },
});
