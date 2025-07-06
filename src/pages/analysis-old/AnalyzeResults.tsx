// ARCHIVED: This component was part of the original analysis system
// It has been archived during the transition to Figmant v128.1 Goblin Edition
// New goblin analysis system will replace this functionality

import { useParams, useNavigate } from 'react-router-dom'

export default function AnalyzeResults() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Analysis System Archived</h1>
        <p className="text-slate-300 mb-4">This analysis system has been archived.</p>
        <p className="text-slate-300 mb-6">Please use the new Goblin Edition system at /goblin</p>
        <button 
          onClick={() => navigate('/goblin')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Go to Goblin Edition
        </button>
      </div>
    </div>
  )
}