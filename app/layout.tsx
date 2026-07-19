import type { Metadata } from "next";
import "./globals.css";
import { ChatWidget } from "@/components/ui/ChatWidget";

export const metadata: Metadata = {
  title: "LaunchPadX - GrowthConnect",
  description: "Submit your idea and use of funds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
