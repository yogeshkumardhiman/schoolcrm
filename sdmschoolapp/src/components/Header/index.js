import React from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bell, ArrowLeft, Menu } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { styles } from './styles';
import { COLORS } from '../../utils';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Header = ({
  title = '',
  showBack = false,
  showBell = false,
  showMenu = false,
  showBadge = false,       // 🔴 Red dot — only show when there are real unread notices
  onBellPress = null,      // Bell press handler
  theme = 'light',
  onCalendarPress,
  showCalendar = false,
  styleView = {},
  containerStyle = {},
  rightComponent,
  onBack,
  children,
}) => {
  const navigation = useNavigation();
  const { primaryColor } = useSelector(state => state.config || {});

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const onMenu = () => {
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (e) {
      console.log("Drawer not available");
    }
  };

  const insets = useSafeAreaInsets();
  const isLight = theme === 'light';
  
  // Dynamic Style Selections
  const dynamicPaddingTop = Platform.OS === 'ios' ? Math.max(insets.top, 20) : (insets.top || 46);
  
  const headerStyle = [
    styles.headerContainer,
    isLight ? styles.lightHeader : styles.darkHeader,
    { paddingTop: dynamicPaddingTop + 10 }, // Extra padding to keep content away from the very edge
    containerStyle
  ];
  
  const backBtnStyle = [
    styles.backBtn,
    isLight ? styles.backBtnLight : styles.backBtnDark
  ];

  const titleStyle = [
    styles.title,
    isLight ? styles.titleLight : styles.titleDark
  ];

  const iconBtnStyle = [
    styles.iconBtn,
    isLight ? styles.iconBtnLight : styles.iconBtnDark
  ];

  const badgeStyle = [
    styles.badge,
    isLight ? styles.badgeLight : styles.badgeDark
  ];

  const iconColor = isLight ? '#1F2937' : '#FFFFFF';

  // Render content children
  const renderHeaderContent = () => (
    <>
      {/* Decorative Vector Line Accents (Only on dark gradient headers) */}
      {!isLight && (
        <>
          <View style={styles.patternCircle1} pointerEvents="none" />
          <View style={styles.patternCircle2} pointerEvents="none" />
        </>
      )}

      <View style={[styles.mainView, styleView]}>
        {/* Left Section (Back/Menu Button + Title) */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={backBtnStyle} activeOpacity={0.75}>
              <ArrowLeft size={18} color={iconColor} />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity onPress={onMenu} style={backBtnStyle} activeOpacity={0.75}>
              <Menu size={18} color={iconColor} />
            </TouchableOpacity>
          ) : null}

          <Text style={titleStyle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightContainer}>
          {rightComponent ? (
            rightComponent
          ) : (
            <>
              {/* Bell — only shows badge when showBadge=true (real unread notices exist) */}
              {showBell && (
                <TouchableOpacity
                  style={iconBtnStyle}
                  activeOpacity={0.75}
                  onPress={onBellPress}
                >
                  <Bell size={18} color={iconColor} />
                  {showBadge && (
                    <View style={[
                      styles.badge,
                      isLight ? styles.badgeLight : styles.badgeDark
                    ]} />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      
      {/* Dynamic Children Slot (Summary Cards, etc) */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </>
  );

  // Dynamically wrap with LinearGradient if Dark theme, otherwise a standard View
  if (isLight) {
    return (
      <View style={headerStyle}>
        {renderHeaderContent()}
      </View>
    );
  }

  return (
    <AnimatedLinearGradient
      colors={primaryColor ? [primaryColor, primaryColor + 'dd'] : COLORS.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={headerStyle}
    >
      {renderHeaderContent()}
    </AnimatedLinearGradient>
  );
};

export default Header;
