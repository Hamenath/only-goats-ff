import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveStats } from "@/components/home/LiveStats";
import { Roadmap } from "@/components/home/Roadmap";
import { PointSystem } from "@/components/home/PointSystem";
import { MatchSchedule } from "@/components/home/MatchSchedule";
import { PrizePool } from "@/components/home/PrizePool";

export const metadata: Metadata = {
  title: "Only Goats FF — Elite Free Fire Tournament",
  description:
    "Battle, survive, become the champion. Join the most prestigious Free Fire tournament with ₹1000 prize pool. Register your squad now.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LiveStats />
      <Roadmap />
      <PointSystem />
      <MatchSchedule />
      <PrizePool />
    </>
  );
}
