import { useState } from 'react';
import { getPatternById } from '@/data/visualPatternLibrary';

interface Props {
  patternId: string;
}

export function QuickImplementation({ patternId }: Props) {
  const [showCode, setShowCode] = useState(false);
  const pattern = getPatternById(patternId);
  
  return (
    <div className="border-t pt-4 mt-4">
      <button
        onClick={() => setShowCode(!showCode)}
        className="text-sm text-blue-600 hover:underline"
      >
        {showCode ? 'Hide' : 'Show'} quick implementation 
        ({pattern.implementation_time})
      </button>
      
      {showCode && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`/* ${pattern.company} ${pattern.name} Pattern */

/* Key Visual Elements:
   - ${pattern.tags.join('\n   - ')}
   
   Implementation time: ${pattern.implementation_time}
*/

.container {
  /* Simplified implementation focused on visual impact */
  ...
}`}
          </pre>
        </div>
      )}
    </div>
  );
}