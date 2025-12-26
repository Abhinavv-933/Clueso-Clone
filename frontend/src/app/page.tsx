"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

export default function RootPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if Clerk has loaded and user is signed in
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while loading to avoid flash
  if (!isLoaded) {
    return null;
  }

  // If signed in, don't render landing page (redirect is happening)
  if (isSignedIn) {
    return null;
  }

  // Only show landing page if not signed in
  return <LandingPage />;
}
