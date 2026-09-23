import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Play, Video } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { getResolvedUrl, COLORS, fontFamily } from '../../../../utils';

const BannerDetails = ({ route, navigation }) => {
  const { slide } = route.params || {};
  const insets = useSafeAreaInsets();
  const { primaryColor } = useSelector(state => state.config);

  if (!slide) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Details not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: primaryColor }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.trim().toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.avi') || cleanUrl.endsWith('.mkv');
  };

  const isVideo = isVideoUrl(slide.image_url);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header Image or Video Preview */}
      <View style={{ width: '100%', height: 300, backgroundColor: '#0F172A', position: 'relative' }}>
        {isVideo ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Poppins-Bold', opacity: 0.8, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Campus Broadcast Video
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (slide?.image_url) {
                  Linking.openURL(getResolvedUrl(slide.image_url));
                }
              }}
              style={[styles.playButton, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
            >
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 16, fontFamily: 'Poppins-Medium', textAlign: 'center' }}>
              Click to launch native player with full sound and controls
            </Text>
          </View>
        ) : (
          slide?.image_url && (
            <Image
              source={{ uri: getResolvedUrl(slide.image_url) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )
        )}
        
        {/* Absolute Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.floatingBack, { top: insets.top > 0 ? insets.top + 10 : 20 }]}
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content Details */}
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.titleText}>
            {slide?.title || 'Announcement'}
          </Text>
          
          {slide?.description ? (
            <Text style={styles.descriptionText}>
              {slide.description}
            </Text>
          ) : null}

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Poppins-Medium',
    marginBottom: 20
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14
  },
  floatingBack: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden'
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
    lineHeight: 30,
    marginBottom: 16
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 26,
    fontFamily: 'Poppins-Medium'
  }
});

export default BannerDetails;
