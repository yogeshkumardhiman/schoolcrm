import { View, Animated, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from "../Header";
import CustomStatusBar from "../CustomStatusBar";
import styles from "./styles";

const Wrapper = ({
  children,
  showHeader = false,
  headerProps = {},
  noTopInset = false,

  edges = noTopInset ? ['left', 'right'] : ['top', 'left', 'right'],
  parentStyle,

  // ✅ StatusBar control
  statusBarColor = "#ffffff",
  statusBarStyle = "dark-content",
  translucent = true,

  // ✅ Animation Props
  scrollY = new Animated.Value(0), // Can be passed from outside or defaults to new
}) => {

  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor: 'transparent',
  };

  // ✅ Prepare Header Props
  const resolvedHeaderProps = typeof headerProps === 'string'
    ? { title: headerProps }
    : { ...headerProps };

  return (
    <View style={{ flex: 1, backgroundColor: statusBarColor || '#ffffff' }}>
      <CustomStatusBar
        backgroundColor={statusBarColor || '#ffffff'}
        barStyle={statusBarStyle}
        translucent={translucent}
      />

      <View
        style={[
          styles.parent,
          {
            backgroundColor: '#ffffff',
            paddingTop: Platform.OS === 'android' && !translucent && edges.includes('top') ? insets.top : 0,
            paddingLeft: edges.includes('left') ? insets.left : 0,
            paddingRight: edges.includes('right') ? insets.right : 0,
            paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          },
          parentStyle
        ]}
      >
        {/* ✅ PERSISTENT STICKY HEADER */}
        {showHeader && <Header {...resolvedHeaderProps} scrollY={scrollY} />}

        {/* ✅ CONTENT HUB */}
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          {children}
        </View>
      </View>
    </View>
  );
};

export { Wrapper };


