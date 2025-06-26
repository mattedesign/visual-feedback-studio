
export const LoadingSpinner = () => {
  console.log('🌀 LoadingSpinner rendered');
  return (
    <div className="min-h-screen bg-purple-500 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-purple-600 rounded-lg">
        <div className="text-2xl font-bold mb-4">🌀 LOADING SPINNER</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto"></div>
        <div className="mt-4 text-lg">Please wait...</div>
      </div>
    </div>
  );
};
