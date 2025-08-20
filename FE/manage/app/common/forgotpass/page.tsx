'use client';

import { useForgotPassword } from '@/hooks/common/forgotPassHook';
import ForgotPasswordForm from '@/components/common/ForgotPassForm';
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  const { email, setEmail, error, success, loading, handleSubmit } = useForgotPassword();
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <ForgotPasswordForm
      email={email}
      setEmail={setEmail}
      error={error}
      success={success}
      loading={loading}
      handleSubmit={handleSubmit}
    />
    </Suspense>
  );
}
