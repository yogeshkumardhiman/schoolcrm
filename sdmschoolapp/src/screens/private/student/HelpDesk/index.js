import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator, Linking, Alert } from 'react-native';
import { Plus, MessageCircle, Send, X, FileText, HelpCircle, Phone, ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, STRINGS, fontFamily, formatDate } from '../../../../utils';
import { styles } from './styles';
import { Wrapper } from '../../../../components/Wrapper';
import Skeleton from '../../../../components/common/Skeleton';
import { StatusModal } from '../../../../components/common/StatusModal';
import { getStudentQueriesList, submitStudentGrievance } from '../../../../slices/student';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const HELP_CATEGORIES = [
    "💰 Fee Related",
    "📅 Attendance",
    "📚 Academic / Studies",
    "🚌 Transport",
    "⚙️ Technical Support",
    "📝 Other"
];

const FAQS = [
    { q: "How to pay school fees online?", a: "Go to the 'Fee Status' tab from the Home Screen, check your outstanding balance, and click the blue 'Pay Now' button to complete the transaction online." },
    { q: "How do I check my exam results?", a: "Go to 'Results' from the Home Screen. You can find Unit Tests, Half Yearly, and Final Marks registered there once verified by the teacher." },
    { q: "Where can I find the transport route details?", a: "Go to the 'Help Desk' and send a technical/transport query. Our transport coordinator will respond to your query with details." },
    { q: "How to contact my class teacher?", a: "You can send a direct query from the 'New Query' menu in this Help Desk, selecting 'Academic / Studies' category." }
];

