import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { CreditCard, CheckCircle2, Bus, Info, Printer, X, Download, FileText } from 'lucide-react-native';
import { COLORS, STRINGS, fontFamily} from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardData } from '../../../../slices/student';
import Skeleton from '../../../../components/common/Skeleton';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { APIService } from '../../../../services/APIServices';


const StudentFees = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { primaryColor, schoolName, enableOnlinePayments, razorpayKeyId } = useSelector(state => state.config);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const dynamicPrimary = primaryColor || COLORS.primary;
    const dynamicSecondary = primaryColor ? `${primaryColor}CC` : COLORS.secondary;
    const api = new APIService();

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDueIds, setSelectedDueIds] = useState([]);

    useEffect(() => {
        dispatch(getDashboardData(user?.admissionNo, (data) => {
            setDashboardData(data);
            setLoading(false);
        }));
    }, [user?.admissionNo, dispatch]);

    const handleViewReceipt = (payment) => {
        setSelectedPayment(payment);
        setModalVisible(true);
    };

    const student = dashboardData?.student;
    const finance = dashboardData?.finance;
    const history = finance?.history || [];

    const totalDue = parseFloat(finance?.summary?.dueAmount || 0);
    const totalPaid = parseFloat(finance?.summary?.paidAmount || 0);
    const totalFees = parseFloat(finance?.summary?.totalAmount || 0);

    const pendingDues = (finance?.dues || []).filter(d => d.status !== 'PAID');

    const toggleDueSelection = (dueId) => {
        setSelectedDueIds(prev => 
            prev.includes(dueId) ? prev.filter(id => id !== dueId) : [...prev, dueId]
        );
    };

    const selectedAmount = pendingDues
        .filter(d => selectedDueIds.includes(d.id))
        .reduce((sum, d) => sum + (parseFloat(d.totalAmount || 0) - parseFloat(d.paidAmount || 0)), 0);

    const handlePayOnline = () => {
        if (!enableOnlinePayments || !razorpayKeyId) {
            alert('Online payments are currently unavailable.');
            return;
        }

        let idsToPay = selectedDueIds;
        let amountToPay = selectedAmount;

        if (!idsToPay.length) {
            idsToPay = pendingDues.map(d => d.id);
            amountToPay = pendingDues.reduce((sum, d) => sum + (parseFloat(d.totalAmount || 0) - parseFloat(d.paidAmount || 0)), 0);

            if (!idsToPay.length) {
                alert('No pending dues to pay.');
                return;
            }
        }
        
        if (amountToPay <= 0) {
            alert('Amount must be greater than zero.');
            return;
        }

        navigation.navigate('PaymentCheckout', {
            amountToPay,
            idsToPay,
            pendingDues
        });
    };

    if (loading) {
        return (
            <Wrapper 
                showHeader 
                headerProps={{ 
                    title: STRINGS.fees.toUpperCase(), 
                    showBack: true 
                }}
            >
                <View style={{ padding: 24 }}>
                    <View style={{ backgroundColor: '#F1F5F9', borderRadius: 24, padding: 24, marginBottom: 30 }}>
                        <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 12 }} />
                        <Skeleton width={180} height={32} borderRadius={4} style={{ marginBottom: 24 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <Skeleton width={60} height={12} borderRadius={4} />
                                <Skeleton width={90} height={20} borderRadius={4} style={{ marginTop: 6 }} />
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Skeleton width={60} height={12} borderRadius={4} />
                                <Skeleton width={90} height={20} borderRadius={4} style={{ marginTop: 6 }} />
                            </View>
                        </View>
                    </View>
                    <Skeleton width={150} height={24} borderRadius={4} style={{ marginBottom: 20 }} />
                    {[1, 2, 3, 4, 5].map(i => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20 }}>
                            <Skeleton width={44} height={44} borderRadius={12} style={{ marginRight: 16 }} />
                            <View style={{ flex: 1 }}>
                                <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                                <Skeleton width="40%" height={12} borderRadius={4} />
                            </View>
                            <Skeleton width={60} height={20} borderRadius={4} />
                        </View>
                    ))}
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper
            showHeader
            statusBarColor="#FFFFFF"
            statusBarStyle="dark-content"
            headerProps={{
                title: "Fees",
                showBack: true,
                theme: 'light'
            }}
        >
            <Animated.ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.container}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* 💳 FIGMA MOCKUP IN-BODY GRADIENT FEES CARD */}
                <View style={styles.figmaFeesCard}>
                    <LinearGradient
                        colors={[dynamicPrimary, dynamicSecondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.figmaFeesGradient}
                    >
                        <View style={styles.figmaFeesRow}>
                            <View>
                                <Text style={styles.figmaFeesLabel}>Total Fees</Text>
                                <Text style={styles.figmaFeesAmount}>₹{totalFees.toLocaleString()}</Text>
                            </View>
                            <CreditCard size={28} color="#FFFFFF" opacity={0.6} />
                        </View>
                        <View style={styles.figmaFeesSplit}>
                            <View style={styles.figmaFeesStat}>
                                <Text style={styles.figmaFeesStatLabel}>PAID FEES</Text>
                                <Text style={styles.figmaFeesStatVal}>₹{totalPaid.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.figmaFeesStat, { alignItems: 'flex-end' }]}>
                                <Text style={styles.figmaFeesStatLabel}>DUE FEES</Text>
                                <Text style={[styles.figmaFeesStatVal, { color: '#FFD2D2' }]}>₹{totalDue.toLocaleString()}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* PENDING DUES SELECTION */}
                {pendingDues.length > 0 && (
                    <View style={{ paddingHorizontal: 24, marginTop: 10, marginBottom: 10 }}>
                        <Text style={styles.sectionTitle}>Pending Dues</Text>
                        {pendingDues.map((due) => {
                            const isSelected = selectedDueIds.includes(due.id);
                            const remaining = parseFloat(due.totalAmount || 0) - parseFloat(due.paidAmount || 0);
                            const breakdown = typeof due.breakdown === 'string' ? JSON.parse(due.breakdown) : (due.breakdown || {});
                            const lateFee = breakdown['Late Fee'] || breakdown['lateFee'] || 0;

                            return (
                                <TouchableOpacity 
                                    key={due.id}
                                    activeOpacity={0.7}
                                    onPress={() => toggleDueSelection(due.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: isSelected ? dynamicPrimary + '10' : '#F8FAFC',
                                        borderWidth: 2,
                                        borderColor: isSelected ? dynamicPrimary : '#E2E8F0',
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 10
                                    }}
                                >
                                    <View style={{
                                        width: 24, height: 24, borderRadius: 8,
                                        borderWidth: 2, borderColor: isSelected ? dynamicPrimary : '#CBD5E1',
                                        backgroundColor: isSelected ? dynamicPrimary : 'transparent',
                                        justifyContent: 'center', alignItems: 'center',
                                        marginRight: 16
                                    }}>
                                        {isSelected && <CheckCircle2 size={16} color="#FFFFFF" />}
                                    </View>
                                    
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Bold, fontSize: 14, color: '#1E293B' }}>{due.month} Fee</Text>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 10, color: '#64748B' }}>
                                            {due.status === 'PARTIAL' ? 'Partially Paid • ' : ''}Original: ₹{parseFloat(due.totalAmount).toLocaleString()}
                                        </Text>
                                        {parseFloat(lateFee) > 0 && (
                                            <Text style={{ fontFamily: fontFamily.Poppins.Bold, fontSize: 10, color: '#EF4444', marginTop: 2 }}>
                                                + Late Fine Included (₹{parseFloat(lateFee).toLocaleString()})
                                            </Text>
                                        )}
                                    </View>
                                    
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 16, color: dynamicPrimary }}>
                                            ₹{remaining.toLocaleString()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {enableOnlinePayments && pendingDues.length > 0 && (
                    <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
                        <TouchableOpacity 
                            onPress={handlePayOnline}
                            disabled={processingPayment}
                            style={{ 
                                backgroundColor: dynamicPrimary, 
                                height: 55, 
                                borderRadius: 16, 
                                flexDirection: 'row', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                shadowColor: dynamicPrimary,
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 8
                            }}
                        >
                            {processingPayment ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <CreditCard size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#FFFFFF', fontFamily: fontFamily.Poppins.Black, fontSize: 14 }}>
                                        {selectedAmount > 0 ? `PROCEED TO PAY (₹${selectedAmount.toLocaleString()})` : 'PROCEED TO PAY'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.mainContent}>
                    {/* 🚌 TRANSPORT SECTION */}
                    {student?.usesTransport && (
                        <View style={styles.transportCard}>
                            <View style={[styles.iconBox, { backgroundColor: dynamicPrimary + '15' }]}>
                                <Bus size={20} color={dynamicPrimary} />
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{STRINGS.transport}: {student.transportRoute || STRINGS.assignedRoute}</Text>
                                <Text style={styles.itemDate}>{STRINGS.subscribed} • ₹{student.transportFee}/month</Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Payment History</Text>

                    {history.map(item => {
                        return (
                            <TouchableOpacity 
                                key={item.id} 
                                style={styles.paymentItem}
                                onPress={() => handleViewReceipt(item)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.iconBox}>
                                    <CheckCircle2 size={20} color="#22C55E" />
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.month}</Text>
                                    <Text style={styles.itemDate}>
                                        Payment Confirmed • {new Date(item.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.itemAmount}>₹{parseFloat(item.amountPaid).toLocaleString()}</Text>
                                    <TouchableOpacity 
                                        style={styles.receiptBtn}
                                        onPress={() => handleViewReceipt(item)}
                                        activeOpacity={0.7}
                                    >
                                        <FileText size={10} color={dynamicPrimary} style={{ marginRight: 3 }} />
                                        <Text style={[styles.receiptBtnText, { color: dynamicPrimary }]}>Receipt</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {history.length === 0 && (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Info size={40} color="#cbd5e1" />
                            <Text style={{ marginTop: 12, color: '#94a3b8', fontSize: 12, fontFamily: fontFamily.Poppins.Medium, textAlign: 'center' }}>No fee payment history available yet.</Text>
                        </View>
                    )}
                </View>

                {/* 🧾 RECEIPT MODAL */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, maxHeight: '90%' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                                <View>
                                    <Text style={{ fontSize: 20, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>Payment Receipt</Text>
                                    <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray, textTransform: 'uppercase', tracking: 1 }}>Official Institutional Record</Text>
                                </View>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                                    <X size={20} color={dynamicPrimary} />
                                </TouchableOpacity>
                            </View>

                            {selectedPayment && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, marginBottom: 24 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                            <View>
                                                <Text style={{ fontSize: 8, fontFamily: fontFamily.Poppins.Black, color: '#94A3B8', textTransform: 'uppercase' }}>Scholar</Text>
                                                <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{student?.name}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={{ fontSize: 8, fontFamily: fontFamily.Poppins.Black, color: '#94A3B8', textTransform: 'uppercase' }}>Admission No</Text>
                                                <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{student?.admissionNo}</Text>
                                            </View>
                                        </View>

                                        <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 }} />

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray }}>Receipt ID</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>#REC-{selectedPayment.id}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray }}>Fiscal Month</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{selectedPayment.month}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray }}>Payment Mode</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{selectedPayment.mode || 'CASH'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: COLORS.gray }}>Transaction Date</Text>
                                            <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>{new Date(selectedPayment.paymentDate).toLocaleDateString()}</Text>
                                        </View>
                                    </View>

                                    <View style={{ backgroundColor: dynamicPrimary, borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View>
                                            <Text style={{ fontSize: 9, fontFamily: fontFamily.Poppins.Bold, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Amount Paid</Text>
                                            <Text style={{ fontSize: 24, fontFamily: fontFamily.Poppins.Black, color: COLORS.white }}>₹{parseFloat(selectedPayment.amountPaid).toLocaleString()}</Text>
                                        </View>
                                        <View style={{ backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                                            <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Black, color: COLORS.white }}>CONFIRMED</Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 30, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Bold, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 2 }}>{schoolName || 'SDM'} Institutional Hub</Text>
                                    </View>
                                    
                                    <TouchableOpacity style={{ marginTop: 30, backgroundColor: '#F1F5F9', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                                        <Download size={20} color={dynamicPrimary} style={{ marginRight: 10 }} />
                                        <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Black, color: dynamicPrimary }}>Download PDF</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
                <View style={{ height: 100 }} /></Animated.ScrollView>
        </Wrapper>
    );
};

export default StudentFees;
