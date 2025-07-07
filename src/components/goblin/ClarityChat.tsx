import React from 'react';

interface ClarityChatProps {
  session: any;
  personaData: any;
}

const ClarityChat: React.FC<ClarityChatProps> = ({ session, personaData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Clarity's Chat Feedback 🧠</h2>
      <div className="text-gray-700 space-y-4">
        {personaData?.analysis && (
          <div>
            <h3 className="font-semibold text-lg">Initial Thoughts:</h3>
            <p className="whitespace-pre-wrap">{personaData.analysis}</p>
          </div>
        )}

        {personaData?.biggestGripe && (
          <div>
            <h3 className="font-semibold text-lg text-red-600">Biggest Gripe:</h3>
            <p className="text-red-700 whitespace-pre-wrap">{personaData.biggestGripe}</p>
          </div>
        )}

        {personaData?.whatMakesGoblinHappy && (
          <div>
            <h3 className="font-semibold text-lg text-green-600">What Clarity Likes:</h3>
            <p className="text-green-700 whitespace-pre-wrap">{personaData.whatMakesGoblinHappy}</p>
          </div>
        )}

        {personaData?.goblinPrediction && (
          <div>
            <h3 className="font-semibold text-lg text-purple-600">Future Forecast:</h3>
            <p className="text-purple-700 whitespace-pre-wrap">{personaData.goblinPrediction}</p>
          </div>
        )}

        {personaData?.goblinWisdom && (
          <div>
            <h3 className="font-semibold text-lg text-indigo-600">Ancient Goblin Wisdom:</h3>
            <blockquote className="italic text-indigo-700 border-l-4 border-indigo-300 pl-4">
              "{personaData.goblinWisdom}"
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClarityChat;
