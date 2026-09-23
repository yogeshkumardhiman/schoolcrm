import { Notice, SchoolInfo } from '../../models/index.js';
import fs from 'fs';
import path from 'path';

let firebaseAdmin = null;

// 🔒 DYNAMIC FIREBASE INITIALIZATION (FCM Whitelabeling Ready)
const initFirebase = () => {
    try {
        const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-key.json';
        const absolutePath = path.resolve(keyPath);

        if (fs.existsSync(absolutePath)) {
            console.log(`🔑 [Firebase Engine] Service account found at ${keyPath}. Initializing Live Admin SDK...`);
            
            // Dynamic import to prevent startup crash if firebase-admin package is not installed yet
            import('firebase-admin').then((admin) => {
                firebaseAdmin = admin.default || admin;
                if (!firebaseAdmin.apps.length) {
                    firebaseAdmin.initializeApp({
                        credential: firebaseAdmin.credential.cert(absolutePath)
                    });
                    console.log('✅ [Firebase Engine] Firebase Cloud Messaging Live SDK successfully connected.');
                }
            }).catch(err => {
                console.log('⚠️ [Firebase Engine] "firebase-admin" package is not installed. Falling back to Simulation Mode.');
            });
        } else {
            console.log('ℹ️ [Firebase Engine] No key file detected. Operating in Simulation (Console Logging) Mode.');
        }
    } catch (err) {
        console.error('❌ [Firebase Engine Init Failed]:', err.message);
    }
};

// Initialize on startup
initFirebase();

/**
 * Centralized Unified Notification Engine
 * Handles Notice Board creation, Live/Mock FCM Push Notifications, and Live/Mock SMS dispatches.
 */
