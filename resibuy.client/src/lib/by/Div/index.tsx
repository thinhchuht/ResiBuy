import React from "react";

// Core components converted to Tailwind

//#region Core (cap 1)
export function Core({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Core" className={`${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Container (cap 2)

export function Container({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Contain" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Area (cap 3)
export function Area({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Area" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Yard (cap 4)
export function Yard({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Yard" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Section (cap 5)
export function Section({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Section" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Anchor (cap 6)
export function Anchor({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Anchor" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Block (cap 7)
export function Block({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Block" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
//#endregion

//#region  Card (cap 8)

export function Card({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Card" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

//#region  Box (cap 9)

export function Box({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Box" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

//#region  Column (cap 10)

export function Column({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Column" className={`${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

//#region  Row (cap 11)

export function Row({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Row" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

//#region  Group (cap 12)

export function Group({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Group" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

//#region  Wrap (cap 13)
export function Wrap({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Wrap" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

//#region  Cover (cap 14)

export function Cover({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Cover" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#endregion

export function Scroll({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="">
      <div id="Scroll" className={` ${className || ""}`} {...args}>
        {children}
      </div>
    </div>
  );
}

export function Mass({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Mass" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

//#region text

export function RText({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p id="RText" className={` ${className || ""}`} {...args}>
      {children}
    </p>
  );
}
//#endregion

export function FControl({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="FormControl" className={`${className || ""}`} {...args}>
      {children}
    </div>
  );
}

export function FLabel({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="FLabel" className={`${className || ""}`} {...args}>
      {children}
    </div>
  );
}

export function FValid({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="FValid" className={`${className || ""}`} {...args}>
      {children}
    </div>
  );
}

export function Begin({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Begin" className={`${className || ""}`} {...args}>
      {children}
    </div>
  );
}

export function Content({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="Content" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}

export function End({
  className,
  children,
  ...args
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id="End" className={` ${className || ""}`} {...args}>
      {children}
    </div>
  );
}
