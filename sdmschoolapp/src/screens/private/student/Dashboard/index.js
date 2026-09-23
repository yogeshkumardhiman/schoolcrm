import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, Dimensions, Linking, Modal, ScrollView as RNScrollView, RefreshControl } from 'react-native';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import {
  Bell,
  Calendar,
  IndianRupee,
  Trophy,
  UserCheck,
  BookOpen,
  Clock,
  Headphones,
  Award,
  User,
  Megaphone,
  ShieldAlert,
  AlertTriangle,
  GraduationCap,
  Play,
  Video,
  X
} from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, getResolvedUrl, fontFamily, screenWidth } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { getDashboardData, getClassTeacherData, getInstitutionalNotices } from '../../../../slices/student';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAppConfiguration } from '../../../../slices/configSlice';

const StudentDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // 🎨 DYNAMIC CONFIGURATIONS FROM SERVER
  const {
    primaryColor,
    secondaryColor,
    schoolName,
    appTitle,
    logoUrl,
    activeFeatures,
    maintenanceMode,
    emergencyAlert,
    banners,
    webBanners,
    timings
  } = useSelector(state => state.config);

  const [classTeacher, setClassTeacher] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.trim().toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.avi') || cleanUrl.endsWith('.mkv');
  };

  const handleBannerPress = (slide) => {
    if (!slide) return;
    if (slide.image_url === 'DEFAULT_GRADIENT') return;

    const validRoutes = [
      'StudentHomework', 'StudentTimeTable', 'StudentFees', 
      'HelpDesk', 'StudentMarks', 'NoticeScreen', 
      'StudentEvents', 'ProfileScreen'
    ];
    
    if (slide.action_route && validRoutes.includes(slide.action_route)) {
      try {
        navigation.navigate(slide.action_route);
        return;
      } catch (err) {
        console.log("[Dashboard] Banner navigation failed:", err);
      }
    }

    // Default action: Go to BannerDetails screen
    navigation.navigate('BannerDetails', { slide });
  };

  // Toggle emergency notice if Super Admin pushed it
  useEffect(() => {
    const checkEmergency = async () => {
      if (emergencyAlert?.active) {
        try {
          const stored = await AsyncStorage.getItem('acknowledged_emergency_alert');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.title === emergencyAlert.title && parsed.message === emergencyAlert.message) {
              return;
            }
          }
          setShowEmergencyModal(true);
        } catch (e) {
          setShowEmergencyModal(true);
        }
      }
    };
    checkEmergency();
  }, [emergencyAlert?.active, emergencyAlert?.title, emergencyAlert?.message]);

  const [hasUnreadNotices, setHasUnreadNotices] = useState(false);

  const fetchData = useCallback((isRefresh = false) => {
    if (isRefresh) {
      dispatch(fetchAppConfiguration());
    }

    // 👨‍🏫 DEDICATED TEACHER LOOKUP
    if (user?.class && user?.section) {
      dispatch(getClassTeacherData(user.class, user.section, (data) => {
        if (data?.name) setClassTeacher(data.name);
      }));
    }

    // Fetch latest notice to check for unread red dot
    if (user?.class) {
      dispatch(getInstitutionalNotices(user.class, user.section, user.id, 1, 1, async (data) => {
        try {
          const noticesList = data?.notices || (Array.isArray(data) ? data : []);
          if (noticesList && noticesList.length > 0) {
            const latestNoticeId = Number(noticesList[0].id);
            const lastReadStr = await AsyncStorage.getItem('lastReadNoticeId');
            const lastReadId = lastReadStr ? Number(lastReadStr) : 0;
            
            if (latestNoticeId > lastReadId) {
              setHasUnreadNotices(true);
            } else {
              setHasUnreadNotices(false);
            }
          } else {
            setHasUnreadNotices(false);
          }
        } catch (err) {
          console.log("[Dashboard] Unread notices check failed:", err);
        }
      }));
    }

    if (user?.admissionNo) {
      dispatch(
        getDashboardData(user.admissionNo, (data) => {
          if (data) setDashboardData(data);
          setLoading(false);
          setRefreshing(false);
        })
      );
    } else {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.admissionNo, user?.class, user?.section, user?.id, dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // ⚡ FIGMA CIRCULAR ATTENDANCE RING
  const CircularProgress = ({ percentage = 92, radius = 34, strokeWidth = 5.5 }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#EEF2FF"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={primaryColor} // Dynamic primary branding color!
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
          />
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.figmaAttendancePercentText}>
            {percentage}%
          </Text>
          <Text style={styles.figmaAttendanceLabelText}>Attendance</Text>
          <Svg width={14} height={4} viewBox="0 0 14 4" style={{ marginTop: 2 }}>
            <Path
              d="M0,2 Q3.5,0 7,2 T14,2"
              fill="none"
              stroke={primaryColor} // Dynamic primary branding color!
              strokeWidth={1.5}
            />
          </Svg>
        </View>
      </View>
    );
  };

  // ⚡ FIGMA 4-COLUMN MENU ITEM
  const renderFigmaMenuItem = (label, icon, color, route) => (
    <TouchableOpacity
      style={styles.figmaGridItem}
      onPress={() => {
        navigation.navigate(route);
      }}
      activeOpacity={0.8}
      key={route}
    >
      <View style={styles.figmaGridCard}>
        <View style={styles.figmaGridIconBox}>
          {React.createElement(icon, { size: 24, color: primaryColor, strokeWidth: 2 })}
        </View>
        <Text style={styles.figmaGridText} numberOfLines={2}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  // 🖼️ HORIZONTAL BANNER SLIDER CAROUSEL
  const BannerCarousel = () => {
    const { width } = Dimensions.get('window');
    const bannerWidth = width - 32; // Spacing margin

    const defaultSlides = [
      {
        id: 'default1',
        title: `Welcome to ${schoolName}!`,
        description: 'Empowering students to achieve their academic goals dynamically.',
        image_url: 'DEFAULT_GRADIENT'
      }
    ];

    const activeSlides = banners && Array.isArray(banners) && banners.length > 0 ? banners : defaultSlides;

    return (
      <View style={{ marginTop: 16 }}>
        <View style={[styles.figmaSectionHeader, { marginTop: 0 }]}>
          <Text style={styles.figmaSectionTitle}>Announcements</Text>
        </View>
        <View style={{ width: width }}>
          <SwiperFlatList
            autoplay
            autoplayDelay={3}
            autoplayLoop
            showPagination={true}
            paginationActiveColor={primaryColor}
            paginationDefaultColor="rgba(255,255,255,0.5)"
            paginationStyleItem={{ width: 8, height: 8, marginHorizontal: 4 }}
            data={activeSlides}
            renderItem={({ item: slide, index }) => {
              const isGradient = slide.image_url === 'DEFAULT_GRADIENT';
              const isVideo = isVideoUrl(slide.image_url);

              return (
              <View style={{ width: width, paddingHorizontal: 16 }}>
                <TouchableOpacity
                  key={slide.id || index}
                  activeOpacity={0.9}
                  onPress={() => handleBannerPress(slide)}
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    elevation: 2,
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    borderWidth: 1,
                    borderColor: '#EEF2FF'
                  }}
                >
                {isGradient ? (
                  <View style={{
                    flex: 1,
                    padding: 20,
                    justifyContent: 'center',
                    backgroundColor: primaryColor,
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins-Bold' }}>
                      {slide.title}
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 11, opacity: 0.9, marginTop: 4, lineHeight: 16, fontFamily: 'Poppins-Medium' }}>
                      {slide.description}
                    </Text>
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    {isVideo ? (
                      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFFFFF', zIndex: 10 }}>
                          <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                        </View>
                        <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(239, 68, 68, 0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Video size={10} color="#FFFFFF" />
                          <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold', fontFamily: 'Poppins-Bold' }}>VIDEO</Text>
                        </View>
                      </View>
                    ) : (
                      <Image source={{ uri: getResolvedUrl(slide.image_url) }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
                    )}
                    <View style={{
                      flex: 1,
                      backgroundColor: 'rgba(15, 23, 42, 0.45)',
                      padding: 20,
                      justifyContent: 'center'
                    }}>
                      {slide.title ? (
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins-Bold' }}>
                          {slide.title}
                        </Text>
                      ) : null}
                      {slide.description ? (
                        <Text style={{ color: '#FFFFFF', fontSize: 11, opacity: 0.9, marginTop: 4, lineHeight: 16, fontFamily: 'Poppins-Medium' }}>
                          {slide.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                )}
                </TouchableOpacity>
              </View>
              );
            }}
          />
        </View>
      </View>
    );
  };

  // 🖼️ ADMISSIONS & WEB HIGHLIGHTS CAROUSEL
  const WebBannerCarousel = () => {
    const { width } = Dimensions.get('window');
    const bannerWidth = width - 48; // Slightly smaller to show preview of next slide

    const activeSlides = webBanners && Array.isArray(webBanners) && webBanners.length > 0 ? webBanners : [];
    
    if (activeSlides.length === 0) return null;

    return (
      <View style={{ marginTop: 12, marginBottom: 4 }}>
        <View style={[styles.figmaSectionHeader, { marginTop: 0 }]}>
          <Text style={styles.figmaSectionTitle}>Admissions & Highlights</Text>
        </View>
        <View style={{ width: width }}>
          <SwiperFlatList
            autoplay
            autoplayDelay={4}
            autoplayLoop
            autoplayInvertDirection
            showPagination={true}
            paginationActiveColor={primaryColor}
            paginationDefaultColor="rgba(255,255,255,0.5)"
            paginationStyleItem={{ width: 8, height: 8, marginHorizontal: 4 }}
            data={activeSlides}
            renderItem={({ item: slide, index }) => {
              const isVideo = isVideoUrl(slide.image_url);

              return (
              <View style={{ width: width, paddingHorizontal: 16 }}>
                <TouchableOpacity
                  key={slide.id || index}
                  activeOpacity={0.9}
                  onPress={() => handleBannerPress(slide)}
                  style={{
                    width: '100%',
                    height: 200, // Taller banner
                    borderRadius: 12, // Reduced radius
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    elevation: 4,
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    borderWidth: 1.5,
                    borderColor: '#FFFFFF'
                  }}
                >
                <View style={{ flex: 1 }}>
                  {isVideo ? (
                    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFFFFF', zIndex: 10 }}>
                        <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                      </View>
                    </View>
                  ) : (
                    <Image source={{ uri: getResolvedUrl(slide.image_url) }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
                  )}
                  <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    padding: 20,
                    justifyContent: 'flex-end'
                  }}>
                    {slide.title ? (
                      <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', fontFamily: 'Poppins-Bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 }}>
                        {slide.title}
                      </Text>
                    ) : null}
                    {slide.description ? (
                      <Text style={{ color: '#FFFFFF', fontSize: 11, opacity: 0.95, marginTop: 4, lineHeight: 16, fontFamily: 'Poppins-Medium', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 }} numberOfLines={2}>
                        {slide.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
                </TouchableOpacity>
              </View>
              );
            }}
          />
        </View>
      </View>
    );
  };

  // 🚧 OVERLAY: MAINTENANCE MODE
  if (maintenanceMode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        <View style={{ height: 160, width: 160, borderRadius: 80, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <AlertTriangle size={72} color="#EF4444" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 12 }}>
          System Under Maintenance
        </Text>
        <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>
          Our digital campus is undergoing system-wide upgrades. We will be back online shortly with enhanced learning features!
        </Text>
        <View style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 10, color: '#374151', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {schoolName} System
          </Text>
        </View>
      </View>
    );
  }

  // 📊 DYNAMIC ATTENDANCE CALCULATION
  const calculateAttendancePercentage = () => {
    if (!dashboardData || !dashboardData.attendance) return 0; // Default to 0% if no data yet
    
    const attRecords = dashboardData.attendance;
    const workingDays = dashboardData.totalWorkingDays || attRecords.length;
    
    if (workingDays === 0) return 0; // 0% if no working days exist

    const presentCount = attRecords.filter(a => ['PRESENT', 'P'].includes(a.status?.toUpperCase())).length;
    return Math.round((presentCount / workingDays) * 100);
  };

  const cleanAttPercent = calculateAttendancePercentage();
  // Good Morning Greeting Logic
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning! 👋';
    if (hours < 17) return 'Good Afternoon! ☀️';
    return 'Good Evening! 🌙';
  };

  return (
    <Wrapper showHeader={false}>
      <View style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
        {/* 👤 FIGMA INLINE GREETING HEADER */}
        <View style={styles.figmaHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            {/* 🏫 School Name Identity */}
            <Text style={{
              fontSize: 10.5,
              fontWeight: 'bold',
              color: primaryColor,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontFamily: fontFamily?.Poppins?.Bold || 'System',
              marginBottom: 3
            }} numberOfLines={1}>
              {schoolName || 'SDM Public School'}
            </Text>
            <Text style={styles.figmaHeaderGreeting}>{getGreeting()}</Text>
            <Text style={styles.figmaHeaderName} numberOfLines={1}>
              {dashboardData?.student?.name || user?.name}
            </Text>
          </View>
          <View style={styles.figmaHeaderRight}>
            {/* Bell Icon Button */}
            <TouchableOpacity
              style={styles.figmaBellBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('NoticeScreen')}
            >
              <Bell size={18} color="#1F2937" strokeWidth={2.2} />
              {hasUnreadNotices && <View style={styles.figmaBellBadge} />}
            </TouchableOpacity>

            {/* School Logo / Icon (Branded!) */}
            <View style={[styles.figmaAvatarBtn, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }]}>
              {logoUrl ? (
                <Image
                  source={{ uri: getResolvedUrl(logoUrl) }}
                  style={{ width: screenWidth(10), height: screenWidth(10), borderRadius: 18, }}
                  resizeMode='cover'
                />
              ) : (
                <View style={[styles.figmaAvatarPlaceholder, { backgroundColor: primaryColor + '15', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 18 }]}>
                  <GraduationCap size={16} color={primaryColor} strokeWidth={2} />
                </View>
              )}
            </View>
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor || '#1E40AF']}
            />
          }
        >
          {/* 👤 FIGMA PROFILE CARD (WHITE PREMIUM CONTAINER) */}
        <View style={styles.figmaProfileCard}>
          {/* Avatar Container */}
          <View style={styles.figmaProfileImgWrapper}>
            {user?.image ? (
              <Image
                source={{ uri: getResolvedUrl(user.image) }}
                style={styles.figmaProfileImg}
              />
            ) : (
              <View style={[styles.figmaProfileInitialBox, { backgroundColor: primaryColor + '20' }]}>
                <Text style={[styles.figmaProfileInitialText, { color: primaryColor }]}>
                  {getInitials(user?.name)}
                </Text>
              </View>
            )}
          </View>

          {/* Student Info Container */}
          <View style={styles.figmaProfileInfo}>
            <Text style={styles.figmaProfileName} numberOfLines={1}>
              {dashboardData?.student?.name || user?.name}
            </Text>

            {/* Badges Row (Class, Section, Roll No) */}
            <View style={styles.figmaBadgesRow}>
              <View style={[styles.figmaClassBadge, { backgroundColor: primaryColor + '15' }]}>
                <Text style={[styles.figmaClassText, { color: primaryColor }]}>
                  Class {dashboardData?.student?.class || user?.class}
                </Text>
              </View>

              <View style={[styles.figmaClassBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.figmaClassText, { color: '#10B981' }]}>
                  Sec {dashboardData?.student?.section || user?.section}
                </Text>
              </View>

              <View style={styles.figmaRollBadge}>
                <Text style={styles.figmaRollText}>
                  Roll No. {dashboardData?.student?.rollNo || user?.rollNo || '4'}
                </Text>
              </View>
            </View>

            {/* Class Teacher Capsule */}
            <View style={styles.figmaTeacherCapsule}>
              <View style={styles.figmaTeacherIconBox}>
                <User size={13} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.figmaTeacherTextBox}>
                <Text style={styles.figmaTeacherLabel}> Class Teacher</Text>
                <Text style={styles.figmaTeacherNameText} numberOfLines={1}>
                  {classTeacher || 'Not Assigned'}
                </Text>
              </View>
            </View>
          </View>

          {/* Circular Attendance Ring */}
          <View style={styles.figmaAttendanceSection}>
            <CircularProgress percentage={cleanAttPercent} />
          </View>
        </View>

        {/* 🖼️ HORIZONTAL DYNAMIC BANNER SLIDER */}
        <WebBannerCarousel />

        {/* ⚡ FIGMA QUICK ACCESS 4-COLUMN GRID */}
        <View style={styles.figmaSectionHeader}>
          <Text style={styles.figmaSectionTitle}>Quick Access</Text>
        </View>

        <View style={styles.figmaGrid}>
          {[
            { id: 'homework', label: 'Homework', icon: BookOpen, color: COLORS.homework, route: 'StudentHomework' },
            { id: 'timetable', label: 'Timetable', icon: Clock, color: COLORS.timetable, route: 'StudentTimeTable' },
            { id: 'fees', label: 'Fee Status', icon: IndianRupee, color: COLORS.feeStatus, route: 'StudentFees' },
            { id: 'helpdesk', label: 'Help Desk', icon: Headphones, color: COLORS.helpDesk, route: 'HelpDesk' },
            { id: 'exams', label: 'Results', icon: Award, color: COLORS.results, route: 'StudentMarks' },
            { id: 'notice', label: 'Notice Board', icon: Megaphone, color: COLORS.notices, route: 'NoticeScreen' },
            { id: 'calendar', label: 'Calendar', icon: Calendar, color: COLORS.events, route: 'StudentEvents' },
            { id: 'profile', label: 'Profile', icon: User, color: COLORS.attendance, route: 'ProfileScreen' }
          ]
            .filter(item => Array.isArray(activeFeatures) && activeFeatures.includes(item.id))
            .map(item => renderFigmaMenuItem(item.label, item.icon, item.color, item.route))
          }
        </View>

        <BannerCarousel />

        {/* 🕐 SCHOOL TIMING CARD */}
        {timings && (
          <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 8 }}>
            <View style={styles.figmaSectionHeader}>
              <Text style={styles.figmaSectionTitle}>School Timings</Text>
            </View>
            <View style={{
              flexDirection: 'row',
              gap: 10,
            }}>
              {/* Summer */}
              <View style={{
                flex: 1,
                backgroundColor: '#FFFBEB',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: '#FDE68A',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Clock size={13} color="#D97706" strokeWidth={2.5} />
                  <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#D97706', textTransform: 'uppercase', letterSpacing: 1 }}>Summer</Text>
                </View>
                <Text style={{ fontSize: 15, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#92400E' }}>
                  {timings.summer?.startTime} – {timings.summer?.endTime}
                </Text>
                <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Medium || 'System', color: '#B45309', marginTop: 3 }}>
                  {timings.summer?.months || 'Apr – Sep'}
                </Text>
              </View>
              {/* Winter */}
              <View style={{
                flex: 1,
                backgroundColor: '#EFF6FF',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: '#BFDBFE',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Clock size={13} color="#2563EB" strokeWidth={2.5} />
                  <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#2563EB', textTransform: 'uppercase', letterSpacing: 1 }}>Winter</Text>
                </View>
                <Text style={{ fontSize: 15, fontFamily: fontFamily?.Poppins?.Bold || 'System', color: '#1E3A8A' }}>
                  {timings.winter?.startTime} – {timings.winter?.endTime}
                </Text>
                <Text style={{ fontSize: 9, fontFamily: fontFamily?.Poppins?.Medium || 'System', color: '#3B82F6', marginTop: 3 }}>
                  {timings.winter?.months || 'Oct – Mar'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 📬 TODAY'S HOMEWORK */}
        <View style={styles.figmaSectionHeader}>
          <Text style={styles.figmaSectionTitle}>Today's Homework</Text>
          <TouchableOpacity onPress={() => navigation.navigate('StudentHomework')}>
            <Text style={[styles.figmaViewAll, { color: primaryColor }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.figmaHomeworkCard}
          onPress={() => navigation.navigate('StudentHomework')}
          activeOpacity={0.85}
        >
          <View style={styles.figmaHomeworkIcon}>
            <BookOpen size={20} color={COLORS.homework} strokeWidth={2.2} />
          </View>
          <View style={styles.figmaHomeworkInfo}>
            <Text style={styles.figmaHomeworkSubject}>English</Text>
            <Text style={styles.figmaHomeworkTitle}>Learn Chapter 5 - Vocabulary</Text>
            <Text style={styles.figmaHomeworkDate}>Due: 28 May, 2026</Text>
          </View>
          <View style={styles.figmaHomeworkStatus}>
            <Text style={styles.figmaHomeworkStatusText}>Pending</Text>
          </View>
        </TouchableOpacity>

      </Animated.ScrollView>
      </View>

      {/* ⚠️ DIALOG: EMERGENCY MODAL */}
      {showEmergencyModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: 24
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            width: '100%',
            borderRadius: 28,
            padding: 24,
            elevation: 8,
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            borderWidth: 1,
            borderColor: '#FEE2E2'
          }}>
            <View style={{
              height: 48,
              width: 48,
              borderRadius: 24,
              backgroundColor: '#FEF2F2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <ShieldAlert size={24} color="#EF4444" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, fontFamily: 'Poppins-Bold' }}>
              {emergencyAlert?.title || 'Emergency Notice'}
            </Text>
            <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 24, fontFamily: 'Poppins-Medium' }}>
              {emergencyAlert?.message || 'Important alert details.'}
            </Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await AsyncStorage.setItem('acknowledged_emergency_alert', JSON.stringify({
                    title: emergencyAlert?.title || '',
                    message: emergencyAlert?.message || ''
                  }));
                } catch (e) {
                  console.log("Failed to save emergency alert acknowledgment:", e);
                }
                setShowEmergencyModal(false);
              }}
              style={{
                backgroundColor: primaryColor,
                height: 48,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                Acknowledge Notice
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </Wrapper>
  );
};

export default StudentDashboard;