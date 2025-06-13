"use client";

import HeaderMenu from "@/components/HeaderMenu";
import { headerData } from "@/constants/homepage";
import { Core } from "@/lib/by/Div";

const Header = () => {
  return (
    <Core className="sticky top-0 z-50 shadow-sm">
      <HeaderMenu headers={headerData} />
    </Core>
  );
};

export default Header;
