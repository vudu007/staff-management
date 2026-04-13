import prisma from '../../config/database';

export class ExamVerificationService {
  
  async getStaffVerifications(staffId: string) {
    return prisma.examVerification.findMany({
      where: { staffId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifyExam(data: { staffId: string; examBody: string; examType: string; examYear: string; examNumber: string; pin?: string }) {
    // Check if staff exists
    const staff = await prisma.staff.findUnique({ where: { id: data.staffId } });
    if (!staff) throw new Error('Staff member not found');

    // Simulate verification delay (calling external provider like IdentityPass)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // For a mock, we generate plausible results. 
    // In a real application, this is where you would process the axios response from IdentityPass.
    const mockResults = [
      { subject: 'English Language', grade: 'C4' },
      { subject: 'Mathematics', grade: 'B3' },
      { subject: 'Biology', grade: 'B2' },
      { subject: 'Chemistry', grade: 'C5' },
      { subject: 'Physics', grade: 'C6' },
      { subject: 'Economics', grade: 'A1' },
      { subject: 'Civic Education', grade: 'B3' },
      { subject: 'Agricultural Science', grade: 'B2' },
      { subject: 'Geography', grade: 'C4' }
    ];

    // Optionally randomize some grades for realism during tests
    const grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
    const results = mockResults.map(r => ({
      ...r,
      grade: grades[Math.floor(Math.random() * 6)] // Randomize among passes (excluding D-F for the demo)
    }));

    // Create the structured record
    return prisma.examVerification.create({
      data: {
        staffId: data.staffId,
        examBody: data.examBody,
        examType: data.examType,
        examYear: data.examYear,
        examNumber: data.examNumber,
        pin: data.pin || null,
        isVerified: true,
        verificationDate: new Date(),
        results: results
      }
    });
  }

}
