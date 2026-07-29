"use client";

import StaggeredMenu from "./StaggeredMenu";

const MENU_ITEMS = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "Tournament", ariaLabel: "Learn about the tournament", link: "/tournament" },
  { label: "Rules", ariaLabel: "Tournament rules", link: "/rules" },
  { label: "Schedule", ariaLabel: "Matches schedule", link: "/schedule" },
  { label: "Prize Pool", ariaLabel: "View prize pool details", link: "/prize-pool" },
  { label: "Leaderboard", ariaLabel: "Live standings", link: "/leaderboard" },
  { label: "Gallery", ariaLabel: "Tournament gallery", link: "/gallery" },
  { label: "FAQ", ariaLabel: "Frequently asked questions", link: "/faq" },
  { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
];

const SOCIAL_ITEMS = [
  { label: "Discord", link: "https://discord.gg/" },
  { label: "Instagram", link: "https://instagram.com/" },
  { label: "WhatsApp", link: "https://wa.me/" },
];

export function Navbar() {
  return (
    <StaggeredMenu
      position="right"
      items={MENU_ITEMS}
      socialItems={SOCIAL_ITEMS}
      displaySocials={true}
      displayItemNumbering={true}
      menuButtonColor="#111"
      openMenuButtonColor="#111"
      changeMenuColorOnOpen={true}
      colors={["#111111", "#e50914"]}
      accentColor="#e50914"
      isFixed={true}
    />
  );
}

export default Navbar;
