import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, GraduationCap, Briefcase } from 'lucide-react-native';
import { STRINGS, getResolvedUrl } from '../../../utils';
import styles from './styles';
import { loginUser } from '../../../slices/authSlice';

import { CustomInput } from '../../../components/CustomInput';
import { CustomButton } from '../../../components/CustomButton';
import { StatusModal } from '../../../components/common/StatusModal';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [statusModal, setStatusModal] = useState({ visible: false, type: 'error', title: '', message: '' });

  // 🎨 Dynamic branding configurations fetched on app launch
  const { primaryColor, secondaryColor, schoolName, logoUrl } = useSelector((state) => state.config);

  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.trim().toLowerCase().startsWith('http');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'CREDENTIAL ERROR',
        message: 'Please input your authorized institutional credentials.'
      });
      return;
    }

    dispatch(loginUser({
      loginId: email.trim(),
      password: password.trim(),
      role: role
    }, (res) => {
      if (!res.success) {
        setStatusModal({
          visible: true,
          type: 'error',
          title: 'AUTHENTICATION DENIED',
          message: res.error || 'Login failed.'
        });
      }
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[
              styles.logoCircle,
              {
                backgroundColor: isValidUrl(logoUrl) ? '#FFFFFF' : (primaryColor || '#1E40AF'),
                overflow: 'hidden'
              }
            ]}>
              {isValidUrl(logoUrl) ? (
                <Image
                  source={{ uri: getResolvedUrl(logoUrl) }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.logoChar}>{STRINGS.logoChar}</Text>
              )}
            </View>
            <Text style={styles.title}>{schoolName || STRINGS.appName}</Text>
            <Text style={styles.subtitle}>{STRINGS.institutionalHub}</Text>
          </View>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'student' && { backgroundColor: primaryColor || '#1E40AF' }
              ]}
              onPress={() => setRole('student')}
            >
              <GraduationCap size={20} color={role === 'student' ? '#fff' : '#666'} />
              <Text style={[styles.roleOptionText, role === 'student' && styles.activeRoleOptionText]}>{STRINGS.student}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'teacher' && { backgroundColor: primaryColor || '#1E40AF' }
              ]}
              onPress={() => setRole('teacher')}
            >
              <Briefcase size={20} color={role === 'teacher' ? '#fff' : '#666'} />
              <Text style={[styles.roleOptionText, role === 'teacher' && styles.activeRoleOptionText]}>{STRINGS.teacher}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <CustomInput
              label={role === 'student' ? STRINGS.admissionId : STRINGS.officialEmail}
              placeholder={role === 'student' ? STRINGS.enterAdmission : STRINGS.enterEmail}
              value={email}
              onChangeText={setEmail}
              autoCapitalize={role === 'student' ? 'characters' : 'none'}
              keyboardType="default"
            />

            <CustomInput
              label={role === 'student' ? STRINGS.dobLabel : STRINGS.accessPassword}
              placeholder={STRINGS.password}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? Eye : EyeOff}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
          </View>

          <CustomButton
            title={STRINGS.authenticate}
            onPress={handleLogin}
            loading={loading}
            variant="commit"
            style={{ marginTop: 20 }}
            colors={[primaryColor || '#6C63FF', secondaryColor || primaryColor || '#8B5CF6']}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: primaryColor || '#1E40AF' }]}>{STRINGS.recoveryProtocol}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{STRINGS.footerCredit}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal({ ...statusModal, visible: false })}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
