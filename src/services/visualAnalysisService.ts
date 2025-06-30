
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';

export interface VisualAnalysisExportData {
  imageUrl: string;
  annotations: Annotation[];
  analysisId: string;
  siteName?: string;
}

export const visualAnalysisService = {
  downloadAnnotatedImage: async (data: VisualAnalysisExportData): Promise<void> => {
    try {
      toast.info('Generating annotated image...');
      
      // Create a canvas to compose the annotated image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      // Load the original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = data.imageUrl;
      });
      
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Draw annotations
      data.annotations.forEach((annotation, index) => {
        if (annotation.x !== undefined && annotation.y !== undefined) {
          const x = (annotation.x / 100) * canvas.width;
          const y = (annotation.y / 100) * canvas.height;
          
          // Draw annotation circle
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, 2 * Math.PI);
          ctx.fillStyle = this.getSeverityColor(annotation.severity);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
          
          // Draw annotation number
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((index + 1).toString(), x, y + 6);
          
          // Draw callout line and text box for the first few annotations
          if (index < 3) {
            const calloutX = x + 60;
            const calloutY = y - 30;
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(x + 20, y);
            ctx.lineTo(calloutX - 10, calloutY);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw text background
            const text = annotation.title || annotation.feedback?.substring(0, 40) + '...' || 'Annotation';
            ctx.font = '12px Arial';
            const textWidth = ctx.measureText(text).width + 20;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(calloutX - 10, calloutY - 20, textWidth, 30);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(calloutX - 10, calloutY - 20, textWidth, 30);
            
            // Draw text
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';
            ctx.fillText(text, calloutX, calloutY);
          }
        }
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Figmant_Analysis_${data.siteName || 'Image'}_${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Annotated image downloaded successfully!');
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Failed to generate annotated image:', error);
      toast.error('Failed to generate annotated image');
    }
  },

  copyAnnotationURLs: async (data: VisualAnalysisExportData): Promise<void> => {
    try {
      const baseUrl = window.location.origin;
      const urls = data.annotations.map((annotation, index) => {
        const annotationId = annotation.id || `annotation-${index}`;
        return `${baseUrl}/analysis/${data.analysisId}?annotation=${annotationId}`;
      });
      
      const urlText = urls.join('\n');
      await navigator.clipboard.writeText(urlText);
      toast.success(`${urls.length} annotation URLs copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy URLs:', error);
      toast.error('Failed to copy annotation URLs');
    }
  },

  generateTechnicalBrief: async (data: VisualAnalysisExportData): Promise<void> => {
    try {
      toast.info('Generating technical brief...');
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text('Figmant Technical Brief', 20, 20);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text('Developer Handoff Document', 20, 50);
      
      // Analysis details
      pdf.setFontSize(12);
      pdf.text(`Analysis ID: ${data.analysisId}`, 20, 70);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 80);
      pdf.text(`Total Annotations: ${data.annotations.length}`, 20, 90);
      
      // Annotations breakdown
      let yPosition = 110;
      
      pdf.setFontSize(14);
      pdf.text('Implementation Recommendations', 20, yPosition);
      yPosition += 20;
      
      data.annotations.forEach((annotation, index) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Annotation header
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${annotation.title || 'Annotation'}`, 20, yPosition);
        yPosition += 10;
        
        // Severity and category
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Severity: ${annotation.severity?.toUpperCase() || 'MEDIUM'} | Category: ${annotation.category || 'UX'}`, 25, yPosition);
        yPosition += 8;
        
        // Description
        if (annotation.feedback) {
          const description = pdf.splitTextToSize(annotation.feedback, pageWidth - 50);
          pdf.text(description, 25, yPosition);
          yPosition += description.length * 5;
        }
        
        // Technical specifications
        pdf.setFont('helvetica', 'bold');
        pdf.text('Technical Specifications:', 25, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        const techSpecs = [
          `• Implementation Effort: ${annotation.implementationEffort || 'Medium'}`,
          `• Business Impact: ${annotation.businessImpact || 'Medium'}`,
          `• Confidence Level: ${annotation.confidence ? Math.round(annotation.confidence * 100) + '%' : '80%'}`,
          '• Accessibility: Ensure WCAG 2.1 AA compliance',
          '• Testing: Cross-browser compatibility required'
        ];
        
        techSpecs.forEach(spec => {
          pdf.text(spec, 30, yPosition);
          yPosition += 6;
        });
        
        // Research backing
        if (annotation.researchBacking && annotation.researchBacking.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Research Backing:', 25, yPosition);
          yPosition += 8;
          
          pdf.setFont('helvetica', 'normal');
          annotation.researchBacking.slice(0, 2).forEach(source => {
            const sourceText = pdf.splitTextToSize(`• ${source}`, pageWidth - 55);
            pdf.text(sourceText, 30, yPosition);
            yPosition += sourceText.length * 5;
          });
        }
        
        yPosition += 10; // Space between annotations
      });
      
      // Implementation timeline
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(14);
      pdf.text('Implementation Timeline', 20, yPosition);
      yPosition += 20;
      
      const criticalCount = data.annotations.filter(a => a.severity === 'critical').length;
      const suggestedCount = data.annotations.filter(a => a.severity === 'suggested').length;
      const enhancementCount = data.annotations.filter(a => a.severity === 'enhancement').length;
      
      pdf.setFontSize(10);
      pdf.text(`Phase 1 (Week 1-2): Critical Issues (${criticalCount} items)`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Phase 2 (Week 3-4): Suggested Improvements (${suggestedCount} items)`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Phase 3 (Week 5-6): Enhancements (${enhancementCount} items)`, 25, yPosition);
      
      // Footer
      pdf.setFontSize(8);
      pdf.text('© 2024 Figmant - Professional UX Analysis Platform', 20, pageHeight - 10);
      
      pdf.save(`Figmant_Technical_Brief_${data.analysisId}.pdf`);
      toast.success('Technical brief generated successfully!');
      
    } catch (error) {
      console.error('Failed to generate technical brief:', error);
      toast.error('Failed to generate technical brief');
    }
  },

  getSeverityColor: (severity: string): string => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'suggested': return '#eab308';
      case 'enhancement': return '#3b82f6';
      default: return '#6b7280';
    }
  }
};
