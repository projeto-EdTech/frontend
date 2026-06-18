import React, { Suspense } from "react";
import ProfileStatsSkeleton from "@/components/Skeletons/ProfileStatsSkeleton";
import ProfileDataServer from "@/components/profile/ProfileDataServer";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileStatsSkeleton />}>
      <ProfileDataServer />
    </Suspense>
  );
}
