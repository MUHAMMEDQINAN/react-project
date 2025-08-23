"use client";

import { AuthProvider } from "@/context/AuthContext";

function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default Providers;