export const sendNotification = async ({
    title,
    content,
    type = 'GENERAL',        // 'FEE_DUE', 'HOMEWORK', 'LEAVE_STATUS', 'GENERAL'
    targetClass = null,      // specific class (null for school-wide)
    targetSection = null,    // specific section (null for school-wide)
    studentId = null,        // specific student
    staffId = null,          // specific staff
    studentName = 'Scholar',
    phone = null,            // recipient phone number
    deviceToken = null,      // FCM device token
    customColor = null
}) => {
    try {
        console.log(`\n🔔 [Notification Engine] INITIALIZING DISPATCH FOR: ${title}`);
        
        let notificationColor = customColor;
        if (!notificationColor) {
            const schoolInfo = await SchoolInfo.findOne();
            switch (type) {
                case 'FEE_DUE':
                    notificationColor = '#EF4444'; // Urgent Red
                    break;
                case 'HOMEWORK':
                    notificationColor = '#10B981'; // Green
                    break;
                case 'LEAVE_STATUS':
                    notificationColor = '#F59E0B'; // Amber Orange
                    break;
                default:
                    notificationColor = schoolInfo?.primaryColor || '#2563EB'; // Dynamic Institutional Color
            }
        }

        // 1. 💾 PERSIST TO APP NOTICE BOARD
        const notice = await Notice.create({
            title,
            content,
            tag: type.replace('_', ' '),
            color: notificationColor,
            date: new Date().toLocaleDateString('en-GB'),
            class: targetClass || null,
            section: targetSection || null,
            studentId: studentId || null,
            session: '2026-27'
        });
        console.log(`   ✅ App Notice Board entry logged successfully (Notice ID: #${notice.id})`);

        // 2. 📱 GOOGLE FIREBASE PUSH NOTIFICATION (FCM)
        let actualToken = deviceToken;
        if (!actualToken) {
            if (studentId) {
                const { Student } = await import('../../models/index.js');
                const student = await Student.findByPk(studentId);
                if (student && student.deviceToken) {
                    actualToken = student.deviceToken;
                }
            } else if (staffId) {
                const { Staff } = await import('../../models/index.js');
                const staff = await Staff.findByPk(staffId);
                if (staff && staff.deviceToken) {
                    actualToken = staff.deviceToken;
                }
            }
        }

        const mockFCMToken = actualToken || `token_mock_${studentId || staffId || 'global'}_fcm`;
        
        if (firebaseAdmin && actualToken && !actualToken.startsWith('token_mock_')) {
            console.log(`   🌐 [FCM] Dispatched LIVE Push Notification to token...`);
            await firebaseAdmin.messaging().send({
                token: actualToken,
                notification: {
                    title: title,
                    body: content
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'sdm_school_channel',
                        sound: 'default',
                        color: notificationColor
                    }
                },
                data: {
                    type,
                    noticeId: String(notice.id)
                }
            });
            console.log(`      ✅ Push dispatch confirmed by Google Cloud.`);
        } else {
            console.log(`   🌐 [FCM PUSH SIMULATION] (Simulation Mode)`);
            console.log(`      To Token : ${mockFCMToken}`);
            console.log(`      Payload  : { title: "${title}", body: "${content.substring(0, 80)}..." }`);
        }

        // 3. 💬 LIVE / MOCK SMS REMINDER
        if (phone) {
            const smsApiKey = process.env.SMS_GATEWAY_API_KEY;
            const smsGatewayUrl = process.env.SMS_GATEWAY_URL;

            if (smsApiKey && smsGatewayUrl) {
                console.log(`   💬 [SMS] Dispatching LIVE SMS to ${phone} via Gateway...`);
                
                // Example call to Fast2SMS Bulk SMS Gateway
                const response = await fetch(smsGatewayUrl, {
                    method: 'POST',
                    headers: {
                        'authorization': smsApiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        route: 'q',
                        message: `Dear Parent, ${content}`,
                        language: 'english',
                        numbers: phone
                    })
                });

                if (response.ok) {
                    console.log(`      ✅ Live SMS dispatch confirmed by gateway.`);
                } else {
                    const errTxt = await response.text();
                    console.warn(`      ❌ Live SMS dispatch failed: ${errTxt}`);
                }
            } else {
                console.log(`   💬 [SMS SIMULATION] (Simulation Mode)`);
                console.log(`      To Phone : ${phone}`);
                console.log(`      Message  : "Dear Parent, ${content}"`);
            }
        } else {
            console.log(`   ⚠️ [SMS WARNING] No phone number available. Skipping SMS.`);
        }

        console.log(`🎉 [Notification Engine] DISPATCH COMPLETED FOR STUDENT: ${studentName}\n`);

        return {
            success: true,
            noticeId: notice.id
        };
    } catch (error) {
        console.error(`❌ [Notification Engine Error] Dispatch failed:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Dispatches FCM Push Notifications to multiple devices (Broadcast)
 */
export const broadcastFCM = async ({ tokens, title, body, noticeId, type = 'GENERAL' }) => {
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return { success: false, message: 'No tokens provided' };
    
    const validTokens = [...new Set(tokens.filter(t => t && typeof t === 'string' && t.trim().length > 0 && !t.startsWith('token_mock_')))];
    if (validTokens.length === 0) return { success: false, message: 'No valid tokens found' };

    try {
        if (firebaseAdmin) {
            const schoolInfo = await SchoolInfo.findOne();
            const primaryColor = schoolInfo?.primaryColor || '#2563EB';

            console.log(`\n🌐 [FCM BROADCAST] Dispatching Push Notification to ${validTokens.length} devices...`);
            const response = await firebaseAdmin.messaging().sendEachForMulticast({
                tokens: validTokens,
                notification: {
                    title: title,
                    body: body
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'sdm_school_channel',
                        sound: 'default',
                        color: primaryColor
                    }
                },
                data: {
                    type,
                    noticeId: String(noticeId)
                }
            });
            console.log(`   ✅ [FCM BROADCAST] Completed. Success: ${response.successCount}, Failed: ${response.failureCount}\n`);
            return { success: true, response };
        } else {
            console.log(`\n🌐 [FCM BROADCAST SIMULATION] (Simulation Mode)`);
            console.log(`   Target : ${validTokens.length} devices`);
            console.log(`   Payload: { title: "${title}", body: "${body.substring(0, 50)}..." }\n`);
            return { success: true, simulated: true };
        }
    } catch (err) {
        console.error(`❌ [FCM BROADCAST ERROR]:`, err.message);
        return { success: false, error: err.message };
    }
};
