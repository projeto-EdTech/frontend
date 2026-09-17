import React, { Suspense } from "react";
import ProfileStatsSkeleton from "@/components/Skeletons/ProfileStatsSkeleton";
import ProfileDataServer from "@/components/profile/ProfileDataServer";

// Depende da sessão do usuário (cookies), não pode ser pré-renderizada no build
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileStatsSkeleton />}>
      <ProfileDataServer />
    </Suspense>
  );
}
