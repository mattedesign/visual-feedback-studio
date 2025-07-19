import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AnalysisDashboard = () => {
  const navigate = useNavigate();
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('Summary');

  return (
    <div className="flex gap-6 p-6 h-full bg-[#f1f1f1]">
      {/* Main Content - Image Gallery */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[800px] flex flex-col-reverse gap-6">
          {/* Top Row */}
          <div className="flex gap-6">
            {[
              { title: 'Saas Website Landing Page', subtitle: '4 Annotations' },
              { title: 'Cute Shop Storefront Icon', subtitle: '3D Icons' }
            ].map((item, index) => (
              <div key={index} className="flex-1 bg-[#fcfcfc] border border-[#ececec] rounded-3xl p-2 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[16/10] bg-[#e5e7eb] rounded-xl mb-2 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
                                 linear-gradient(-45deg, #f3f4f6 25%, transparent 25%)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-[#121212] mb-1">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#7b7b7b] opacity-80">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="flex gap-6">
            {[
              { title: 'Futuristic Humanoid Robot', subtitle: 'Untitled Folder' },
              { title: 'Cute Shop Storefront Icon', subtitle: '3D Icons' }
            ].map((item, index) => (
              <div key={index} className="flex-1 bg-[#fcfcfc] border border-[#ececec] rounded-3xl p-2 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[16/10] bg-[#e5e7eb] rounded-xl mb-2 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
                                 linear-gradient(-45deg, #f3f4f6 25%, transparent 25%)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-[#121212] mb-1">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#7b7b7b] opacity-80">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Analysis */}
      <div className="w-60 bg-[#fcfcfc] border border-[#e2e2e2] rounded-[20px] flex flex-col">
        {/* Header */}
        <div className="p-3 px-4 flex justify-between items-center">
          <div className="text-[15px] font-semibold text-[#121212]">Details</div>
          <button className="bg-gradient-to-b from-[#e5e5e5] to-[#e2e2e2] px-6 py-2.5 rounded-xl text-sm font-semibold text-[#121212] hover:shadow-md transition-shadow">
            Share
          </button>
        </div>

        {/* Analysis Tabs */}
        <div className="p-3 border-t border-[#ececec]">
          <div className="bg-[#f1f1f1] rounded-xl p-1 flex">
            {['Summary', 'Ideas'].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveAnalysisTab(tab)}
                className={`flex-1 px-3 py-2 text-center rounded-lg text-[13px] font-semibold cursor-pointer transition-all ${
                  activeAnalysisTab === tab
                    ? 'bg-white text-[#121212] shadow-sm'
                    : 'text-[#7b7b7b] hover:text-[#121212]'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Header */}
        <div className="p-3 px-4 border-t border-[#ececec] flex justify-between items-center">
          <div className="text-xs font-semibold text-[#121212]">Analysis Overview</div>
          <div className="text-[#7b7b7b] cursor-pointer">⌄</div>
        </div>

        {/* Analysis Content */}
        <div className="p-3 flex-1">
          {/* Analysis Item */}
          <div className="bg-[#f1f1f1] border border-[#e2e2e2] rounded-[14px] p-1 mb-3">
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white border border-[#e9ecef] rounded-lg flex items-center justify-center">
                  📷
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-medium text-[#343a40] mb-1">3 Images</div>
                  <div className="bg-gradient-to-r from-[#05aa82] to-[#58ba97] text-white px-2 py-0.5 rounded-full text-xs inline-block">
                    1 analysed
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#343a40]">
                <div>⏱️</div>
                <div>Processing</div>
              </div>
            </div>
          </div>

          {/* Service Integrations */}
          {[
            { name: 'SalesForce', desc: 'Automate email communication', logo: 'bg-[#00a1e0] w-5 h-3.5 rounded' },
            { name: 'Hubspot', desc: 'Automate email communication', logo: 'bg-[#45535e] w-[19px] h-1.5 rounded' },
            { name: 'Zapier', desc: 'Automate email communication', logo: 'bg-[#ff4f00] w-6 h-6 rounded-full' },
            { name: 'SendGrid', desc: 'Automate email communication', logo: 'bg-[#1a82e2] w-2.5 h-2.5 rounded-full' }
          ].map((service, index) => (
            <div key={index} className="bg-white border border-[#e1e4ea] rounded-xl p-2 flex items-center gap-3 mb-3 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-white border border-[#e1e4ea] rounded-[10px] flex items-center justify-center">
                <div className={service.logo}></div>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-[#0e121b] mb-0.5">
                  {service.name}
                </div>
                <div className="text-[11px] text-[#7b7b7b]">
                  {service.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;