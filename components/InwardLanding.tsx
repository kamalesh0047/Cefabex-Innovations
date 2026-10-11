"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconArrowDown, IconArrowUpRight, IconPhoto } from "@tabler/icons-react";
import { moments } from "@/lib/cefabex";
import { inwardChapters } from "@/lib/inward-motion";
import { Lightbox } from "./Gallery";
import { RouteLink } from "./Shell";
import type { createInwardScene } from "./inward-scene";

/** The only pinned section on Home. Everything after it remains normal document flow. */
export function InwardLanding() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [mode, setMode] = useState("loading");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced !== false) { setMode("static"); return; }
    const section = root.current;
    const host = canvas.current;
    if (!section || !host) return;
    let dead = false;
    let scene: ReturnType<typeof createInwardScene> | undefined;
    let context: gsap.Context | undefined;
    const dispose = () => {
      if (dead) return;
      dead = true;
      context?.revert();
      timeline.current = null;
      scene?.dispose();
      section.querySelectorAll<HTMLElement>("[data-inward-inert]").forEach(el => { el.inert = el.classList.contains("inward-finale"); });
    };
    const fail = () => { dispose(); setMode("static"); ScrollTrigger.refresh(); };
    setMode("loading");

    const boot = async () => {
      const { createInwardScene } = await import("./inward-scene");
      if (dead) return;
      scene = createInwardScene({ host, onReady: () => { if (!dead) setMode("webgl"); }, onFailure: fail });
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        const stage = section.querySelector<HTMLElement>(".inward-stage")!;
        const opening = section.querySelector<HTMLElement>(".inward-opening")!;
        const finale = section.querySelector<HTMLElement>(".inward-finale")!;
        const chapters = gsap.utils.toArray<HTMLElement>(".inward-chapter", section);
        const buttons = gsap.utils.toArray<HTMLButtonElement>(".inward-chapter-nav button", section);
        const travel = { progress: 0 };
        let current = -2;
        finale.inert = true;
        gsap.set(chapters, { autoAlpha: 0, scale: 1.14, y: 20 });
        gsap.set(finale, { autoAlpha: 0, scale: .93, y: 24 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: () => `top ${document.querySelector(".site-header")?.clientHeight || 80}px`,
            end: () => `+=${stage.clientHeight * (window.innerWidth < 768 ? 2.65 : 3.4)}`,
            pin: stage, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
          },
          onUpdate: () => {
            const p = travel.progress;
            scene?.setProgress(p);
            opening.inert = p > .13;
            finale.inert = p < .94;
            const next = p < .19 ? -1 : p < .43 ? 0 : p < .68 ? 1 : p < .9 ? 2 : 3;
            if (next !== current) {
              current = next;
              section.dataset.chapter = String(next);
              buttons.forEach((button, index) => {
                if (index === next) button.setAttribute("aria-current", "step");
                else button.removeAttribute("aria-current");
              });
            }
          },
        });
        tl.to(travel, { progress: 1, duration: 1 }, 0);
        // The opening typography recedes into the vanishing point as the
        // photographic space approaches. Chapter titles arrive, settle, depart.
        tl.to(opening, { opacity: 0, scale: .79, y: -12, duration: .15 }, .025);
        [[.20, .37], [.45, .62], [.70, .845]].forEach(([enter, exit], index) => {
          tl.to(chapters[index], { autoAlpha: 1, scale: 1, y: 0, duration: .055, ease: "power2.out" }, enter);
          tl.to(chapters[index], { autoAlpha: 0, scale: .92, y: -16, duration: .055, ease: "power2.in" }, exit);
        });
        tl.to(host, { opacity: 0, duration: .09 }, .90);
        tl.to(finale, { autoAlpha: 1, scale: 1, y: 0, duration: .08, ease: "power2.out" }, .91);
        timeline.current = tl;
      }, section);
      await document.fonts.ready;
      if (!dead) ScrollTrigger.refresh();
    };
    boot().catch(() => { if (!dead) fail(); });
    return dispose;
  }, [reduced]);

  const jump = (progress: number) => {
    const trigger = timeline.current?.scrollTrigger;
    if (trigger) window.dispatchEvent(new CustomEvent("cefabex:scroll-to", {detail:{target:trigger.start + (trigger.end - trigger.start) * progress}}));
  };

  return <section ref={root} className="inward-landing" data-mode={mode} aria-label="Cefabex Innovations introduction">
    <div className="inward-stage">
      <div className="inward-scene" ref={canvas}/>
      <div className="inward-paper" aria-hidden="true"/>
      <div className="inward-static-photos" aria-hidden="true">
        {[0, 1, 4].map((index, slot) => <div key={index} className={`inward-static-photo photo-${slot}`}><img src={moments[index].src} alt="" fetchPriority={slot === 0 ? "high" : "auto"} loading="eager" decoding="async"/></div>)}
      </div>
      <div className="inward-opening" data-inward-inert>
        <div className="inward-intro"><p>Practical ideas.<br/><em>Real-world possibilities.</em></p><RouteLink href="/inquiry" className="text-link">Let’s build something <IconArrowUpRight size={18}/></RouteLink></div>
        <h1 className="inward-title"><span>Cefabex</span><em>Innovations.</em></h1>
        <p className="sr-only">Build. Reach. Grow. Technology, design and collaboration, shaped around real-world needs.</p>
      </div>
      {inwardChapters.map((chapter, index) => <div className={`inward-chapter inward-chapter-${index}`} key={chapter.title} aria-hidden="true"><h2>{chapter.title}</h2><p>{chapter.description}</p></div>)}
      <div className="inward-finale" data-inward-inert>
        <h2>Good ideas deserve<br/><em>to become real.</em></h2>
        <p>Young startup. Serious work. Practical innovation.</p>
        <RouteLink href="/projects" className="button navy">Explore our work <IconArrowUpRight size={20}/></RouteLink>
      </div>
      <div className="inward-bottom">
        <div className="inward-chapter-nav" role="group" aria-label="Explore the introduction">
          {inwardChapters.map(chapter => <button key={chapter.title} disabled={mode !== "webgl"} onClick={() => jump(chapter.progress)} aria-label={`Go to ${chapter.title.slice(0, -1)} chapter`}>{chapter.title}</button>)}
        </div>
        <p className="inward-static-tagline">BUILD. REACH. GROW.</p>
        <div className="inward-actions"><button onClick={() => setOpen(true)}><IconPhoto size={17}/><span>Photographs</span></button><a href="#home-introduction">Meet Cefabex <IconArrowDown size={17}/></a></div>
      </div>
    </div>
    {open && <Lightbox images={moments} index={0} onClose={() => setOpen(false)}/>}
  </section>;
}
