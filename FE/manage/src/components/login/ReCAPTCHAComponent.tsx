// src/components/ReCAPTCHAComponent.tsx
'use client';

import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCAPTCHAProps {
  onChange: (token: string | null) => void;
}

const ReCAPTCHAComponent: React.FC<ReCAPTCHAProps> = ({ onChange }) => {
  return (
    <div className="flex justify-start mt-4 w-full">
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        onChange={onChange}
      />
    </div>
  );
};

export default ReCAPTCHAComponent;
