"use client";

import * as React from "react";

const TabsContext = React.createContext(null);

function Tabs({ className, value, defaultValue, onValueChange, children, ...props }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const controlled = value !== undefined;
  const activeValue = controlled ? value : internalValue;

  const setValue = React.useCallback(
    (next) => {
      if (!controlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div data-slot="tabs" className={`flex flex-col gap-2 ${className || ""}`.trim()} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      data-slot="tabs-list"
      className={`bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] ${className || ""}`.trim()}
      {...props}
    />
  );
}

function TabsTrigger({ className, value, ...props }) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      className={`data-[state=active]:bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ${className || ""}`.trim()}
      onClick={() => context?.setValue(value)}
      {...props}
    />
  );
}

function TabsContent({ className, value, ...props }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;

  return <div data-slot="tabs-content" className={`flex-1 outline-none ${className || ""}`.trim()} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
