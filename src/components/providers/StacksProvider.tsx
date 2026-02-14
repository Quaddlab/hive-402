"use client";

import * as React from "react";
interface StacksProviderProps {
  children: React.ReactNode;
}
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AppConfig, UserSession, UserData } from "@stacks/connect";
import { Connect, useConnect } from "@stacks/connect-react";
import { STACKS_TESTNET } from "@stacks/network";
import type { AuthOptions } from "@stacks/connect";

interface StacksContextType {
  userSession: UserSession;
  userData: UserData | null;
  isConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  address: string | null;
  bnsName: string | null;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export const StacksProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [bnsName, setBnsName] = useState<string | null>(null);

  const appConfig = useMemo(
    () => new AppConfig(["store_write", "publish_data"]),
    [],
  );
  const userSession = useMemo(
    () => new UserSession({ appConfig }),
    [appConfig],
  );

  const syncProfile = useCallback(async (stxAddress: string) => {
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: stxAddress }),
      });
    } catch (e) {
      console.error("Profile Sync failed:", e);
    }
  }, []);

  const resolveBnsName = useCallback(async (stxAddress: string) => {
    try {
      // Query Hiro API for names associated with this address
      const apiUrl = `https://api.testnet.hiro.so/v1/addresses/stacks/${stxAddress}/names`;
      const response = await fetch(apiUrl);
      if (!response.ok) return;

      const data = await response.json();
      if (data.names && data.names.length > 0) {
        setBnsName(data.names[0]);
      }
    } catch (error) {
      console.error("BNS Resolution Error:", error);
    }
  }, []);

  const updateUserData = useCallback(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setUserData(data as any);
      // Modern Stacks address retrieval
      const stxAddress = data.profile?.stxAddress;
      const addr =
        typeof stxAddress === "string"
          ? stxAddress
          : stxAddress?.testnet || stxAddress?.mainnet || null;
      setAddress(addr);

      // Auto-sync profile to DB and resolve BNS
      if (addr) {
        syncProfile(addr);
        resolveBnsName(addr);
      }
    } else {
      setUserData(null);
      setAddress(null);
      setBnsName(null);
    }
  }, [userSession, syncProfile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      updateUserData();
    }
  }, [updateUserData]);

  const authOptions = useMemo(
    () => ({
      appDetails: {
        name: "HIVE-402",
        icon:
          typeof window !== "undefined"
            ? window.location.origin + "/logo.png"
            : "",
      },
      userSession,
      network: STACKS_TESTNET,
      onFinish: () => {
        updateUserData();
        if (typeof window !== "undefined") window.location.reload();
      },
      onCancel: () => {
        console.log("Wallet connection cancelled");
      },
    }),
    [userSession, updateUserData],
  );

  return (
    <Connect authOptions={authOptions as AuthOptions}>
      <StacksContext.Provider
        value={{
          userSession,
          userData,
          isConnected: !!userData,
          connectWallet: () => {
            // Defined in useStacks hook
          },
          disconnectWallet: () => {
            userSession.signUserOut();
            updateUserData();
            if (typeof window !== "undefined") window.location.reload();
          },
          address,
          bnsName,
        }}
      >
        {children}
      </StacksContext.Provider>
    </Connect>
  );
};

export const useStacks = () => {
  const context = useContext(StacksContext);
  const { doOpenAuth, isAuthenticating } = useConnect();

  if (context === undefined) {
    throw new Error("useStacks must be used within a StacksProvider");
  }

  return {
    ...context,
    isAuthenticating,
    connectWallet: () => doOpenAuth(true), // Modern non-deprecated way
  };
};
