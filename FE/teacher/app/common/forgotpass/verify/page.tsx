'use client';

import { useOtpVerify } from '@/hooks/common/verifyHook';
import OtpVerifyForm from '@/components/common/VerifyForm';

export default function VerifyPage() {
  const { otp, error, loading, handleChange, handleFocus, handleSubmit } = useOtpVerify();
  return (
    <OtpVerifyForm
      otp={otp}
      error={error}
      loading={loading}
      handleChange={handleChange}
      handleFocus={handleFocus}
      handleSubmit={handleSubmit}
    />
  );
}
