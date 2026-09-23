import { sendFeeReminders } from './feeReminder.service.js';

export const initFeeReminderScheduler = () => {
    console.log("⏰ [Fee Reminder Scheduler] Initialized.");
    // Simulate background reminders check 60 seconds after server startup
    setTimeout(async () => {
        try {
            console.log("⏰ [Scheduler] Running automated check for fee defaulters...");
            await sendFeeReminders();
        } catch (e) {
            console.error("[Scheduler Trigger Failed]", e.message);
        }
    }, 60000);
};
