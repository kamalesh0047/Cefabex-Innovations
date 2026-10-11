"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { IconArrowUpRight, IconBrandInstagram, IconBrandYoutube, IconBrandLinkedin, IconBrandWhatsapp, IconMenu2, IconX } from "@tabler/icons-react";
import { socials } from "@/lib/cefabex";

gsap.registerPlugin(ScrollTrigger);
export function RouteLink({href, children, className = "", ...props}: {href:string; children:React.ReactNode; className?:string; [key:string]:unknown}) {
  return <Link href={href} className={className} {...props} onClick={(e) => {
    if(typeof props.onClick === "function") props.onClick(e);
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || href.startsWith("#") || window.location.pathname === href.split("?")[0]) return;
    e.preventDefault(); window.dispatchEvent(new CustomEvent("cefabex:navigate", {detail:href}));
  }}>{children}</Link>;
}

export function Socials({linkedin = true}: {linkedin?:boolean}) {
  return <div className="socials">
    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Cefabex on Instagram"><IconBrandInstagram size={20}/></a>
    <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="Cefabex on YouTube"><IconBrandYoutube size={21}/></a>
    {linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Fathima Rahna on LinkedIn"><IconBrandLinkedin size={20}/></a>}
    <a href={socials.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with Cefabex on WhatsApp"><IconBrandWhatsapp size={20}/></a>
  </div>;
}

const links = [["/","Home"],["/about","About"],["/services","Services"],["/projects","Projects"],["/events","Events"],["/reviews","Reviews"],["/contact","Contact"]];

export function Shell({children}: {children:React.ReactNode}) {
  const pathname = usePathname(); const router = useRouter();
  const [menu, setMenu] = useState(false); const curtain = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null); const navigating = useRef(false);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis:Lenis | undefined;
    const tick = (t:number) => lenis?.raf(t*1000);
    const configure = () => {
      gsap.ticker.remove(tick); lenis?.destroy(); lenis=undefined;
      if(media.matches)return;
      lenis = new Lenis({ duration:1.12, smoothWheel:true, anchors:true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
    };
    // Chapter jumps share Lenis's target, so an in-flight wheel gesture cannot
    // pull the camera back to the previous scroll position after the click.
    const scrollTo = (event:Event) => {
      const {target,immediate=false}=(event as CustomEvent<{target:number|HTMLElement;immediate?:boolean}>).detail;
      if(typeof target!=="number" && !(target instanceof HTMLElement))return;
      if(typeof target==="number" && !Number.isFinite(target))return;
      if(lenis)lenis.scrollTo(target,{duration:1.15,immediate,force:true,offset:typeof target==="number"?0:-92});
      else if(typeof target==="number")window.scrollTo(0,target);
      else target.scrollIntoView({block:"start"});
    };
    configure();
    media.addEventListener("change",configure);
    window.addEventListener("cefabex:scroll-to",scrollTo);
    return () => { media.removeEventListener("change",configure);window.removeEventListener("cefabex:scroll-to",scrollTo);gsap.ticker.remove(tick);lenis?.destroy(); };
  }, []);
  useEffect(() => {
    const handler = (event:Event) => {
      if (navigating.current) return;
      const href = (event as CustomEvent<string>).detail;
      setMenu(false);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
      navigating.current = true;
      gsap.set(curtain.current,{yPercent:100,visibility:"visible"});
      gsap.to(curtain.current,{yPercent:0,duration:.55,ease:"power4.inOut",onComplete:() => {
        router.push(href);
        fallback.current=setTimeout(() => { navigating.current=false;gsap.to(curtain.current,{yPercent:-100,duration:.5}); },4500);
      }});
    };
    window.addEventListener("cefabex:navigate",handler);
    return () => {window.removeEventListener("cefabex:navigate",handler);if(fallback.current)clearTimeout(fallback.current);};
  },[router]);
  useEffect(() => {
    if(fallback.current) clearTimeout(fallback.current);
    navigating.current=false;
    if(window.location.hash){requestAnimationFrame(()=>{const target=document.getElementById(decodeURIComponent(window.location.hash.slice(1)));if(target)window.dispatchEvent(new CustomEvent("cefabex:scroll-to",{detail:{target,immediate:true}}));});}
    else window.dispatchEvent(new CustomEvent("cefabex:scroll-to",{detail:{target:0,immediate:true}}));
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx=gsap.context(() => {
      if(curtain.current && !reduced)gsap.to(curtain.current,{yPercent:-100,duration:.65,ease:"power4.inOut"});
      if(reduced)return;
      gsap.fromTo(".hero-animate",{y:70,opacity:0},{y:0,opacity:1,duration:1.15,stagger:.09,ease:"power3.out",delay:.12});
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(el => {
        gsap.fromTo(el,{y:40,opacity:0},{y:0,opacity:1,duration:.9,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 94%",once:true}});
      });
      gsap.utils.toArray<HTMLElement>(".word-reveal").forEach(el => {
        gsap.fromTo(el.querySelectorAll("span"),{opacity:.22},{opacity:1,stagger:.08,ease:"none",scrollTrigger:{trigger:el,start:"top 85%",end:"bottom 55%",scrub:1}});
      });
      requestAnimationFrame(()=>ScrollTrigger.refresh());
    }, content);
    return ()=>ctx.revert();
  },[pathname]);
  useEffect(() => {
    const dialog=menuDialog.current;
    if(menu && dialog && !dialog.open)dialog.showModal();
    else dialog?.close();
    if(!menu||!dialog)return;
    const ctx=gsap.context(()=>gsap.fromTo(".menu-link",{y:24,opacity:0},{y:0,opacity:1,duration:.5,stagger:.045}),dialog);
    return ()=>ctx.revert();
  },[menu]);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <RouteLink href="/" className="brand" aria-label="Cefabex Innovations home"><img src="/media/logo.webp" alt="Cefabex Innovations" width={112} height={75}/></RouteLink>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.slice(1,4).map(([href,label])=><RouteLink key={href} href={href} className={pathname===href?"active":""}>{label}</RouteLink>)}</nav>
      <div className="header-actions"><RouteLink href="/inquiry" className="header-cta">Start a project <IconArrowUpRight size={16}/></RouteLink><button className="menu-toggle" onClick={()=>setMenu(true)} aria-label="Open all pages" aria-expanded={menu} aria-controls="navigation-menu"><span>Menu</span><IconMenu2 size={23}/></button></div>
    </header>
    <dialog ref={menuDialog} id="navigation-menu" className="navigation-menu" onCancel={()=>setMenu(false)} data-lenis-prevent>
      <div className="menu-top"><img src="/media/logo.webp" alt="Cefabex Innovations" width={112} height={75}/><button className="icon-button" onClick={()=>setMenu(false)} aria-label="Close navigation"><IconX/></button></div>
      <nav aria-label="All pages">{links.map(([href,label],i)=><RouteLink key={href} href={href} className="menu-link" onClick={()=>setMenu(false)}><span className="menu-number">0{i+1}</span>{label}<IconArrowUpRight/></RouteLink>)}</nav>
      <div className="menu-bottom"><RouteLink href="/inquiry" className="button navy">Start a project <IconArrowUpRight/></RouteLink><Socials/></div>
    </dialog>
    <div ref={content} className="page-content">{children}</div>
    <footer className="site-footer">
      <div className="footer-invite"><p>Have an idea worth building?</p><RouteLink href="/inquiry"><span>Let’s build</span><em>what’s next.</em><IconArrowUpRight aria-hidden="true"/></RouteLink></div>
      <div className="footer-main"><div><img src="/media/logo.webp" width={140} height={93} alt="Cefabex Innovations"/><p>BUILD. REACH. GROW.</p></div><nav aria-label="Footer navigation">{links.map(([href,label])=><RouteLink href={href} key={href}>{label}</RouteLink>)}</nav><div className="footer-contact"><a href={socials.email}>cefabex.cfb@gmail.com</a><a href={socials.phone}>+91 9600371766</a><Socials/></div></div>
      <div className="footer-base"><span>© {new Date().getFullYear()} Cefabex Innovations</span><div><RouteLink href="/privacy">Privacy</RouteLink><RouteLink href="/admin">Admin</RouteLink></div></div>
    </footer>
    <div ref={curtain} className="route-curtain" aria-hidden="true"><span>Cefabex<em>Innovations.</em></span></div>
  </>;
}

export function PageHeading({label,title,italic,description}: {label?:string;title:string;italic?:string;description?:string}) {
  return <div className="page-heading"><div className="hero-animate crumb"><RouteLink href="/">Home</RouteLink><span>/</span><span>{label||title}</span></div><h1 className="hero-animate">{title} {italic&&<em>{italic}</em>}</h1>{description&&<p className="hero-animate">{description}</p>}</div>;
}
export function TextReveal({children}: {children:string}) {return <p className="word-reveal">{children.split(" ").map((word,i)=><span key={i}>{word} </span>)}</p>;}
