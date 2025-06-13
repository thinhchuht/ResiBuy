"use client";

import FooterMenu from "@/components/FooterMenu";
import { footerData } from "@/constants/homepage";
import { Core } from "@/lib/by/Div";

const Footer = () => {
  return (
    <Core className="">
      <FooterMenu footers={footerData} />
    </Core>
  );
};

export default Footer;
