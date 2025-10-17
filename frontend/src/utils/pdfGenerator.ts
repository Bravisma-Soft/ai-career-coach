import jsPDF from 'jspdf';

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    gpa?: string;
  }>;
}

/**
 * Generate a professional PDF from resume data
 */
export function generateResumePDF(resumeData: ResumeData, fileName: string): void {
  console.log('🎨 generateResumePDF called with:', { fileName, hasData: !!resumeData });
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with wrapping and proper line height
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    const lineHeight = fontSize * 0.4; // Better line spacing

    lines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, margin + indent, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper function to add section header with line
  const addSectionHeader = (title: string) => {
    checkPageBreak(20);
    yPosition += 4; // Space before section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    yPosition += 6;
    // Add underline
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8; // Space after line
  };

  // Helper function to format date range
  const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined, current: boolean): string | null => {
    const start = startDate && startDate.trim() !== '' && startDate !== 'null' ? startDate : null;
    const end = current ? 'Present' : (endDate && endDate.trim() !== '' && endDate !== 'null' ? endDate : null);

    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return null;
  };

  // Personal Info - Header Section
  const { personalInfo } = resumeData;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(personalInfo.fullName.toUpperCase(), margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.website
  ].filter(item => item && item.trim() !== '' && item !== 'null').join(' • ');
  if (contactInfo) {
    addText(contactInfo, 9);
  }
  yPosition += 8; // Extra space after header

  // Professional Summary
  addSectionHeader('PROFESSIONAL SUMMARY');
  addText(resumeData.summary, 10, false);
  yPosition += 6;

  // Skills
  addSectionHeader('SKILLS');
  // Wrap skills nicely
  const skillsText = resumeData.skills.join(' • ');
  addText(skillsText, 10, false);
  yPosition += 6;

  // Experience
  addSectionHeader('PROFESSIONAL EXPERIENCE');
  resumeData.experience.forEach((exp, index) => {
    checkPageBreak(30);

    // Job title and company
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${exp.position}`, margin, yPosition);
    yPosition += 5;

    // Company and dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}`, margin, yPosition);
    doc.setFont('helvetica', 'normal');

    // Format and display date range only if valid dates exist
    const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current);
    if (dateRange) {
      const dateWidth = doc.getTextWidth(dateRange);
      doc.text(dateRange, pageWidth - margin - dateWidth, yPosition);
    }
    yPosition += 5;

    // Location
    const expLocation = exp.location && exp.location.trim() !== '' && exp.location !== 'null' ? exp.location : null;
    if (expLocation) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(expLocation, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 5;
    }

    // Achievements/Description
    doc.setFontSize(10);
    exp.description.forEach((desc) => {
      checkPageBreak();
      const bulletLines = doc.splitTextToSize(desc, maxWidth - 8);
      bulletLines.forEach((line: string, lineIndex: number) => {
        if (lineIndex === 0) {
          doc.text('•', margin + 2, yPosition);
          doc.text(line, margin + 8, yPosition);
        } else {
          doc.text(line, margin + 8, yPosition);
        }
        yPosition += 4;
      });
    });

    if (index < resumeData.experience.length - 1) {
      yPosition += 6; // Space between jobs
    }
  });

  yPosition += 6;

  // Education
  addSectionHeader('EDUCATION');
  resumeData.education.forEach((edu, index) => {
    checkPageBreak(20);

    // Degree
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, margin, yPosition);
    yPosition += 5;

    // Institution and dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(edu.institution, margin, yPosition);
    doc.setFont('helvetica', 'normal');

    // Format and display date range only if valid dates exist
    const eduDateRange = formatDateRange(edu.startDate, edu.endDate, edu.current);
    if (eduDateRange) {
      const eduDateWidth = doc.getTextWidth(eduDateRange);
      doc.text(eduDateRange, pageWidth - margin - eduDateWidth, yPosition);
    }
    yPosition += 5;

    // Location and GPA
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const locationText = edu.location && edu.location.trim() !== '' && edu.location !== 'null' ? edu.location : null;
    const gpaText = edu.gpa && edu.gpa.trim() !== '' && edu.gpa !== 'null' ? `GPA: ${edu.gpa}` : null;
    const eduDetails = [locationText, gpaText].filter(Boolean).join(' • ');
    if (eduDetails) {
      doc.text(eduDetails, margin, yPosition);
      yPosition += 4;
    }
    doc.setTextColor(0, 0, 0);

    if (index < resumeData.education.length - 1) {
      yPosition += 5; // Space between education entries
    }
  });

  // Save PDF
  console.log('✅ PDF generated successfully, saving as:', fileName);
  doc.save(fileName);
  console.log('💾 PDF download triggered');
}
