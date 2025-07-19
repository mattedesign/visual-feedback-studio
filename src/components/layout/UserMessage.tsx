import React from 'react';

interface UserMessageProps {
  message: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="mx-4 mb-4">
      <div 
        className="relative rounded-[20px] px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, #22757C 0%, #18686F 100%)',
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Gradient border effect */}
        <div 
          className="absolute inset-0 rounded-[20px] p-[1px]"
          style={{
            background: 'linear-gradient(180deg, #22757C 0%, #18686F 100%)',
            zIndex: -1
          }}
        >
          <div 
            className="w-full h-full rounded-[20px]"
            style={{
              background: 'linear-gradient(180deg, #22757C 0%, #18686F 100%)'
            }}
          />
        </div>
        
        {/* Black border overlay */}
        <div 
          className="absolute inset-0 rounded-[20px] border"
          style={{
            borderColor: 'rgba(0, 0, 0, 0.2)',
            pointerEvents: 'none'
          }}
        />
        
        <p className="text-[#FCFCFC] text-sm font-medium leading-5 relative z-10">
          {message}
        </p>
      </div>
    </div>
  );
};