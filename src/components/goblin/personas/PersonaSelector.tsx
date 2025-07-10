import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';

interface GoblinPersonaConfig {
  id: GoblinPersonaType;
  name: string;
  emoji: string;
  description: string;
  speciality: string;
  tone: string;
}

const GOBLIN_PERSONAS: GoblinPersonaConfig[] = [
  {
    id: 'strategic',
    name: 'Strategic Peer',
    emoji: '🎯',
    description: 'Senior UX strategist providing peer-level critique',
    speciality: 'Business impact & conversion optimization',
    tone: 'Professional, research-backed'
  },
  {
    id: 'clarity',
    name: 'Clarity (The UX Goblin)',
    emoji: '👾',
    description: 'Brutally honest feedback with no sugarcoating',
    speciality: 'Truth-telling & practical fixes',
    tone: 'Sassy, direct, helpful'
  },
  {
    id: 'mirror',
    name: 'Mirror of Intent',
    emoji: '🪞',
    description: 'Reflective coach for self-awareness',
    speciality: 'Intent vs perception analysis',
    tone: 'Curious, non-judgmental'
  },
  {
    id: 'mad',
    name: 'Mad UX Scientist',
    emoji: '🧪',
    description: 'Wild experiments and unconventional approaches',
    speciality: 'Pattern-breaking ideas & A/B tests',
    tone: 'Creative, experimental'
  },
  {
    id: 'exec',
    name: 'C-Suite Whisperer',
    emoji: '💼',
    description: 'Business impact-focused summaries',
    speciality: 'Executive communication & ROI',
    tone: 'Executive, metrics-driven'
  }
];

interface GoblinPersonaSelectorProps {
  selectedPersona: GoblinPersonaType;
  onPersonaChange: (persona: GoblinPersonaType) => void;
  className?: string;
}

export const GoblinPersonaSelector: React.FC<GoblinPersonaSelectorProps> = ({
  selectedPersona,
  onPersonaChange,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Choose Your Analysis Persona</h3>
        <p className="text-gray-600">Each persona provides a unique perspective on your design</p>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
          5 Expert Personas Available
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOBLIN_PERSONAS.map((persona) => {
          const isSelected = selectedPersona === persona.id;
          const isGoblin = persona.id === 'clarity';
          
          return (
            <Card
              key={persona.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? isGoblin 
                    ? 'ring-2 ring-green-500 bg-green-50 border-green-200'
                    : 'ring-2 ring-purple-500 bg-purple-50 border-purple-200'
                  : 'hover:bg-gray-50 border-gray-200'
              } ${isGoblin && !isSelected ? 'border-green-200 hover:border-green-300' : ''}`}
              onClick={() => onPersonaChange(persona.id)}
            >
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="text-4xl mb-2">{persona.emoji}</div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        isGoblin ? 'bg-green-500' : 'bg-purple-500'
                      }`}>
                        ✓
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-lg">{persona.name}</h4>
                  {isGoblin && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 font-semibold">
                      Goblin Mode 👾
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{persona.description}</p>
                
                <div className={`text-xs font-medium p-2 rounded-md ${
                  isGoblin 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {persona.speciality}
                </div>

                <div className="space-y-1 text-xs text-gray-500">
                  <div><strong>Focus:</strong> {persona.speciality}</div>
                  <div><strong>Style:</strong> {persona.tone}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedPersona && (
        <div className={`p-4 rounded-lg border-2 ${
          selectedPersona === 'clarity' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-3xl">
              {GOBLIN_PERSONAS.find(p => p.id === selectedPersona)?.emoji}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-bold ${
                  selectedPersona === 'clarity' ? 'text-green-900' : 'text-purple-900'
                }`}>
                  Selected: {GOBLIN_PERSONAS.find(p => p.id === selectedPersona)?.name}
                </span>
                {selectedPersona === 'clarity' && (
                  <Badge className="bg-green-500 text-white">Goblin Ready!</Badge>
                )}
              </div>
              <p className={`text-sm ${
                selectedPersona === 'clarity' ? 'text-green-700' : 'text-purple-700'
              }`}>
                {GOBLIN_PERSONAS.find(p => p.id === selectedPersona)?.description}
              </p>
              <p className={`text-xs mt-1 italic ${
                selectedPersona === 'clarity' ? 'text-green-600' : 'text-purple-600'
              }`}>
                Focus: {GOBLIN_PERSONAS.find(p => p.id === selectedPersona)?.speciality}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedPersona === 'clarity' && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👾</span>
            <span className="font-semibold text-green-800">Goblin Mode Activated!</span>
          </div>
          <p className="text-sm text-green-700">
            Clarity will give you the brutal truth about what users actually experience. 
            Expect sassy feedback, goblin wisdom, and practical fixes that cut through design BS.
          </p>
          <p className="text-xs text-green-600 mt-2 italic">
            *Gripe Level may vary from "Eye Twitch" to "Rage-Cranked" depending on your design*
          </p>
        </div>
      )}
    </div>
  );
};