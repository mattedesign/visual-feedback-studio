
export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen gradient-bedrock flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-lg">Loading Figmant.AI</h3>
          <p className="text-white/70">Preparing your design intelligence platform...</p>
        </div>
      </div>
    </div>
  );
};
