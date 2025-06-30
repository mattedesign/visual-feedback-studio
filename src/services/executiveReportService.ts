
import jsPDF from 'jspdf';
import { BusinessImpactData } from './businessImpactService';

export interface ExecutiveReportData extends BusinessImpactData {
  analysisDate: string;
  totalAnnotations: number;
  criticalIssues: number;
  researchSources: number;
}

export class ExecutiveReportService {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  async generateExecutiveReport(data: ExecutiveReportData): Promise<void> {
    // Reset PDF for new generation
    this.pdf = new jsPDF();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();

    // Page 1: Executive Summary
    this.createHeader();
    this.createExecutiveSummary(data);
    this.createKeyMetrics(data);
    this.createBusinessImpactOverview(data);

    // Page 2: Detailed Recommendations
    this.pdf.addPage();
    this.createHeader();
    this.createQuickWinsSection(data);
    this.createMajorProjectsSection(data);
    this.createImplementationRoadmap(data);
    this.createResearchMethodology(data);

    // Footer on all pages
    this.addFooter();

    // Generate filename and download
    const filename = `Figmant_Executive_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    this.pdf.save(filename);
  }

  private createHeader(): void {
    // Figmant Header with branding
    this.pdf.setFillColor(59, 130, 246); // Blue brand color
    this.pdf.rect(0, 0, this.pageWidth, 35, 'F');

    // Figmant Logo/Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FIGMANT', this.margin, 22);

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Professional UX Analysis Platform', this.margin, 30);

    // Reset text color for body content
    this.pdf.setTextColor(0, 0, 0);
  }

  private createExecutiveSummary(data: ExecutiveReportData): void {
    let yPos = 50;

    // Title
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Executive Report', this.margin, yPos);

    yPos += 15;

    // Site name and date
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Analysis for: ${data.siteName}`, this.margin, yPos);
    
