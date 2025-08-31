// src/app/user/layout.tsx
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayoutUser({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    </div>
  );
}
