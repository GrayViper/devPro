import { describe, it, expect } from 'vitest';
import { buildStatusChangeNotification } from './ApplicationsContext';

describe('buildStatusChangeNotification', () => {
  it('creates a student-facing notification for recruiter status changes', () => {
    const application = {
      id: 'app_1',
      studentId: 'usr_student',
      studentName: 'Olivia Chen',
      jobTitle: 'Frontend Intern',
      company: 'Stripe',
      status: 'Applied'
    };

    const notification = buildStatusChangeNotification(application, 'Interview', 'Technical review scheduled.');

    expect(notification.recipientId).toBe('usr_student');
    expect(notification.type).toBe('application_status_update');
    expect(notification.message).toContain('interview');
    expect(notification.subject).toContain('Frontend Intern');
  });
});