const HelpDesk = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('home'); // 'home', 'queries', 'faqs', 'contact'
    const [isModalVisible, setModalVisible] = useState(false);
    const [isPickerVisible, setPickerVisible] = useState(false);
    
    // Collapsible FAQ states
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const [formData, setFormData] = useState({
        subject: HELP_CATEGORIES[0],
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        const fetchQueries = () => {
            dispatch(getStudentQueriesList(user?.id || user?._id, (data) => {
                setLoading(false);
                if (data) {
                    setQueries(data);
                } else {
                    setStatusModal({ 
                        visible: true, 
                        type: 'error', 
                        title: 'FETCH FAILURE', 
                        message: "Failed to load queries from server." 
                    });
                }
            }));
        };
        fetchQueries();
    }, [dispatch, user?.id, user?._id]);

    const handleSubmit = async () => {
        if (!formData.message.trim()) return;
        
        setSubmitting(true);
        await sleep(1000);
        
        const payload = {
            studentId: user?.id || user?._id,
            studentName: user?.name,
            class: user?.class,
            section: user?.section || 'A',
            subject: formData.subject,
            message: formData.message
        };

        dispatch(submitStudentGrievance(payload, (data) => {
            setSubmitting(false);
            if (data) {
                setQueries([data, ...queries]);
                setModalVisible(false);
                setFormData({ subject: HELP_CATEGORIES[0], message: '' });
                setStatusModal({ 
                    visible: true, 
                    type: 'success', 
                    title: 'MESSAGE TRANSMITTED', 
                    message: "Your query has been sent. We will respond shortly." 
                });
                setCurrentView('queries'); // Automatically show My Queries after submission
            } else {
                setStatusModal({ 
                    visible: true, 
                    type: 'error', 
                    title: 'TRANSMISSION FAILED', 
                    message: "Failed to deliver message to the teacher hub." 
                });
            }
        }));
    };

    const handleCallSchool = () => {
        Linking.openURL('tel:+919876543210').catch(() => {
            Alert.alert('Protocol Error', 'Call functionality is not supported on this device.');
        });
    };

    const renderFigmaMenuItem = (title, desc, icon, color, bg, onPress) => (
        <TouchableOpacity style={styles.figmaMenuItem} onPress={onPress} activeOpacity={0.85}>
            <View style={[styles.figmaMenuIconBox, { backgroundColor: bg }]}>
                {React.createElement(icon, { size: 20, color, strokeWidth: 2.2 })}
            </View>
            <View style={styles.figmaMenuInfo}>
                <Text style={styles.figmaMenuTitle}>{title}</Text>
                <Text style={styles.figmaMenuDesc}>{desc}</Text>
            </View>
            <View style={styles.figmaArrowBox}>
                <ChevronRight size={16} color="#6B7280" strokeWidth={2.5} />
            </View>
        </TouchableOpacity>
    );

    return (
        <Wrapper showHeader headerProps={{ title: "Institutional Help Desk", showBack: true, theme: 'light' }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* DYNAMIC HOME VIEW */}
                {currentView === 'home' && (
                    <View>
                        {/* Figma Headphone Circle Center */}
                        <View style={styles.figmaCenterBox}>
                            <View style={styles.figmaHeadphoneCircle}>
                                <HelpCircle size={44} color="#6C63FF" strokeWidth={1.8} />
                            </View>
                            <Text style={styles.figmaCenterTitle}>How can we help you?</Text>
                            <Text style={styles.figmaCenterDesc}>Send your query or grievance to school hub</Text>
                        </View>

                        {/* Figma Action List */}
                        <View style={styles.figmaMenuContainer}>
                            {renderFigmaMenuItem('New Query', 'Send a new query or grievance', FileText, '#8B5CF6', 'rgba(139, 92, 246, 0.08)', () => setModalVisible(true))}
                            {renderFigmaMenuItem('My Queries', 'View status of submitted queries', MessageCircle, '#EC4899', 'rgba(236, 72, 153, 0.08)', () => setCurrentView('queries'))}
                            {renderFigmaMenuItem('FAQs', 'Frequently Asked Questions', HelpCircle, '#3B82F6', 'rgba(59, 130, 246, 0.08)', () => setCurrentView('faqs'))}
                            {renderFigmaMenuItem('Contact School', 'Call or email the administrative office', Phone, '#10B981', 'rgba(16, 185, 129, 0.08)', () => setCurrentView('contact'))}
                        </View>
                    </View>
                )}

                {/* DYNAMIC VIEW 1: MY SUBMITTED QUERIES */}
                {currentView === 'queries' && (
                    <View>
                        <TouchableOpacity style={styles.backToDeskLink} onPress={() => setCurrentView('home')}>
                            <ArrowLeft size={14} color="#6C63FF" strokeWidth={2.5} />
                            <Text style={styles.backToDeskText}>Back to Help Desk</Text>
                        </TouchableOpacity>

                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{STRINGS.myQueries}</Text>
                        </View>

                        {loading ? (
                            [1, 2, 3].map(i => (
                                <View key={i} style={styles.queryCard}>
                                    <Skeleton width={100} height={20} borderRadius={4} style={{ marginBottom: 10 }} />
                                    <Skeleton width="100%" height={40} borderRadius={8} />
                                </View>
                            ))
                        ) : queries.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: 60 }}>
                                <MessageCircle size={56} color="#CBD5E1" />
                                <Text style={{ marginTop: 16, color: '#94A3B8', fontFamily: fontFamily.Poppins.Bold }}>No queries submitted yet.</Text>
                            </View>
                        ) : (
                            queries.map((item) => (
                                <View key={item.id || item._id} style={styles.queryCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.subjectBadge}>
                                            <Text style={styles.subjectText}>{(item.subject || 'GENERAL').toUpperCase()}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'RESOLVED' ? '#22C55E' : '#F59E0B' }]}>
                                            <Text style={styles.statusText}>{item.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.message}>{item.message}</Text>
                                    
                                    {item.teacherReply && (
                                        <View style={styles.replySection}>
                                            <Text style={styles.replyLabel}>{STRINGS.teacherResponse}</Text>
                                            <Text style={styles.replyText}>{item.teacherReply}</Text>
                                        </View>
                                    )}
                                    
                                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* DYNAMIC VIEW 2: FAQS COLLAPSIBLE ACCORDION */}
                {currentView === 'faqs' && (
                    <View>
                        <TouchableOpacity style={styles.backToDeskLink} onPress={() => setCurrentView('home')}>
                            <ArrowLeft size={14} color="#6C63FF" strokeWidth={2.5} />
                            <Text style={styles.backToDeskText}>Back to Help Desk</Text>
                        </TouchableOpacity>

                        <View style={styles.headerRow}>
                            <Text style={styles.title}>Frequently Asked Questions</Text>
                        </View>

                        {FAQS.map((faq, idx) => {
                            const isExpanded = expandedFAQ === idx;
                            return (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={styles.queryCard}
                                    onPress={() => setExpandedFAQ(isExpanded ? null : idx)}
                                    activeOpacity={0.9}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', flex: 1, paddingRight: 10 }}>
                                            {faq.q}
                                        </Text>
                                        <ChevronRight size={16} color="#6B7280" transform={isExpanded ? [{ rotate: '90deg' }] : []} />
                                    </View>
                                    {isExpanded && (
                                        <Text style={{ fontSize: 12, fontFamily: fontFamily.Poppins.Medium, color: '#6B7280', marginTop: 10, lineHeight: 18 }}>
                                            {faq.a}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* DYNAMIC VIEW 3: CONTACT SCHOOL HUB */}
                {currentView === 'contact' && (
                    <View>
                        <TouchableOpacity style={styles.backToDeskLink} onPress={() => setCurrentView('home')}>
                            <ArrowLeft size={14} color="#6C63FF" strokeWidth={2.5} />
                            <Text style={styles.backToDeskText}>Back to Help Desk</Text>
                        </TouchableOpacity>

                        <View style={styles.headerRow}>
                            <Text style={styles.title}>Contact Administrative Office</Text>
                        </View>

                        <View style={styles.queryCard}>
                            <Text style={{ fontSize: 14, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', marginBottom: 12 }}>School Directory Contact</Text>
                            
                            <TouchableOpacity 
                                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}
                                onPress={handleCallSchool}
                            >
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(34, 197, 94, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                    <Phone size={16} color="#22C55E" />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Medium, color: '#6B7280' }}>Phone Support</Text>
                                    <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', marginTop: 2 }}>+91 98765 43210</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}
                                onPress={() => Linking.openURL('mailto:info@sdmpublicschool.com')}
                            >
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(108, 99, 255, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                    <FileText size={16} color="#6C63FF" />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 10, fontFamily: fontFamily.Poppins.Medium, color: '#6B7280' }}>Official Email</Text>
                                    <Text style={{ fontSize: 13, fontFamily: fontFamily.Poppins.Bold, color: '#1F2937', marginTop: 2 }}>info@sdmpublicschool.com</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* NEW QUERY MODAL */}
            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.modalTitle}>{STRINGS.newAssistance}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F7FB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}>
                                <X size={18} color="#1F2937" strokeWidth={2.2} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{STRINGS.selectCategory}</Text>
                        <TouchableOpacity style={styles.picker} onPress={() => setPickerVisible(true)}>
                            <Text style={styles.pickerText}>{formData.subject}</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>{STRINGS.yourMessage}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={STRINGS.msgPlaceholder}
                            multiline
                            value={formData.message}
                            onChangeText={(txt) => setFormData({ ...formData, message: txt })}
                        />

                        <TouchableOpacity 
                            style={[styles.submitBtn, (!formData.message.trim() || submitting) && { opacity: 0.5 }]} 
                            onPress={handleSubmit}
                            disabled={submitting || !formData.message.trim()}
                        >
                            {submitting ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 12 }} />
                                    <Text style={styles.submitBtnText}>{STRINGS.saving}</Text>
                                </View>
                            ) : (
                                <Text style={styles.submitBtnText}>{STRINGS.sendToTeacher}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* CATEGORY PICKER */}
                <Modal visible={isPickerVisible} transparent animationType="fade">
                    <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 40 }]}>
                        <View style={[styles.modalContent, { borderRadius: 24, padding: 0 }]}>
                            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                <Text style={{ fontFamily: fontFamily.Poppins.Bold, color: '#1F2937' }}>{STRINGS.chooseCategory}</Text>
                            </View>
                            <FlatList
                                data={HELP_CATEGORIES}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.categoryItem} 
                                        onPress={() => {
                                            setFormData({ ...formData, subject: item });
                                            setPickerVisible(false);
                                        }}
                                    >
                                        <Text style={styles.categoryText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={item => item}
                            />
                        </View>
                    </View>
                </Modal>
            </Modal>

            <StatusModal
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => setStatusModal({ ...statusModal, visible: false })}
            />
        </Wrapper>
    );
};

export default HelpDesk;
