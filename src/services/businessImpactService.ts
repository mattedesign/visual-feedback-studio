
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessImpactData {
  siteName: string;
  impactScore: number;
  revenueEstimate: {
    annual: number;
    confidence: number;
  };
  implementationTimeline: {
    total: number;
    quickWins: number;
    majorProjects: number;
  };
  competitivePosition: {
    score: number;
  };
  prioritizedRecommendations: {
    quickWins: Array<{
      title: string;
      impact: string;
      timeline: string;
    }>;
    majorProjects: Array<{
      title: string;
      roi: string;
      timeline: string;
    }>;
  };
  knowledgeSourcesUsed: number;
  analysisId: string;
}

export const businessImpactService = {
  generateExecutiveReport: async (data: BusinessImpactData): Promise<void> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header with Figmant branding
    pdf.setFillColor(59, 130, 246); // Blue color
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('Figmant UX Analysis', 20, 20);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text('Executive Report', 20, 50);
    
    // Site name and date
    pdf.setFontSize(12);
    pdf.text(`Analysis for: ${data.siteName}`, 20, 70);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Executive Summary
    pdf.setFontSize(14);
    pdf.text('Executive Summary', 20, 100);
    
    pdf.setFontSize(10);
    const summaryText = `This comprehensive UX analysis reveals significant opportunities for business growth. 
Our research-backed evaluation of your digital experience identifies ${data.revenueEstimate.annual / 1000}K in annual revenue potential 
through strategic user experience improvements. The analysis incorporates insights from ${data.knowledgeSourcesUsed} authoritative 
UX research sources to provide actionable recommendations with measurable business impact.`;
    
    const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 40);
    pdf.text(splitSummary, 20, 110);
    
    // Key Metrics
    pdf.setFontSize(14);
    pdf.text('Key Business Metrics', 20, 140);
    
    pdf.setFontSize(12);
    pdf.text(`Business Impact Score: ${data.impactScore}/100`, 20, 155);
    pdf.text(`Revenue Potential: +$${(data.revenueEstimate.annual / 1000).toFixed(0)}K annually`, 20, 165);
    pdf.text(`Implementation Timeline: ${data.implementationTimeline.total} weeks`, 20, 175);
    pdf.text(`Competitive Position: ${data.competitivePosition.score}/10`, 20, 185);
    
    // Quick Wins
    pdf.setFontSize(14);
    pdf.text('Quick Wins (High Impact, Low Effort)', 20, 205);
    
    pdf.setFontSize(10);
    data.prioritizedRecommendations.quickWins.forEach((win, index) => {
      const yPos = 220 + (index * 15);
      pdf.text(`${index + 1}. ${win.title}`, 25, yPos);
      pdf.text(`   Impact: ${win.impact} | Timeline: ${win.timeline}`, 30, yPos + 8);
    });
    
    // Add new page for detailed recommendations
    pdf.addPage();
    
    // Major Projects
    pdf.setFontSize(14);
    pdf.text('Major Projects (Strategic Investments)', 20, 30);
    
    pdf.setFontSize(10);
    data.prioritizedRecommendations.majorProjects.forEach((project, index) => {
      const yPos = 45 + (index * 20);
      pdf.text(`${index + 1}. ${project.title}`, 25, yPos);
      pdf.text(`   ROI: ${project.roi} | Timeline: ${project.timeline}`, 30, yPos + 8);
    });
    
    // Research Methodology
    pdf.setFontSize(14);
    pdf.text('Research Methodology', 20, 120);
    
    pdf.setFontSize(10);
    const methodologyText = `This analysis leverages ${data.knowledgeSourcesUsed} research sources including Nielsen Norman Group, 
Baymard Institute, and other authoritative UX research organizations. Our AI-powered analysis cross-references your design 
patterns against established best practices to provide confidence-scored recommendations with measurable business impact.`;
    
    const splitMethodology = pdf.splitTextToSize(methodologyText, pageWidth - 40);
    pdf.text(splitMethodology, 20, 135);
    
    // Footer
    pdf.setFontSize(8);
    pdf.text('© 2024 Figmant - Professional UX Analysis Platform', 20, pageHeight - 10);
    
    // Download the PDF
    pdf.save(`Figmant_Executive_Report_${data.analysisId}.pdf`);
  },

  generateImplementationChecklist: async (quickWins: BusinessImpactData['prioritizedRecommendations']['quickWins']): Promise<void> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFillColor(34, 197, 94); // Green color
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text('Quick Wins Implementation Checklist', 20, 20);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Implementation items
    pdf.setFontSize(14);
    pdf.text('Action Items:', 20, 70);
    
    quickWins.forEach((win, index) => {
      const yPos = 90 + (index * 40);
      
      // Checkbox
      pdf.rect(20, yPos - 5, 5, 5);
      
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${win.title}`, 30, yPos);
      
      pdf.setFontSize(10);
      pdf.text(`Timeline: ${win.timeline}`, 35, yPos + 10);
      pdf.text(`Impact Level: ${win.impact}`, 35, yPos + 20);
      pdf.text('Status: [ ] Not Started [ ] In Progress [ ] Complete', 35, yPos + 30);
    });
    
    pdf.save('Figmant_Quick_Wins_Checklist.pdf');
  },

  generateProjectPlan: async (majorProjects: BusinessImpactData['prioritizedRecommendations']['majorProjects']): Promise<void> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFillColor(147, 51, 234); // Purple color
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text('Quarterly Project Planning Guide', 20, 20);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Project planning
    pdf.setFontSize(14);
    pdf.text('Strategic Projects for Next Quarter:', 20, 70);
    
    majorProjects.forEach((project, index) => {
      const yPos = 90 + (index * 50);
      
      pdf.setFontSize(12);
      pdf.text(`Project ${index + 1}: ${project.title}`, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.text(`Expected ROI: ${project.roi}`, 25, yPos + 15);
      pdf.text(`Timeline: ${project.timeline}`, 25, yPos + 25);
      pdf.text('Resource Requirements: Design team, Development team, Stakeholder approval', 25, yPos + 35);
      pdf.text('Success Metrics: User engagement, Conversion rate, Task completion time', 25, yPos + 45);
    });
    
    pdf.save('Figmant_Project_Plan.pdf');
  },

  generateShareableLink: (analysisId: string): string => {
    const shareId = uuidv4();
    const shareableUrl = `${window.location.origin}/share/${shareId}`;
    
    // Store the mapping (in a real app, this would go to a database)
    localStorage.setItem(`share_${shareId}`, analysisId);
    
    return shareableUrl;
  },

  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      return false;
    }
  }
};
