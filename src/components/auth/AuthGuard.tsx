
import { useNavigate } from 'react-router-dom';

export const AuthGuard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
        <p className="text-slate-400 mb-6">You need to be signed in to use the design analysis tool.</p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};
