'use client';

import { useParams } from "next/navigation";
import { useUserInfo } from "@hooks/admin/userInfoHook";
import UserInfoForm from "@components/admin/manageuser/UserInfoForm";
import React from "react";

export default function UserInformationPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const { userData, loading, handleChange, handleSubmit } = useUserInfo(userId);

  // Wrap handleSubmit for form event
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
    // Optionally show a success message or redirect
  };

  return (
    <UserInfoForm
      userData={userData}
      loading={loading}
      handleChange={handleChange}
      handleSubmit={onSubmit}
    />
  );
}
