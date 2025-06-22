
import { UploadSection } from '@/components/upload/UploadSection';

interface WelcomeSectionProps {
  onImageUpload: (uploadedImageUrl: string) => void;
}

export const WelcomeSection = ({ onImageUpload }: WelcomeSectionProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Design Analysis Tool
      </h1>
      <p className="text-xl text-slate-300 mb-8">
        Upload your design and get AI-powered feedback on UX, accessibility, and conversion optimization
      </p>
      <UploadSection onImageUpload={onImageUpload} />
    </div>
  );
};
