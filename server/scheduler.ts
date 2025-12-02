import { storage } from './storage';
import { broadcastNotification } from './websocket';
import { log } from './index';

const SCHEDULER_INTERVAL = 60000;

export function startReminderScheduler() {
  log('Starting reminder scheduler (checks every 60s)', 'scheduler');
  
  setInterval(async () => {
    try {
      await processScheduledNotifications();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, SCHEDULER_INTERVAL);
  
  setTimeout(() => processScheduledNotifications(), 5000);
}

async function processScheduledNotifications() {
  try {
    const pendingNotifications = await storage.getPendingScheduledNotifications();
    
    if (pendingNotifications.length === 0) {
      return;
    }
    
    log(`Processing ${pendingNotifications.length} scheduled notifications`, 'scheduler');
    
    for (const notification of pendingNotifications) {
      try {
        await storage.markNotificationSent(notification.id);
        broadcastNotification(notification.passCode, notification);
        log(`Sent scheduled notification ${notification.id} to ${notification.passCode}`, 'scheduler');
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
}

export async function scheduleInterviewReminder(
  passCode: string,
  interviewTitle: string,
  interviewDate: Date,
  reminderMinutesBefore: number = 30
) {
  const reminderTime = new Date(interviewDate.getTime() - reminderMinutesBefore * 60 * 1000);
  
  if (reminderTime <= new Date()) {
    log(`Interview reminder for ${passCode} is in the past, skipping`, 'scheduler');
    return null;
  }
  
  const notification = await storage.createNotification({
    passCode,
    type: 'interview_reminder',
    title: `Reminder: ${interviewTitle}`,
    message: `Your interview "${interviewTitle}" starts in ${reminderMinutesBefore} minutes. Please be prepared.`,
    priority: 'high',
    read: false,
    scheduledFor: reminderTime,
  });
  
  log(`Scheduled interview reminder for ${passCode} at ${reminderTime.toISOString()}`, 'scheduler');
  return notification;
}

export async function scheduleMilestoneReminders(candidateCode: string, timeline: { title: string; date: string; status: string }[]) {
  const reminders = [];
  
  for (const milestone of timeline) {
    if (milestone.status !== 'upcoming' || !milestone.date) continue;
    
    const milestoneDate = new Date(milestone.date);
    if (isNaN(milestoneDate.getTime())) continue;
    
    const reminderDate = new Date(milestoneDate.getTime() - 30 * 60 * 1000);
    
    if (reminderDate > new Date()) {
      const notification = await storage.createNotification({
        passCode: candidateCode,
        type: 'milestone_reminder',
        title: `Upcoming: ${milestone.title}`,
        message: `Your ${milestone.title} is scheduled soon. Please prepare accordingly.`,
        priority: 'high',
        read: false,
        scheduledFor: reminderDate,
      });
      reminders.push(notification);
    }
  }
  
  log(`Scheduled ${reminders.length} milestone reminders for ${candidateCode}`, 'scheduler');
  return reminders;
}
