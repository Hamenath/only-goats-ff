"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StaggeredMenu from "./StaggeredMenu";
import { Shield, User, Bell, LogOut, ChevronDown, Trophy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const MENU_ITEMS = [
  { label: "HOME", ariaLabel: "Go to home page", link: "/" },
  { label: "MY TEAM", ariaLabel: "Go to my team dashboard", link: "/my-team" },
  { label: "TOURNAMENTS", ariaLabel: "View all tournaments", link: "/tournament" },
  { label: "MATCH SCHEDULE", ariaLabel: "View live match schedule", link: "/schedule" },
  { label: "LIVE LEADERBOARD", ariaLabel: "View live tournament standings", link: "/leaderboard" },
  { label: "PRIZE POOL", ariaLabel: "View prize pool details", link: "/prize-pool" },
  { label: "TOURNAMENT RULES", ariaLabel: "Read official tournament rules", link: "/rules" },
  { label: "GALLERY", ariaLabel: "View tournament gallery", link: "/gallery" },
  { label: "FAQ", ariaLabel: "Frequently asked questions", link: "/faq" },
  { label: "CONTACT", ariaLabel: "Get in touch with support", link: "/contact" },
];

const SOCIAL_ITEMS = [
  { label: "Discord", link: "https://discord.gg/pPTSdw8JW" },
  { label: "Instagram", link: "https://www.instagram.com/only_goats_esp/" },
  { label: "WhatsApp", link: "https://chat.whatsapp.com/FeeiKNO0jeBCa0LKOa8iMZ?s=sh&p=a&mlu=4&amv=2" },
];

interface PlayerSession {
  squadId: string;
  phone: string;
  captainName?: string;
  stage?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check for active Squad Authentication Session
  useEffect(() => {
    const savedSquadId = localStorage.getItem("og_auth_squad_id");
    const savedPhone = localStorage.getItem("og_auth_phone");

    if (savedSquadId && savedPhone) {
      setPlayerSession({
        squadId: savedSquadId,
        phone: savedPhone,
        captainName: "Captain",
        stage: "Qualifier 1",
      });
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("og_auth_squad_id");
    localStorage.removeItem("og_auth_phone");
    setPlayerSession(null);
    setDropdownOpen(false);
    toast.success("Logged out of squad session.");
  };

  return (
    <>
      {/* AUTHENTICATED PLAYER PROFILE BADGE OVERLAY */}
      {playerSession && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: 28,
            zIndex: 9990,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 16px",
                background: "rgba(17, 17, 17, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 9, 20, 0.3)",
                borderRadius: 20,
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 8px #22C55E",
                }}
              />
              <Shield size={14} style={{ color: "#E50914" }} />
              <span style={{ fontFamily: "monospace", color: "#FFD700" }}>
                {playerSession.squadId}
              </span>
              <ChevronDown size={14} style={{ color: "#999" }} />
            </button>

            {/* Glass Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "120%",
                  left: 0,
                  width: 220,
                  background: "rgba(17, 17, 17, 0.95)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 16,
                  padding: 10,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  zIndex: 9991,
                }}
              >
                <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 6 }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>
                    VERIFIED SQUAD
                  </span>
                  <strong style={{ fontSize: 13, color: "#FFF", fontFamily: "monospace" }}>
                    {playerSession.squadId}
                  </strong>
                </div>

                <Link
                  href="/my-team"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    color: "#FFF",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <User size={14} style={{ color: "#E50914" }} />
                  <span>My Team</span>
                </Link>

                <div
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    color: "#EF4444",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AAA STAGGERED NAVIGATION MENU */}
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
    </>
  );
}

export default Navbar;
