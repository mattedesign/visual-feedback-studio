import { getPatternsByCategory } from '@/data/visualPatternLibrary';

interface Props {
  currentPatternId: string;
  category: string;
}

export function SimilarPatterns({ currentPatternId, category }: Props) {
  const similarPatterns = getPatternsByCategory(category)
    .filter(p => p.id !== currentPatternId)
    .slice(0, 3);
  
  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-4">
        Similar Patterns You Might Like
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        {similarPatterns.map(pattern => (
          <button
            key={pattern.id}
            className="group text-left"
            onClick={() => {/* Navigate to pattern */}}
          >
            <img 
              src={pattern.thumbnails.default}
              className="w-full aspect-video object-cover rounded-lg 
                       group-hover:shadow-lg transition-shadow"
            />
            <p className="mt-2 text-sm font-medium">{pattern.company}</p>
            <p className="text-xs text-gray-600">{pattern.impact}</p>
          </button>
        ))}
      </div>
    </div>
  );
}