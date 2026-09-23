import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, PermissionsAndroid, Platform } from 'react-native';
import { User, Mail, Phone, Calendar, Droplets, MapPin, LogOut, Users, Edit3, Briefcase, Award, X, ShieldCheck, UserCheck, ChevronRight, Clock, QrCode, Scan } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateAuth, syncProfile, updateProfile } from '../../../../slices/authSlice';
import { COLORS, getResolvedUrl, STRINGS, fontFamily } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { fetchMyAttendance as fetchAttendanceThunk, submitSelfAttendance } from '../../../../slices/teacher';
import { Camera, CameraType } from 'react-native-camera-kit';

const Profile = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, role } = useSelector(state => state.auth);
    const { primaryColor } = useSelector(state => state.config);
    // console.log("user======>", user)
    // console.log("role======>", role)
    const isTeacher = role?.toLowerCase() === 'teacher';

    const dynamicPrimary = primaryColor || COLORS.primary;
    const dynamicSecondary = primaryColor ? `${primaryColor}CC` : COLORS.secondary;

    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        about: user?.about || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    const [myAttendance, setMyAttendance] = useState(null);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [fetchingAttendance, setFetchingAttendance] = useState(true);

    const [scannerVisible, setScannerVisible] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccessModal, setScanSuccessModal] = useState(false);
    const [scanSuccessDetails, setScanSuccessDetails] = useState(null);

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission Required',
                        message: 'This app needs access to your camera to scan attendance QR codes.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleOpenScanner = async () => {
        const hasPermission = await requestCameraPermission();
        if (hasPermission) {
            setScannerVisible(true);
            setIsScanning(true);
        } else {
            Toast.show({
                type: 'error',
                text1: 'Permission Denied',
                text2: 'Camera access is required to scan QR codes.'
            });
        }
    };

    const onBarCodeRead = (event) => {
        if (!isScanning) return;
        setIsScanning(false);
        const scannedToken = event.nativeEvent.codeStringValue;
        if (!scannedToken) {
            setIsScanning(true);
            return;
        }
        setScannerVisible(false);
        setMarkingAttendance(true);

        dispatch(submitSelfAttendance({ token: scannedToken }, (data, errorMsg) => {
            if (data) {
                const isCheckOut = !!data.checkOutTime;
                setScanSuccessDetails({
                    isCheckOut,
                    checkInTime: data.checkInTime,
                    checkOutTime: data.checkOutTime,
                    workingHours: data.workingHours
                });
                setScanSuccessModal(true);
                fetchMyAttendance();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Verification Failed',
                    text2: errorMsg || 'Invalid or expired QR code.'
                });
            }
            setMarkingAttendance(false);
        }));
    };

    const handleLogout = () => {
        setLogoutModalVisible(false);
        dispatch(logout());
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            dispatch(updateProfile(user.id || user._id, formData, (updatedUser) => {
                setLoading(false);
                if (updatedUser) {
                    setIsEditing(false);
                }
            }));
        } catch (e) {
            console.log("Profile Update Error:", e);
            setLoading(false);
        }
    };

    const fetchMyAttendance = useCallback(() => {
        if (!isTeacher) return;
        setFetchingAttendance(true);
        dispatch(fetchAttendanceThunk((data) => {
            if (data) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const today = `${year}-${month}-${day}`;

                const todayRecord = Array.isArray(data) ? data.find(r => {
                    if (!r.date) return false;
                    const recDate = typeof r.date === 'string' ? r.date.split('T')[0] : '';
                    return recDate === today;
                }) : null;
                setMyAttendance(todayRecord);
            }
            setFetchingAttendance(false);
        }));
    }, [isTeacher, dispatch]);

    const fetchProfileData = useCallback(() => {
        setLoading(true);
        dispatch(syncProfile((data) => {
            if (data) {
                setFormData({
                    about: data.about || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            }
            setLoading(false);
        }));
    }, [dispatch]);

    useEffect(() => {
        fetchProfileData();
        fetchMyAttendance();
    }, [fetchProfileData, fetchMyAttendance]);

    const handleMarkAttendance = (status) => {
        setMarkingAttendance(true);
        const now = new Date();
        const checkInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const payload = {
            date: now.toISOString().split('T')[0],
            status: status,
            checkInTime: status === 'PRESENT' ? checkInTime : null,
            remark: 'Profile Check-in'
        };
        dispatch(submitSelfAttendance(payload, (data) => {
            if (data) {
                setMyAttendance({ status, checkInTime: payload.checkInTime });
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `Attendance logged at ${checkInTime}`
                });
                fetchMyAttendance(); // Refresh to get full record
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to log attendance'
                });
            }
            setMarkingAttendance(false);
        }));
    };

    const InfoItem = ({ icon: Icon, label, value, color, field, multiline = false, isLast = false }) => (
        <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
            <View style={styles.infoLeft}>
                <View style={[styles.iconBox, { backgroundColor: color + '12' }]}>
                    <Icon size={16} color={color} />
                </View>
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            {isEditing && field ? (
                <TextInput
                    style={[styles.input, multiline && styles.textArea, { flex: 1.2, marginTop: 0 }]}
                    value={formData[field]}
                    onChangeText={(txt) => setFormData({ ...formData, [field]: txt })}
                    placeholder={`Enter ${label}`}
                    multiline={multiline}
                />
            ) : (
                <Text style={styles.infoValue} numberOfLines={2} ellipsizeMode="tail">{value || 'N/A'}</Text>
            )}
        </View>
    );
    const displayCheckIn = myAttendance?.checkInTime || (myAttendance?.createdAt ? new Date(myAttendance.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--');
    const displayCheckOut = myAttendance?.checkOutTime || '--:--';

    return (
        <Wrapper
            showHeader
            statusBarColor="#FFFFFF"
            statusBarStyle="dark-content"
            headerProps={{
                title: isTeacher ? "Faculty Profile" : "My Profile",
                showBack: false,
                theme: 'light'
            }}
        >
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

                    {isTeacher && (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? <X size={20} color={dynamicPrimary} /> : <Edit3 size={20} color={dynamicPrimary} />}
                        </TouchableOpacity>
                    )}

                    {/* 💳 FIGMA MOCKUP PROFILE CARD */}
                    <View style={styles.figmaProfileCard}>
                        <LinearGradient
                            colors={[dynamicPrimary, dynamicSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.figmaProfileGradient}
                        >
                            <View style={{ paddingVertical: 32, paddingHorizontal: 20, width: '100%', alignItems: 'center' }}>
                                <View style={styles.avatarBorder}>
                                    <Image
                                        source={{ uri: user?.image ? getResolvedUrl(user.image) : 'https://i.pravatar.cc/150?u=' + user?.name }}
                                        style={styles.avatar}
                                    />
                                </View>
                                <Text style={styles.studentName}>{user?.name}</Text>
                                <Text style={styles.studentSub}>
                                    {isTeacher ? user?.designation : `Class ${user?.class || 'N/A'} • Roll No. ${user?.rollNo || 'N/A'}`}
                                </Text>
                                {!isTeacher && (
                                    <Text style={styles.studentSub}>
                                        Session: {user?.sessn || STRINGS.sessionYear}
                                    </Text>
                                )}
                            </View>
                        </LinearGradient>
                    </View>

                    {isEditing && (
                        <View style={styles.saveRow}>
                            <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setIsEditing(false)}>
                                <Text style={[styles.btnText, { color: '#64748B' }]}>{STRINGS.cancelEdit}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: dynamicPrimary }]} onPress={handleSave}>
                                <Text style={styles.btnText}>{loading ? STRINGS.saving : STRINGS.saveChanges}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isTeacher && (
                        <View style={styles.bioSection}>
                            <View style={styles.sectionHeader}>
                                <User size={20} color={dynamicPrimary} />
                                <Text style={styles.sectionTitle}>{STRINGS.aboutMe}</Text>
                            </View>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.about}
                                    onChangeText={(txt) => setFormData({ ...formData, about: txt })}
                                    multiline
                                    placeholder={STRINGS.bioPlaceholderInput}
                                />
                            ) : (
                                <View style={styles.bioCard}>
                                    <Text style={styles.bioText}>{user?.about || STRINGS.bioPlaceholder}</Text>
                                </View>
                            )}
                        </View>
                    )}


                    <View style={styles.parentSection}>
                        <View style={styles.sectionHeader}>
                            {isTeacher ? <Briefcase size={20} color="#3B82F6" /> : <Users size={20} color="#3B82F6" />}
                            <Text style={styles.sectionTitle}>{isTeacher ? STRINGS.professionalOverview : STRINGS.studentDetails}</Text>
                        </View>
                        <View style={styles.parentCard}>
                            {isTeacher ? (
                                <>
                                    <InfoItem icon={Award} label={STRINGS.qualification} value={user?.qualification} color="#3B82F6" />
                                    <InfoItem icon={Calendar} label={STRINGS.subjects} value={user?.subject} color="#8B5CF6" />
                                    <InfoItem icon={Calendar} label={STRINGS.joiningDate} value={user?.joiningDate} color="#F59E0B" />
                                    <InfoItem icon={MapPin} label={STRINGS.workAddress} value={user?.address} color="#EF4444" field="address" multiline isLast={true} />
                                </>
                            ) : (
                                <>
                                    <InfoItem icon={User} label={STRINGS.studentId} value={user?.admissionNo} color="#3B82F6" />
                                    <InfoItem icon={Mail} label={STRINGS.email} value={user?.email} color="#8B5CF6" />
                                    <InfoItem icon={Calendar} label={STRINGS.dateOfBirth} value={user?.dob} color="#F59E0B" />
                                    <InfoItem icon={Droplets} label={STRINGS.bloodGroup} value={user?.bloodGroup} color="#EF4444" />
                                    <InfoItem icon={MapPin} label={STRINGS.address} value={user?.address} color="#3B82F6" isLast={true} />
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.parentSection}>
                        <View style={styles.sectionHeader}>
                            <Phone size={20} color="#10B981" />
                            <Text style={styles.sectionTitle}>{isTeacher ? STRINGS.contactChannels : STRINGS.parentDetails}</Text>
                        </View>
                        <View style={styles.parentCard}>
                            {isTeacher ? (
                                <>
                                    <InfoItem icon={Phone} label={STRINGS.phoneNum} value={user?.phone} color="#10B981" field="phone" />
                                    <InfoItem icon={Mail} label={STRINGS.officialMail} value={user?.email} color="#8B5CF6" isLast={true} />
                                </>
                            ) : (
                                <>
                                    <InfoItem icon={User} label={"FATHER'S NAME"} value={user?.fatherName} color="#3B82F6" />
                                    <InfoItem icon={Users} label={"MOTHER'S NAME"} value={user?.motherName} color="#EC4899" />
                                    <InfoItem icon={Phone} label={STRINGS.phone} value={user?.phone} color="#10B981" isLast={true} />
                                </>
                            )}
                        </View>
                    </View>

                    {isTeacher && (
                        <View style={styles.parentSection}>
                            <View style={styles.sectionHeader}>
                                <UserCheck size={20} color={COLORS.green} />
                                <Text style={styles.sectionTitle}>DAILY ATTENDANCE PROTOCOL</Text>
                            </View>
                            <View style={[styles.parentCard, { paddingVertical: 16 }]}>
                                <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray, marginBottom: 8 }}>
                                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Text>

                                {myAttendance?.status === 'LEAVE' ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12 }}>
                                        <View>
                                            <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: COLORS.warning }}>ON APPROVED LEAVE</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, marginTop: 2 }}>Enjoy your day off!</Text>
                                        </View>
                                        <View style={[styles.iconBox, { backgroundColor: COLORS.warning + '20' }]}>
                                            <Clock size={20} color={COLORS.warning} />
                                        </View>
                                    </View>
                                ) : (myAttendance?.status !== 'PRESENT') ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>PENDING CHECK-IN</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, marginTop: 2 }}>Scan the school dashboard QR code to check in.</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleOpenScanner}
                                            disabled={markingAttendance}
                                            style={{ backgroundColor: COLORS.green, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: markingAttendance ? 0.6 : 1 }}
                                        >
                                            <Scan size={16} color={COLORS.white} />
                                            <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Bold, color: COLORS.white }}>CHECK IN</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : !myAttendance?.checkOutTime ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: COLORS.green }}>CHECKED IN</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray, marginTop: 2 }}>In Time: {displayCheckIn}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleOpenScanner}
                                            disabled={markingAttendance}
                                            style={{ backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: markingAttendance ? 0.6 : 1 }}
                                        >
                                            <Scan size={16} color={COLORS.white} />
                                            <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Bold, color: COLORS.white }}>CHECK OUT</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: '#0F172A' }}>TODAY'S SHIFT COMPLETED</Text>
                                            <View style={[styles.iconBox, { backgroundColor: '#E2F0D9' }]}>
                                                <UserCheck size={20} color={COLORS.green} />
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                            <View>
                                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray }}>CHECK IN</Text>
                                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#334155', marginTop: 2 }}>{displayCheckIn}</Text>
                                            </View>
                                            <View style={{ width: 1, backgroundColor: '#E2E8F0', height: '100%' }} />
                                            <View>
                                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray }}>CHECK OUT</Text>
                                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#334155', marginTop: 2 }}>{displayCheckOut}</Text>
                                            </View>
                                            <View style={{ width: 1, backgroundColor: '#E2E8F0', height: '100%' }} />
                                            <View>
                                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Medium, color: COLORS.gray }}>DURATION</Text>
                                                <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: dynamicPrimary, marginTop: 2 }}>{myAttendance.workingHours || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {isTeacher && (
                        <View style={styles.parentSection}>
                            <View style={styles.sectionHeader}>
                                <ShieldCheck size={20} color={dynamicPrimary} />
                                <Text style={styles.sectionTitle}>GOVERNANCE & RECORDS</Text>
                            </View>
                            <View style={styles.parentCard}>
                                <TouchableOpacity
                                    style={styles.governanceItem}
                                    onPress={() => navigation.navigate('AttendanceHistory')}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: COLORS.green + '15' }]}>
                                        <UserCheck size={20} color={COLORS.green} />
                                    </View>
                                    <Text style={styles.governanceText}>My Attendance Registry</Text>
                                    <ChevronRight size={18} color={COLORS.gray + '50'} />
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity
                                    style={styles.governanceItem}
                                    onPress={() => navigation.navigate('ApplyLeave')}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: dynamicPrimary + '15' }]}>
                                        <Clock size={20} color={dynamicPrimary} />
                                    </View>
                                    <Text style={styles.governanceText}>Leave Petition Hub</Text>
                                    <ChevronRight size={18} color={COLORS.gray + '50'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}


                    <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
                        <LogOut size={20} color={COLORS.danger} />
                        <Text style={styles.logoutText}>{STRINGS.logout}</Text>
                    </TouchableOpacity>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* 🛡️ PREMIUM LOGOUT MODAL */}
                <Modal
                    visible={isLogoutModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setLogoutModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalIconBox}>
                                <LogOut size={32} color={COLORS.danger} />
                            </View>
                            <Text style={styles.modalTitle}>{STRINGS.confirmLogout}</Text>
                            <Text style={styles.modalDesc}>{STRINGS.logoutDesc}</Text>

                            <View style={styles.modalActionRow}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setLogoutModalVisible(false)}
                                >
                                    <Text style={styles.cancelBtnText}>{STRINGS.cancel}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmBtn}
                                    onPress={handleLogout}
                                >
                                    <Text style={styles.confirmBtnText}>{STRINGS.logout}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 📷 QR CAMERA SCANNER MODAL */}
                <Modal
                    visible={scannerVisible}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => setScannerVisible(false)}
                >
                    <View style={styles.scannerOverlay}>
                        <View style={styles.scannerHeader}>
                            <Text style={styles.scannerTitle}>Scan Attendance QR Code</Text>
                            <TouchableOpacity
                                style={styles.closeScanBtn}
                                onPress={() => setScannerVisible(false)}
                            >
                                <X size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        
                        <Camera
                            style={styles.cameraStyle}
                            cameraType={CameraType.Back}
                            scanBarcode={isScanning}
                            onReadCode={onBarCodeRead}
                            showFrame={true}
                            laserColor={dynamicPrimary}
                            frameColor="#FFFFFF"
                        />

                        <View style={styles.scannerFooter}>
                            <Text style={styles.scannerTip}>
                                Align the rotating QR code on the admin screen inside the frame.
                            </Text>
                        </View>
                    </View>
                </Modal>

                {/* 🎉 SUCCESS POPUP MODAL */}
                <Modal
                    visible={scanSuccessModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setScanSuccessModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={[styles.modalIconBox, { backgroundColor: '#E8F5E9' }]}>
                                <ShieldCheck size={40} color={COLORS.green} />
                            </View>
                            <Text style={styles.modalTitle}>ATTENDANCE RECORDED</Text>
                            <Text style={[styles.modalDesc, { color: '#334155', fontSize: 14, fontFamily: fontFamily.Poppins.Bold, marginBottom: 8 }]}>
                                Hello, {user?.name}!
                            </Text>
                            <Text style={styles.modalDesc}>
                                {scanSuccessDetails?.isCheckOut 
                                    ? `You have successfully Checked-Out for today.\n\nCheck-In: ${scanSuccessDetails?.checkInTime || 'N/A'}\nCheck-Out: ${scanSuccessDetails?.checkOutTime || 'N/A'}\nTotal Duration: ${scanSuccessDetails?.workingHours || 'N/A'}`
                                    : `You have successfully Checked-In for today at ${scanSuccessDetails?.checkInTime || 'N/A'}.\n\nHave a great day at school!`
                                }
                            </Text>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: COLORS.green, width: '100%' }]}
                                onPress={() => setScanSuccessModal(false)}
                            >
                                <Text style={styles.confirmBtnText}>GREAT, THANKS!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Wrapper>
    );
};

export default Profile;
