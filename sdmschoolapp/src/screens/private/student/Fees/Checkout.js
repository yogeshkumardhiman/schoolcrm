import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, CreditCard, ShieldCheck, Lock, Smartphone, User, FileText, CheckCircle, Bell } from 'lucide-react-native';
import { COLORS, fontFamily } from '../../../../utils';
import { Wrapper } from '../../../../components/Wrapper';
import { useSelector, useDispatch } from 'react-redux';
import { APIService } from '../../../../services/APIServices';
import RazorpayCheckout from 'react-native-razorpay';
import { getDashboardData } from '../../../../slices/student';

const PaymentCheckout = ({ navigation, route }) => {
    const { amountToPay, idsToPay, pendingDues } = route.params;
    const { user } = useSelector(state => state.auth);
    const { primaryColor, schoolName, razorpayKeyId } = useSelector(state => state.config);
    const dispatch = useDispatch();
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('razorpay');

    const dynamicPrimary = primaryColor || COLORS.primary;
    const api = new APIService();

    const handleConfirmPayment = async () => {
        try {
            setProcessing(true);
            const res = await api.createPaymentOrder({ amount: amountToPay, feeDueIds: idsToPay });
            
            if (res && res.data && res.data.order_id) {
                const options = {
                    description: `${schoolName} - Fee Payment`,
                    image: 'https://cdn-icons-png.flaticon.com/512/1080/1080985.png',
                    currency: res.data.currency,
                    key: razorpayKeyId,
                    amount: res.data.amount,
                    name: schoolName,
                    order_id: res.data.order_id,
                    theme: { color: dynamicPrimary },
                    prefill: {
                        email: user?.email || '',
                        contact: user?.phone || '',
                        name: user?.name || ''
                    }
                };

                RazorpayCheckout.open(options).then(async (data) => {
                    try {
                        const verifyRes = await api.verifyPayment({
                            razorpay_order_id: res.data.order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature
                        });
                        if (verifyRes?.data?.success) {
                            Alert.alert('Success', 'Payment completed successfully!', [
                                { 
                                    text: 'OK', 
                                    onPress: () => {
                                        dispatch(getDashboardData(user?.admissionNo, () => {
                                            navigation.goBack();
                                        }));
                                    }
                                }
                            ]);
                        } else {
                            Alert.alert('Verification Failed', 'Payment processed but verification failed.');
                            setProcessing(false);
                        }
                    } catch (verifyErr) {
                        Alert.alert('Error', 'Payment verification failed. Please contact school administration.');
                        setProcessing(false);
                    }
                }).catch((error) => {
                    console.log('Payment checkout cancelled', error);
                    setProcessing(false);
                });
            } else {
                Alert.alert('Error', 'Failed to initialize payment.');
                setProcessing(false);
            }
        } catch (error) {
            console.error('Payment Error', error);
            Alert.alert('Payment Failed', 'Please check your internet connection and try again.');
            setProcessing(false);
        }
    };

    return (
        <Wrapper
            showHeader
            statusBarColor="#F8FAFC"
            statusBarStyle="dark-content"
            headerProps={{
                title: "Fee Payment",
                showBack: true,
                theme: 'light'
            }}
        >
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                <View style={{ padding: 24 }}>
                    {/* School Branding */}
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 18, color: dynamicPrimary, textAlign: 'center' }}>{schoolName}</Text>
                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: '#64748B', textAlign: 'center' }}>Secure Fee Payment Portal</Text>
                    </View>

                    {/* Student Info */}
                    <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 14, color: '#1E293B', marginBottom: 12 }}>Student Information</Text>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: dynamicPrimary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                            <User size={24} color={dynamicPrimary} />
                        </View>
                        <View>
                            <Text style={{ fontFamily: fontFamily.Poppins.Bold, fontSize: 14, color: '#1E293B' }}>{user?.name}</Text>
                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: '#475569' }}>Class: {user?.class} {user?.section ? `(${user.section})` : ''}</Text>
                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: '#475569' }}>Admission No: {user?.admissionNo}</Text>
                        </View>
                    </View>

                    {/* Order Summary Detailed */}
                    <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 14, color: '#1E293B', marginBottom: 12 }}>Fee Details</Text>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        {pendingDues.filter(d => idsToPay.includes(d.id)).map((due, index) => {
                            const breakdown = typeof due.breakdown === 'string' ? JSON.parse(due.breakdown) : (due.breakdown || {});
                            const lateFee = parseFloat(breakdown['Late Fee'] || breakdown['lateFee'] || 0);
                            const discount = parseFloat(breakdown['Discount'] || breakdown['discount'] || 0);
                            const original = parseFloat(due.totalAmount) - parseFloat(due.paidAmount) - lateFee + discount;
                            
                            // Try to format due date if available, otherwise fallback
                            const dueDateStr = due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : `10 ${due.month.substring(0, 3)} 2026`;
                            const isOverdue = lateFee > 0;

                            return (
                                <View key={due.id} style={{ marginBottom: index === idsToPay.length - 1 ? 0 : 20 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Bold, fontSize: 13, color: '#334155' }}>{due.month} Tuition Fee</Text>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 13, color: '#334155' }}>₹{original.toLocaleString()}</Text>
                                    </View>
                                    
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: '#64748B' }}>Late Fee</Text>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: lateFee > 0 ? '#EF4444' : '#64748B' }}>₹{lateFee.toLocaleString()}</Text>
                                    </View>

                                    {discount > 0 && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: '#10B981' }}>Discount</Text>
                                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 12, color: '#10B981' }}>-₹{discount.toLocaleString()}</Text>
                                        </View>
                                    )}

                                    <View style={{ backgroundColor: isOverdue ? '#FEF2F2' : '#F8FAFC', padding: 8, borderRadius: 8, marginTop: 4 }}>
                                        <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 10, color: isOverdue ? '#EF4444' : '#64748B' }}>
                                            Due Date: {dueDateStr} {isOverdue && '(Overdue)'}
                                        </Text>
                                    </View>
                                </View>
                            )
                        })}
                        <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E2E8F0' }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 16, color: '#1E293B' }}>Payable Amount</Text>
                            <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 22, color: dynamicPrimary }}>₹{amountToPay.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <Text style={{ fontFamily: fontFamily.Poppins.Black, fontSize: 14, color: '#1E293B', marginBottom: 12 }}>Select Payment Method</Text>
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={() => setSelectedMethod('razorpay')}
                        style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: selectedMethod === 'razorpay' ? dynamicPrimary : '#E2E8F0', marginBottom: 24, shadowColor: selectedMethod === 'razorpay' ? dynamicPrimary : '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: selectedMethod === 'razorpay' ? 0.1 : 0, shadowRadius: 12, elevation: selectedMethod === 'razorpay' ? 4 : 0 }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Smartphone size={22} color={dynamicPrimary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: fontFamily.Poppins.Bold, fontSize: 14, color: '#1E293B' }}>Online Payment</Text>
                                    <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 10, color: '#64748B', marginTop: 2 }}>GPay, PhonePe, Paytm, Cards & Netbanking</Text>
                                </View>
                            </View>
                            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: selectedMethod === 'razorpay' ? dynamicPrimary : '#CBD5E1', backgroundColor: selectedMethod === 'razorpay' ? dynamicPrimary : 'transparent', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}>
                                {selectedMethod === 'razorpay' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' }} />}
                            </View>
                        </View>
                        
                        {/* Interactive Bank/App Logos Placeholder */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 }}>
                            <View style={{ paddingHorizontal: 12, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: '#334155' }}>GPay</Text>
                            </View>
                            <View style={{ paddingHorizontal: 12, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: '#334155' }}>PhonePe</Text>
                            </View>
                            <View style={{ paddingHorizontal: 12, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: '#334155' }}>Paytm</Text>
                            </View>
                            <View style={{ flex: 1, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                <CreditCard size={12} color="#334155" style={{marginRight: 4}} />
                                <Text style={{ fontSize: 11, fontFamily: fontFamily.Poppins.Bold, color: '#334155' }}>Cards</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Post-Payment Benefits */}
                    <View style={{ backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 10 }}>
                        <Text style={{ fontFamily: fontFamily.Poppins.Bold, fontSize: 12, color: '#475569', marginBottom: 10 }}>After successful payment:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <FileText size={14} color="#059669" style={{ marginRight: 8 }} />
                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 11, color: '#475569' }}>Instant Fee Receipt Generated</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Bell size={14} color="#059669" style={{ marginRight: 8 }} />
                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 11, color: '#475569' }}>SMS & App Notification Sent</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ShieldCheck size={14} color="#059669" style={{ marginRight: 8 }} />
                            <Text style={{ fontFamily: fontFamily.Poppins.Medium, fontSize: 11, color: '#475569' }}>Secure & Encrypted Transaction</Text>
                        </View>
                    </View>

                </View>
            </ScrollView>
            
            {/* Sticky Bottom Pay Button */}
            <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: 30 }}>
                <TouchableOpacity 
                    onPress={handleConfirmPayment}
                    disabled={processing}
                    style={{ 
                        backgroundColor: dynamicPrimary, 
                        height: 55, 
                        borderRadius: 16, 
                        flexDirection: 'row', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        shadowColor: dynamicPrimary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                    }}
                >
                    {processing ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={{ color: '#FFFFFF', fontFamily: fontFamily.Poppins.Black, fontSize: 16, letterSpacing: 1 }}>
                            PAY ₹{amountToPay.toLocaleString()}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </Wrapper>
    );
};

export default PaymentCheckout;