    yPos += 10;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated: ${data.analysisDate}`, this.margin, yPos);

    yPos += 20;

    // Executive Summary Section
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Executive Summary', this.margin, yPos);

    yPos += 15;

    // Summary content
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    
    const summaryText = `This comprehensive UX analysis reveals significant opportunities for business growth through strategic user experience improvements. Our research-backed evaluation identifies $${(data.revenueEstimate.annual / 1000).toFixed(0)}K in annual revenue potential with ${data.revenueEstimate.confidence}% confidence.

The analysis incorporates insights from ${data.knowledgeSourcesUsed} authoritative UX research sources, ensuring recommendations are grounded in proven methodologies and industry best practices. 

Key findings indicate a Business Impact Score of ${data.impactScore}/100, with ${data.prioritizedRecommendations.quickWins.length} quick-win opportunities that can be implemented within ${data.implementationTimeline.quickWins} weeks, alongside ${data.prioritizedRecommendations.majorProjects.length} strategic projects requiring ${data.implementationTimeline.majorProjects} weeks for full implementation.`;

    const splitSummary = this.pdf.splitTextToSize(summaryText, this.pageWidth - (this.margin * 2));
    this.pdf.text(splitSummary, this.margin, yPos);
  }

  private createKeyMetrics(data: ExecutiveReportData): void {
    let yPos = 160;

    // Key Metrics Section
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Key Business Metrics', this.margin, yPos);

    yPos += 15;

    // Metrics grid
    const metrics = [
      { label: 'Business Impact Score', value: `${data.impactScore}/100`, color: data.impactScore >= 70 ? [34, 197, 94] : data.impactScore >= 40 ? [234, 179, 8] : [239, 68, 68] },
      { label: 'Revenue Potential', value: `+$${(data.revenueEstimate.annual / 1000).toFixed(0)}K annually`, color: [34, 197, 94] },
      { label: 'Implementation Timeline', value: `${data.implementationTimeline.total} weeks total`, color: [59, 130, 246] },
      { label: 'Competitive Position', value: `${data.competitivePosition.score}/10`, color: [147, 51, 234] }
    ];

    metrics.forEach((metric, index) => {
      const xPos = this.margin + (index % 2) * 85;
      const currentYPos = yPos + Math.floor(index / 2) * 25;

      // Metric box
      this.pdf.setFillColor(245, 245, 245);
      this.pdf.rect(xPos, currentYPos - 5, 80, 20, 'F');

      // Metric value
      this.pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(metric.value, xPos + 5, currentYPos + 3);

      // Metric label
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(metric.label, xPos + 5, currentYPos + 12);
    });

    // Reset text color
    this.pdf.setTextColor(0, 0, 0);
  }

  private createBusinessImpactOverview(data: ExecutiveReportData): void {
    let yPos = 220;

    // Business Impact Overview
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Business Impact Overview', this.margin, yPos);

    yPos += 15;

    // ROI Calculation
    this.pdf.setFillColor(240, 253, 244);
    this.pdf.rect(this.margin, yPos - 5, this.pageWidth - (this.margin * 2), 25, 'F');

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(22, 101, 52);
    this.pdf.text('💰 ROI Projection', this.margin + 5, yPos + 5);

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    const roiText = `Investment of $15,000-25,000 in UX improvements could return ${data.revenueEstimate.annual.toLocaleString()} within 6-12 months, representing a ${Math.round(data.revenueEstimate.annual / 20000 * 100)}% ROI based on industry benchmarks.`;
    const splitROI = this.pdf.splitTextToSize(roiText, this.pageWidth - (this.margin * 2) - 10);
    this.pdf.text(splitROI, this.margin + 5, yPos + 15);
  }

  private createQuickWinsSection(data: ExecutiveReportData): void {
    let yPos = 50;

    // Quick Wins Section
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Quick Wins (1-2 weeks implementation)', this.margin, yPos);

    yPos += 15;

    if (data.prioritizedRecommendations.quickWins.length > 0) {
      data.prioritizedRecommendations.quickWins.forEach((win, index) => {
        // Quick win item
        this.pdf.setFillColor(240, 253, 244);
        this.pdf.rect(this.margin, yPos - 3, this.pageWidth - (this.margin * 2), 20, 'F');

        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(22, 101, 52);
        this.pdf.text(`${index + 1}. ${win.title}`, this.margin + 5, yPos + 5);

        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0);
        this.pdf.text(`Impact: ${win.impact} | Timeline: ${win.timeline}`, this.margin + 5, yPos + 15);

        yPos += 25;
      });
    } else {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.text('No quick wins identified - focus on strategic improvements', this.margin, yPos);
      yPos += 15;
    }
  }

  private createMajorProjectsSection(data: ExecutiveReportData): void {
    let yPos = this.pdf.internal.pageSize.getHeight() / 2;

    // Major Projects Section
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Strategic Projects (4-8 weeks implementation)', this.margin, yPos);

    yPos += 15;

    if (data.prioritizedRecommendations.majorProjects.length > 0) {
      data.prioritizedRecommendations.majorProjects.forEach((project, index) => {
        // Major project item
        this.pdf.setFillColor(239, 246, 255);
        this.pdf.rect(this.margin, yPos - 3, this.pageWidth - (this.margin * 2), 20, 'F');

        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(29, 78, 216);
        this.pdf.text(`${index + 1}. ${project.title}`, this.margin + 5, yPos + 5);

        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0);
        this.pdf.text(`ROI: ${project.roi} | Timeline: ${project.timeline}`, this.margin + 5, yPos + 15);

        yPos += 25;
      });
    } else {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.text('Strategic projects will be identified in phase 2 analysis', this.margin, yPos);
      yPos += 15;
    }
  }

  private createImplementationRoadmap(data: ExecutiveReportData): void {
    let yPos = this.pdf.internal.pageSize.getHeight() - 100;

    // Implementation Roadmap
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Implementation Roadmap', this.margin, yPos);

    yPos += 12;

    const phases = [
      { phase: 'Phase 1 (Weeks 1-2)', description: `${data.prioritizedRecommendations.quickWins.length} quick wins - immediate impact`, color: [34, 197, 94] },
      { phase: 'Phase 2 (Weeks 3-6)', description: `${data.prioritizedRecommendations.majorProjects.length} strategic projects - long-term value`, color: [59, 130, 246] },
      { phase: 'Phase 3 (Weeks 7-8)', description: 'Testing, optimization, and performance measurement', color: [147, 51, 234] }
    ];

    phases.forEach((phase, index) => {
      this.pdf.setTextColor(phase.color[0], phase.color[1], phase.color[2]);
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(phase.phase, this.margin, yPos);

      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(phase.description, this.margin + 40, yPos);

      yPos += 12;
    });
  }

  private createResearchMethodology(data: ExecutiveReportData): void {
    let yPos = this.pdf.internal.pageSize.getHeight() - 50;

    // Research Methodology
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.rect(this.margin, yPos - 10, this.pageWidth - (this.margin * 2), 35, 'F');

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Research Methodology', this.margin + 5, yPos);

    yPos += 10;

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    const methodologyText = `This analysis leverages ${data.knowledgeSourcesUsed} research sources including Nielsen Norman Group, Baymard Institute, and other authoritative UX organizations. Our AI-powered analysis cross-references design patterns against established best practices to provide confidence-scored recommendations with measurable business impact.`;
    const splitMethodology = this.pdf.splitTextToSize(methodologyText, this.pageWidth - (this.margin * 2) - 10);
    this.pdf.text(splitMethodology, this.margin + 5, yPos);
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 15;
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('© 2024 Figmant - Professional UX Analysis Platform', this.margin, footerY);
    
    // Page number
    const pageNum = `Page ${this.pdf.internal.getCurrentPageInfo().pageNumber}`;
    this.pdf.text(pageNum, this.pageWidth - this.margin - 20, footerY);
  }
}

export const executiveReportService = new ExecutiveReportService();
