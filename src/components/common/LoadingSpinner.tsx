
export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-2xl font-bold mb-4">🔄 Loading</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <div className="text-lg text-slate-300">Initializing your session...</div>
        <div className="text-sm text-slate-400 mt-2">This may take a few moments</div>
      </div>
    </div>
  );
};
