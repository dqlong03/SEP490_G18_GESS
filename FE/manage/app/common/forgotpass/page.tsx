'use client';

import { useForgotPassword } from '@/hooks/common/forgotPassHook';
import ForgotPasswordForm from '@/components/common/ForgotPassForm';

export default function ForgotPasswordPage() {
  const { email, setEmail, error, success, loading, handleSubmit } = useForgotPassword();
  return (
    <ForgotPasswordForm
      email={email}
      setEmail={setEmail}
      error={error}
      success={success}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
}
