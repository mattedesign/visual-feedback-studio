import React from 'react';

export const ClaudeMessages = () => {
  return (
    <div 
      className="mx-4 mt-4 rounded-[20px] border border-[#E2E2E2] bg-white p-4"
      style={{
        width: '264px',
        height: '84px'
      }}
    >
      <div className="flex items-start gap-3">
        {/* Claude AI Avatar */}
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #22757C 0%, #18686F 100%)',
            border: '1px solid #ECECEC'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path 
              opacity="0.4"
              d="M7.337 2.333C6.718 2.333 6.1 2.854 6.1 3.371C6.1 2.854 5.482 2.333 4.863 2.333C3.605 2.333 3.227 3.481 3.227 3.481C3.227 3.481 2.171 3.889 2.171 5.193C2.171 5.339 2.187 5.479 2.222 5.609C1.491 5.805 1 6.502 1 7.303C1 7.651 1.277 8.232 1.277 8.232C1.277 8.232 1 8.587 1 9.256C1 10.232 1.749 11.105 2.677 11.219C2.893 11.971 3.408 12.4 4.244 12.4C5.482 12.4 6.1 11.634 6.1 10.711C6.1 11.634 6.718 12.4 7.956 12.4C8.792 12.4 9.307 11.971 9.523 11.219C10.451 11.105 11.2 10.232 11.2 9.256C11.2 8.587 10.923 8.232 10.923 8.232C10.923 8.232 11.2 7.651 11.2 7.303C11.2 6.502 10.709 5.805 9.978 5.609C10.013 5.479 10.029 5.339 10.029 5.193C10.029 3.889 8.973 3.481 8.973 3.481C8.973 3.481 8.595 2.333 7.337 2.333Z"
              fill="url(#paint0_linear)"
            />
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M5.724 7.372L4.847 5.211C4.764 5.037 4.429 5.037 4.346 5.211L3.469 7.372C3.467 7.376 3.465 7.379 3.464 7.382L3.05 8.411C2.995 8.529 3.057 8.666 3.176 8.721C3.295 8.777 3.431 8.714 3.487 8.595L3.861 7.701H5.268L5.642 8.595C5.683 8.695 5.783 8.752 5.889 8.752C5.922 8.752 5.955 8.746 5.986 8.721C6.105 8.666 6.167 8.529 6.112 8.411L5.698 7.382C5.697 7.379 5.695 7.376 5.694 7.372H5.724ZM4.049 7.234L4.517 6.208L4.985 7.234H4.049Z"
              fill="#22757C"
            />
            <path 
              d="M7.999 5.401C7.999 5.273 8.104 5.167 8.232 5.167C8.361 5.167 8.466 5.273 8.466 5.401V8.401C8.466 8.529 8.361 8.634 8.232 8.634C8.104 8.634 7.999 8.529 7.999 8.401V5.401Z"
              fill="#22757C"
            />
            <defs>
              <linearGradient id="paint0_linear" x1="6.1" y1="2.333" x2="6.1" y2="12.4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22757C"/>
                <stop offset="1" stopColor="#18686F"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-sm font-medium mb-1"
            style={{ color: '#121212' }}
          >
            Welcome to AI-powered UX analysis!
          </h3>
          <p 
            className="text-xs leading-4"
            style={{ color: '#353535' }}
          >
            Upload any design and get instant, actionable feedback on accessibility, user experience, and conversion optimization. Let's make your designs better together.
          </p>
        </div>
      </div>
    </div>
  );
};