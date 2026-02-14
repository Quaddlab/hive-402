"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { LocaleProvider } from "@/context/LocaleContext";
import { UIStateProvider, useUIState } from "@/context/UIStateContext";
import { SearchModal } from "@/components/dashboard/SearchModal";
import { NotificationDrawer } from "@/components/dashboard/NotificationDrawer";
import { useStacks } from "@/components/providers/StacksProvider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, isAuthenticating } = useStacks();
  const router = useRouter();
  const { isSearchOpen, setSearchOpen, isNotifOpen, setNotifOpen } =
    useUIState();

  React.useEffect(() => {
    if (!isAuthenticating && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isAuthenticating, router]);

  if (isAuthenticating || !isConnected) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Synchronizing Neural Handshake...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Modals at Root Level */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setNotifOpen(false)}
      />

      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header title="Intelligence Marketplace" />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <UIStateProvider>
        <DashboardContent>{children}</DashboardContent>
      </UIStateProvider>
    </LocaleProvider>
  );
}
