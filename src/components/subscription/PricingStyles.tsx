
import React from 'react';

export const PricingStyles = () => {
  return (
    <style>{`
      .pricing-card {
        position: relative;
        background: white;
        border-radius: 16px;
        border: 2px solid #e2e8f0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .pricing-card:hover {
        border-color: transparent;
        background: linear-gradient(white, white) padding-box,
                   linear-gradient(135deg, #d1fbff, #75cfff, #978aff) border-box;
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1),
                   0 0 0 1px rgba(209, 251, 255, 0.3);
      }

      .popular-card {
        border-color: rgba(151, 138, 255, 0.3);
        background: linear-gradient(white, white) padding-box,
                   linear-gradient(135deg, rgba(209, 251, 255, 0.3), rgba(117, 207, 255, 0.3), rgba(151, 138, 255, 0.3)) border-box;
      }

      .popular-card:hover {
        background: linear-gradient(white, white) padding-box,
                   linear-gradient(135deg, #d1fbff, #75cfff, #978aff) border-box;
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15),
                   0 0 0 1px rgba(209, 251, 255, 0.5);
      }

      .gradient-text {
        background: linear-gradient(135deg, #d1fbff, #75cfff, #978aff);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .gradient-badge {
        background: linear-gradient(135deg, rgba(209, 251, 255, 0.3), rgba(117, 207, 255, 0.3), rgba(151, 138, 255, 0.3));
        border: 1px solid rgba(209, 251, 255, 0.4);
      }

      .gradient-button {
        background: linear-gradient(135deg, #d1fbff, #75cfff, #978aff);
        transition: all 0.3s ease;
      }

      .gradient-button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    `}</style>
  );
};
