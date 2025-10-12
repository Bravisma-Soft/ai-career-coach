import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - comment out if you want to preserve existing data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.document.deleteMany();
  await prisma.statusChange.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.mockInterview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aicareercoach.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created ${3} users`);

  // Create user profiles
  console.log('📝 Creating user profiles...');
  const profile1 = await prisma.userProfile.create({
    data: {
      userId: user1.id,
      phone: '+1-555-0101',
      bio: 'Experienced software engineer passionate about building scalable web applications.',
      location: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      githubUrl: 'https://github.com/johndoe',
      portfolioUrl: 'https://johndoe.dev',
      currentJobTitle: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      yearsOfExperience: 5,
      desiredJobTitle: 'Lead Software Engineer',
      desiredSalaryMin: 150000,
      desiredSalaryMax: 200000,
      desiredWorkMode: 'HYBRID',
      desiredJobTypes: ['FULL_TIME'],
      willingToRelocate: true,
      preferredLocations: ['San Francisco, CA', 'Seattle, WA', 'New York, NY'],
      timezone: 'America/Los_Angeles',
    },
  });

  const profile2 = await prisma.userProfile.create({
    data: {
      userId: user2.id,
      phone: '+1-555-0102',
      bio: 'Product manager with a focus on user experience and data-driven decision making.',
      location: 'Austin, TX',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      zipCode: '78701',
      linkedinUrl: 'https://linkedin.com/in/janesmith',
      currentJobTitle: 'Product Manager',
      currentCompany: 'StartupXYZ',
      yearsOfExperience: 3,
      desiredJobTitle: 'Senior Product Manager',
      desiredSalaryMin: 120000,
      desiredSalaryMax: 160000,
      desiredWorkMode: 'REMOTE',
      desiredJobTypes: ['FULL_TIME'],
      willingToRelocate: false,
      preferredLocations: ['Remote'],
      timezone: 'America/Chicago',
    },
  });

  console.log(`✅ Created ${2} user profiles`);

  // Create experiences
  console.log('💼 Creating work experiences...');
  await prisma.experience.createMany({
    data: [
      {
        userProfileId: profile1.id,
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        description: 'Led development of microservices architecture serving 10M+ users',
        location: 'San Francisco, CA',
        workMode: 'HYBRID',
        startDate: new Date('2021-01-01'),
        isCurrent: true,
        achievements: [
          'Reduced API response time by 40%',
          'Mentored 3 junior developers',
          'Implemented CI/CD pipeline',
        ],
        technologies: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'AWS'],
      },
      {
        userProfileId: profile1.id,
        company: 'WebDev Solutions',
        position: 'Software Engineer',
        description: 'Developed full-stack web applications for enterprise clients',
        location: 'San Francisco, CA',
        workMode: 'ONSITE',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2020-12-31'),
        isCurrent: false,
        achievements: [
          'Built 5+ client applications from scratch',
          'Improved code coverage to 85%',
        ],
        technologies: ['JavaScript', 'Vue.js', 'Python', 'MongoDB'],
      },
      {
        userProfileId: profile2.id,
        company: 'StartupXYZ',
        position: 'Product Manager',
        description: 'Managing product roadmap and cross-functional teams',
        location: 'Austin, TX',
        workMode: 'REMOTE',
        startDate: new Date('2022-03-01'),
        isCurrent: true,
        achievements: [
          'Launched 3 major features increasing user engagement by 25%',
          'Coordinated team of 8 engineers and designers',
          'Defined OKRs and KPIs for product success',
        ],
        technologies: ['Jira', 'Figma', 'SQL', 'Analytics'],
      },
    ],
  });

  console.log('✅ Created work experiences');

  // Create education
  console.log('🎓 Creating education records...');
  await prisma.education.createMany({
    data: [
      {
        userProfileId: profile1.id,
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        location: 'Stanford, CA',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-06-01'),
        isCurrent: false,
        gpa: 3.8,
        achievements: ['Dean\'s List', 'Graduated with Honors'],
        coursework: ['Data Structures', 'Algorithms', 'Machine Learning', 'Web Development'],
      },
      {
        userProfileId: profile2.id,
        institution: 'University of Texas at Austin',
        degree: 'Master of Business Administration',
        fieldOfStudy: 'Business Administration',
        location: 'Austin, TX',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2020-05-01'),
        isCurrent: false,
        gpa: 3.9,
        achievements: ['Graduated Summa Cum Laude'],
        coursework: ['Product Management', 'Marketing Strategy', 'Data Analytics'],
      },
    ],
  });

  console.log('✅ Created education records');

  // Create skills
  console.log('🛠️  Creating skills...');
  await prisma.skill.createMany({
    data: [
      { userProfileId: profile1.id, name: 'JavaScript', category: 'Programming', level: 'EXPERT', yearsOfExperience: 5 },
      { userProfileId: profile1.id, name: 'TypeScript', category: 'Programming', level: 'EXPERT', yearsOfExperience: 4 },
      { userProfileId: profile1.id, name: 'React', category: 'Frontend', level: 'ADVANCED', yearsOfExperience: 4 },
      { userProfileId: profile1.id, name: 'Node.js', category: 'Backend', level: 'EXPERT', yearsOfExperience: 5 },
      { userProfileId: profile1.id, name: 'PostgreSQL', category: 'Database', level: 'ADVANCED', yearsOfExperience: 3 },
      { userProfileId: profile1.id, name: 'AWS', category: 'Cloud', level: 'INTERMEDIATE', yearsOfExperience: 2 },
      { userProfileId: profile2.id, name: 'Product Strategy', category: 'Management', level: 'ADVANCED', yearsOfExperience: 3 },
      { userProfileId: profile2.id, name: 'Agile/Scrum', category: 'Management', level: 'EXPERT', yearsOfExperience: 4 },
      { userProfileId: profile2.id, name: 'Data Analysis', category: 'Analytics', level: 'INTERMEDIATE', yearsOfExperience: 2 },
      { userProfileId: profile2.id, name: 'User Research', category: 'Product', level: 'ADVANCED', yearsOfExperience: 3 },
    ],
  });

  console.log('✅ Created skills');

  // Create certifications
  console.log('📜 Creating certifications...');
  await prisma.certification.createMany({
    data: [
      {
        userProfileId: profile1.id,
        name: 'AWS Certified Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        issueDate: new Date('2022-03-15'),
        expiryDate: new Date('2025-03-15'),
        credentialId: 'AWS-SA-12345',
        credentialUrl: 'https://aws.amazon.com/verification',
        doesNotExpire: false,
      },
      {
        userProfileId: profile2.id,
        name: 'Certified Scrum Product Owner',
        issuingOrganization: 'Scrum Alliance',
        issueDate: new Date('2021-06-01'),
        expiryDate: new Date('2024-06-01'),
        credentialId: 'CSPO-67890',
        doesNotExpire: false,
      },
    ],
  });

  console.log('✅ Created certifications');

  // Create resumes
  console.log('📄 Creating resumes...');
  const resume1 = await prisma.resume.create({
    data: {
      userId: user1.id,
      title: 'John Doe - Senior Software Engineer Resume',
      fileName: 'john_doe_resume_2024.pdf',
      fileUrl: 'https://storage.example.com/resumes/john_doe_resume_2024.pdf',
      fileSize: 245678,
      mimeType: 'application/pdf',
      isPrimary: true,
      isActive: true,
      rawText: 'John Doe\nSenior Software Engineer\nExperience with Node.js, React, TypeScript...',
      parsedData: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        experience: ['Tech Corp', 'WebDev Solutions'],
      },
    },
  });

  const resume2 = await prisma.resume.create({
    data: {
      userId: user2.id,
      title: 'Jane Smith - Product Manager Resume',
      fileName: 'jane_smith_resume_2024.pdf',
      fileUrl: 'https://storage.example.com/resumes/jane_smith_resume_2024.pdf',
      fileSize: 198765,
      mimeType: 'application/pdf',
      isPrimary: true,
      isActive: true,
      rawText: 'Jane Smith\nProduct Manager\nExperience with product strategy, user research...',
      parsedData: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        skills: ['Product Strategy', 'Agile', 'Data Analysis'],
        experience: ['StartupXYZ'],
      },
    },
  });

  console.log('✅ Created resumes');

  // Create jobs
  console.log('💼 Creating job listings...');
  const job1 = await prisma.job.create({
    data: {
      userId: user1.id,
      title: 'Lead Software Engineer',
      company: 'TechGiant Inc',
      companyUrl: 'https://techgiant.com',
      location: 'San Francisco, CA',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      salaryMin: 160000,
      salaryMax: 220000,
      salaryCurrency: 'USD',
      jobUrl: 'https://techgiant.com/careers/lead-engineer',
      jobDescription: 'We are looking for an experienced Lead Software Engineer to join our platform team...',
      requirements: [
        '7+ years of software engineering experience',
        'Strong TypeScript and Node.js skills',
        'Experience with microservices architecture',
        'Leadership and mentoring experience',
      ],
      responsibilities: [
        'Lead technical design and implementation',
        'Mentor junior engineers',
        'Collaborate with product and design teams',
      ],
      benefits: ['Health Insurance', '401k Matching', 'Unlimited PTO', 'Remote Work Options'],
      status: 'INTERESTED',
      source: 'LinkedIn',
      postedDate: new Date('2024-01-15'),
      applicationDeadline: new Date('2024-02-15'),
      matchScore: 85.5,
      aiAnalysis: {
        strengths: ['Strong technical match', 'Salary aligns with expectations'],
        concerns: ['May require more leadership experience'],
        recommendation: 'Highly recommended to apply',
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      userId: user1.id,
      title: 'Senior Full Stack Engineer',
      company: 'InnovateSoft',
      location: 'Remote',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      salaryMin: 140000,
      salaryMax: 180000,
      jobUrl: 'https://innovatesoft.com/jobs/senior-fullstack',
      status: 'APPLIED',
      source: 'Company Website',
      postedDate: new Date('2024-01-10'),
      appliedAt: new Date('2024-01-12'),
      matchScore: 78.0,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      userId: user2.id,
      title: 'Senior Product Manager',
      company: 'FastGrowth Startup',
      location: 'Austin, TX',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      salaryMin: 130000,
      salaryMax: 170000,
      jobDescription: 'Looking for a strategic product manager to drive our growth initiatives...',
      status: 'INTERESTED',
      source: 'Indeed',
      postedDate: new Date('2024-01-20'),
      matchScore: 82.0,
    },
  });

  console.log('✅ Created job listings');

  // Create applications
  console.log('📝 Creating applications...');
  const application1 = await prisma.application.create({
    data: {
      userId: user1.id,
      jobId: job2.id,
      resumeId: resume1.id,
      applicationMethod: 'MANUAL',
      status: 'SUBMITTED',
      coverLetter: 'Dear Hiring Manager,\n\nI am excited to apply for the Senior Full Stack Engineer position...',
      submittedAt: new Date('2024-01-12'),
      aiGeneratedCoverLetter: true,
      aiOptimizationApplied: true,
    },
  });

  console.log('✅ Created applications');

  // Create interviews
  console.log('📅 Creating interviews...');
  const interview1 = await prisma.interview.create({
    data: {
      userId: user1.id,
      jobId: job2.id,
      interviewType: 'PHONE',
      scheduledAt: new Date('2024-01-25T14:00:00Z'),
      duration: 30,
      location: 'Phone Call',
      interviewerName: 'Sarah Johnson',
      interviewerEmail: 'sarah@innovatesoft.com',
      outcome: 'PENDING',
      prepNotes: 'Research company background, prepare STAR method answers, review recent projects',
    },
  });

  console.log('✅ Created interviews');

  // Create mock interviews
  console.log('🎯 Creating mock interviews...');
  const mockInterview1 = await prisma.mockInterview.create({
    data: {
      userId: user1.id,
      title: 'Technical Interview Practice - FAANG Style',
      interviewType: 'TECHNICAL',
      targetRole: 'Senior Software Engineer',
      targetCompany: 'TechGiant Inc',
      difficulty: 'Hard',
      duration: 45,
      overallScore: 82.5,
      technicalScore: 85.0,
      communicationScore: 80.0,
      problemSolvingScore: 82.0,
      aiAnalysis: {
        summary: 'Strong technical skills with good problem-solving approach',
        detailedFeedback: 'Candidate demonstrated solid understanding of algorithms and data structures',
      },
      aiSuggestions: [
        'Practice explaining thought process more clearly',
        'Work on time complexity analysis',
        'Review dynamic programming concepts',
      ],
      strengths: ['Clear code structure', 'Good debugging skills', 'Efficient solutions'],
      areasToImprove: ['Communication of approach', 'Edge case handling'],
      conversationHistory: {
        messages: [
          { role: 'assistant', content: 'Let\'s start with a coding question. Can you implement a function to reverse a linked list?' },
          { role: 'user', content: 'Sure, I\'ll use an iterative approach...' },
        ],
      },
      isCompleted: true,
      completedAt: new Date('2024-01-18'),
    },
  });

  console.log('✅ Created mock interviews');

  // Create career goals
  console.log('🎯 Creating career goals...');
  await prisma.careerGoal.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Become a Tech Lead',
        description: 'Transition into a technical leadership role within the next year',
        targetDate: new Date('2025-01-01'),
        status: 'IN_PROGRESS',
        priority: 1,
        progress: 40,
        aiRecommendations: [
          'Take on more mentoring responsibilities',
          'Lead a cross-team project',
          'Complete leadership training course',
        ],
      },
      {
        userId: user1.id,
        title: 'Learn System Design',
        description: 'Master system design patterns for large-scale applications',
        targetDate: new Date('2024-06-01'),
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 60,
        aiRecommendations: [
          'Complete system design course',
          'Practice with mock system design interviews',
          'Read case studies from tech companies',
        ],
      },
      {
        userId: user2.id,
        title: 'Launch Successful Product',
        description: 'Lead a product from ideation to market launch',
        status: 'IN_PROGRESS',
        priority: 1,
        progress: 70,
      },
    ],
  });

  console.log('✅ Created career goals');

  // Create conversations
  console.log('💬 Creating conversations...');
  const conversation1 = await prisma.conversation.create({
    data: {
      userId: user1.id,
      title: 'Career Path Discussion',
      context: 'career_advice',
      messages: {
        create: [
          {
            role: 'user',
            content: 'I want to transition from senior engineer to tech lead. What steps should I take?',
          },
          {
            role: 'assistant',
            content: 'Great goal! Here are some key steps to transition into a tech lead role:\n\n1. Develop Leadership Skills...',
            metadata: {
              model: 'claude-3-5-sonnet-20241022',
              tokens: 256,
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created conversations');

  console.log('');
  console.log('✨ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: 3 (2 regular + 1 admin)`);
  console.log(`   - User Profiles: 2`);
  console.log(`   - Experiences: 3`);
  console.log(`   - Education: 2`);
  console.log(`   - Skills: 10`);
  console.log(`   - Certifications: 2`);
  console.log(`   - Resumes: 2`);
  console.log(`   - Jobs: 3`);
  console.log(`   - Applications: 1`);
  console.log(`   - Interviews: 1`);
  console.log(`   - Mock Interviews: 1`);
  console.log(`   - Career Goals: 3`);
  console.log(`   - Conversations: 1`);
  console.log('');
  console.log('🔑 Test Credentials:');
  console.log('   Email: john.doe@example.com');
  console.log('   Email: jane.smith@example.com');
  console.log('   Email: admin@aicareercoach.com');
  console.log('   Password: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
