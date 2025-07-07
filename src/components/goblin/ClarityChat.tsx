import React from 'react';

interface ClarityChatProps {
  sessionId: string;
  personaType: string;
  personaData: any;
}

const ClarityChat: React.FC<ClarityChatProps> = ({ sessionId, personaType, personaData }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        👾 Clarity Goblin Chat
      </h2>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-800">
          Chat with the Clarity Goblin - coming soon!
        </p>
        <div className="mt-4 text-sm text-green-600">
          <p>Session: {sessionId}</p>
          <p>Persona: {personaType}</p>
        </div>
      </div>
    </div>
  );
};

export default ClarityChat;