import { useState } from 'react';
import { visualPatterns, getPatternById } from '@/data/visualPatternLibrary';
import { PatternSearch } from '@/components/patterns/PatternSearch';
import { VisualPatternPreview } from '@/components/patterns/VisualPatternPreview';
import { PatternComparisonSlider } from '@/components/patterns/PatternComparisonSlider';
import { QuickImplementation } from '@/components/patterns/QuickImplementation';
import { SimilarPatterns } from '@/components/patterns/SimilarPatterns';

interface MentorData {
  greeting: string;
  strengths: string[];
  intent_inference: string;
  follow_up_questions: string[];
  visual_alternatives: Array<{
    title: string;
    description: string;
    visual_reference: string;
    company_example: string;
    impact: string;
    why_it_works: string[];
  }>;
  next_steps: string[];
}

interface Props {
  mentorData: MentorData | null | undefined;
  userImage: string | undefined;
}

export function VisualMentorSummary({ mentorData, userImage }: Props) {
  const [selectedAlternative, setSelectedAlternative] = useState(0);
  const [showPatternBrowser, setShowPatternBrowser] = useState(false);
  const [activeChatPrompt, setActiveChatPrompt] = useState<string | null>(null);

  const handleNextStepClick = (step: string) => {
    // Set the active chat prompt to trigger follow-up
    setActiveChatPrompt(step);
    console.log('User clicked on next step:', step);
  };
  
  // Handle case where mentorData is not available
  if (!mentorData) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
          <p className="text-lg text-gray-800">
            ✨ Hey! Your analysis is still processing. We'll show you visual alternatives and mentor insights once the analysis is complete.
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">What's coming next:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>🎨 Visual alternatives from successful companies</li>
            <li>💡 Specific improvement suggestions</li>
            <li>📊 Impact analysis for each recommendation</li>
            <li>🚀 Implementation guidance</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Warm Greeting - Keep it brief */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
        <p className="text-lg text-gray-800">{mentorData.greeting}</p>
      </div>
      
      {/* Strengths - Compact celebration */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">
          ✨ What's Working Well
        </h3>
        <ul className="space-y-1">
          {(mentorData.strengths || []).map((strength, i) => (
            <li key={i} className="text-sm text-green-800 flex items-start gap-2">
              <span>✓</span> {strength}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Visual Alternatives - THE MAIN FOCUS */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          🎨 Alternative Approaches to Explore
        </h2>
        
        {/* Alternative Selector Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {mentorData.visual_alternatives?.map((alt, i) => (
            <button
              key={i}
              onClick={() => setSelectedAlternative(i)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedAlternative === i
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {alt.company_example}: {alt.title}
            </button>
          )) || []}
        </div>
        
        {/* Visual Comparison - Only show if alternatives exist */}
        {mentorData.visual_alternatives && mentorData.visual_alternatives.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* User's Design */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Your Current Design
              </h3>
              {userImage ? (
                <img 
                  src={userImage} 
                  alt="Your design"
                  className="w-full rounded-lg border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Design image loading...</span>
                </div>
              )}
            </div>
            
            {/* Selected Alternative */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {mentorData.visual_alternatives[selectedAlternative]?.company_example || 'Example'} Approach
              </h3>
              <VisualPatternPreview 
                patternId={mentorData.visual_alternatives[selectedAlternative]?.visual_reference || 'default'}
                showInteraction={true}
              />
              
              {/* Why It Works */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">
                  {mentorData.visual_alternatives[selectedAlternative]?.impact || 'Improved user experience'}
                </p>
                <ul className="space-y-1">
                  {(mentorData.visual_alternatives[selectedAlternative]?.why_it_works || []).map((reason, i) => (
                    <li key={i} className="text-sm text-blue-800">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Description - Brief */}
        {mentorData.visual_alternatives && mentorData.visual_alternatives[selectedAlternative] && (
          <p className="mt-4 text-gray-600">
            {mentorData.visual_alternatives[selectedAlternative].description}
          </p>
        )}
      </div>
      
      {/* Questions - Collapsed by default */}
      <details className="bg-amber-50 p-4 rounded-lg">
        <summary className="cursor-pointer font-medium text-amber-900">
          💭 Help me understand your goals better...
        </summary>
        <div className="mt-3 space-y-2">
          {(mentorData.follow_up_questions || []).map((q, i) => (
            <p key={i} className="text-amber-800">• {q}</p>
          ))}
        </div>
      </details>
      
      {/* Next Steps - Simple CTAs */}
      <div className="flex flex-wrap gap-3">
        {(mentorData.next_steps || []).map((step, i) => (
          <button
            key={i}
            onClick={() => handleNextStepClick(step)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg 
                     hover:bg-gray-50 hover:border-blue-300 hover:shadow-sm transition-all text-sm cursor-pointer"
          >
            {step}
          </button>
        ))}
        
        {/* Browse More Patterns Button */}
        <button
          onClick={() => setShowPatternBrowser(!showPatternBrowser)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showPatternBrowser ? 'Hide' : 'Browse'} Pattern Library
        </button>
      </div>
      
      {/* Pattern Browser */}
      {showPatternBrowser && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <PatternSearch onPatternSelect={(patternId) => {
            // Handle pattern selection - could update selected alternative
            console.log('Selected pattern:', patternId);
          }} />
        </div>
      )}
    </div>
  );
}
