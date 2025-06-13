"use client";

import { ReactNode, useState, createContext, useContext } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (key: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="space-y-4">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return <div className="flex justify-around border-b">{children}</div>;
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within <Tabs>");

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`pb-2 w-full border-b-2 transition-all duration-200  ${
        isActive
          ? "border-pink-500 text-pink-600 font-semibold"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within <Tabs>");

  return context.activeTab === value ? <div>{children}</div> : null;
}
