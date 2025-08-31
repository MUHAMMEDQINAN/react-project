"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    console.log("withAuth: rendering with", { isLoading, isAuthenticated, pathname });

    useEffect(() => {
      console.log("withAuth: useEffect triggered with", { isLoading, isAuthenticated, pathname });
      if (!isLoading) {
        if (isAuthenticated) {
          // If authenticated and on the login page, redirect to home
          if (pathname === "/login") {
            router.replace("/");
          }
        } else {
          // If not authenticated and not on the login page, redirect to login
          if (pathname !== "/login") {
            router.replace("/login");
          }
        }
      }
    }, [isLoading, isAuthenticated, pathname, router]);

    // While we're checking for authentication, show a loading state.
    if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Skeleton className="h-[400px] w-[600px] rounded-xl" />
        </div>
      );
    }

    // If authenticated, render the protected component.
    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
