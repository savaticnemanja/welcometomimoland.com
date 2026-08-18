import { LaurelDefs } from "@/components/laurel";
import { PillarSweep } from "@/components/pillar-sweep";
import { RevealObserver } from "@/components/reveal-observer";
import { ScrollUI } from "@/components/scroll-ui";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Characters } from "@/components/sections/characters";
import { Community } from "@/components/sections/community";
import { Connect } from "@/components/sections/connect";
import { Ecosystem } from "@/components/sections/ecosystem";
import { Hero } from "@/components/sections/hero";
import { Opportunity } from "@/components/sections/opportunity";
import { Origins } from "@/components/sections/origins";
import { Partners } from "@/components/sections/partners";
import { Recognition } from "@/components/sections/recognition";
import { Slate } from "@/components/sections/slate";
import { Team } from "@/components/sections/team";
import { Vision } from "@/components/sections/vision";
import { WhatMimolandIs } from "@/components/sections/what-mimoland-is";

export default function Home() {
  return (
    <>
      <LaurelDefs />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Opportunity />
        <Origins />
        <WhatMimolandIs />
        <Characters />
        <Ecosystem />
        <Partners />
        <Community />
        <Recognition />
        <Slate />
        <Vision />
        <Team />
        <Connect />
      </main>
      <SiteFooter />
      <RevealObserver />
      <ScrollUI />
      <PillarSweep />
    </>
  );
}
