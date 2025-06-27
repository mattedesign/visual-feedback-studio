
interface CurrentImageSummaryProps {
  currentImageAIAnnotations: any[];
  currentImageUserAnnotations: any[];
  isMultiImage: boolean;
}

export const CurrentImageSummary = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
  isMultiImage,
}: CurrentImageSummaryProps) => {
  if (!isMultiImage) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-xl text-white">🖼️</span>
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900">Current Image Summary</h4>
          <p className="text-sm text-gray-600 font-medium">Analysis overview for the selected image</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">AI Insights</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-2xl font-bold text-purple-700">{currentImageAIAnnotations.length}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Professional recommendations</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">Your Comments</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-2xl font-bold text-green-700">{currentImageUserAnnotations.length}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Personal annotations</p>
        </div>
      </div>
    </div>
  );
};
