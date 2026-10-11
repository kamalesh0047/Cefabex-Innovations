"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconArrowUpRight, IconRadio, IconShip, IconDeviceWatch, IconAlertTriangle } from "@tabler/icons-react";
import { RouteLink } from "./Shell";

const chapters=[
 {title:"Awareness starts on shore.",text:"A base unit forms part of the concept’s communication system, connecting coastal awareness with the boat-side unit.",icon:IconRadio},
 {title:"A connected boat-side system.",text:"LoRa-based communication is explored to support the exchange of navigation and boundary-awareness information.",icon:IconShip},
 {title:"Bring awareness closer.",text:"Wearable devices are part of the concept, bringing alerts and navigation awareness closer to the person.",icon:IconDeviceWatch},
 {title:"Warn before a boundary.",text:"The proposed alert workflow aims to provide early awareness when approaching a defined maritime boundary. It does not guarantee prevention or rescue.",icon:IconAlertTriangle},
];
function SeaScene({phase}: {phase:number}) {
 const host=useRef<HTMLDivElement>(null);const labels=useRef<HTMLDivElement>(null);const phaseRef=useRef(phase);
 const [failed,setFailed]=useState(false);const [ready,setReady]=useState(false);
 useEffect(()=>{phaseRef.current=phase;},[phase]);
 useEffect(()=>{
  let dead=false;let cleanup=()=>{};
  const boot=async()=>{
   const T=await import("three");if(dead||!host.current)return;
   let renderer:InstanceType<typeof T.WebGLRenderer>;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}catch{setFailed(true);return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;host.current.appendChild(renderer.domElement);renderer.domElement.setAttribute("aria-hidden","true");
   const scene=new T.Scene();const camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(10,11,13);camera.lookAt(0,0,0);
   scene.add(new T.HemisphereLight(0xd8eaff,0x16406b,3));const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(2,8,4);scene.add(sun);
   const world=new T.Group();scene.add(world);
   const waterMat=new T.ShaderMaterial({transparent:true,uniforms:{uTime:{value:0}},vertexShader:`uniform float uTime;varying float vH;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.8+uTime*.7)*.08+cos(p.y*1.2+uTime*.5)*.055;vH=p.z;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying float vH;varying vec2 vUv;void main(){float edge=smoothstep(.0,.17,vUv.x)*smoothstep(.0,.17,vUv.y)*smoothstep(1.,.83,vUv.x)*smoothstep(1.,.83,vUv.y);vec3 c=mix(vec3(.35,.62,.83),vec3(.79,.90,.98),vH*2.+.55);gl_FragColor=vec4(c,edge*.88);}`});
   const water=new T.Mesh(new T.PlaneGeometry(18,13,90,60),waterMat);water.rotation.x=-Math.PI/2;water.position.y=-.08;world.add(water);
   const mat=(color:number,metalness=0,roughness=.5)=>new T.MeshStandardMaterial({color,metalness,roughness});
   const white=mat(0xf6f8fc);const navy=mat(0x132b4c);const blue=mat(0x4287c4);const silver=mat(0x849fb6,.7,.3);
   const base=new T.Group();base.position.set(-5,.1,-2.6);world.add(base);
   const platform=new T.Mesh(new T.CylinderGeometry(1.25,1.35,.26,32),white);base.add(platform);
   const tower=new T.Mesh(new T.CylinderGeometry(.06,.09,2.8,12),silver);tower.position.y=1.45;base.add(tower);
   const baseBox=new T.Mesh(new T.BoxGeometry(.62,.65,.5),navy);baseBox.position.set(0,.54,0);base.add(baseBox);
   [0,1,2].forEach(i=>{const cross=new T.Mesh(new T.BoxGeometry(1.1-i*.22,.045,.045),blue);cross.position.set(0,1.8+i*.3,0);base.add(cross);});
   const boat=new T.Group();boat.position.set(-1,.25,.9);boat.rotation.y=.3;world.add(boat);
   const shape=new T.Shape();shape.moveTo(-.57,-1.25);shape.lineTo(.57,-1.25);shape.lineTo(.67,.7);shape.quadraticCurveTo(.1,1.65,0,1.8);shape.quadraticCurveTo(-.1,1.65,-.67,.7);shape.lineTo(-.57,-1.25);
   const hull=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.42,bevelEnabled:true,bevelSize:.09,bevelThickness:.08,bevelSegments:3,steps:1}),navy);hull.rotation.x=Math.PI/2;hull.position.y=.35;boat.add(hull);
   const deck=new T.Mesh(new T.BoxGeometry(1.05,.09,2.1),white);deck.position.set(0,.42,-.1);boat.add(deck);
   const cabin=new T.Mesh(new T.BoxGeometry(.82,.75,.85),white);cabin.position.set(0,.85,-.2);boat.add(cabin);
   const windowMesh=new T.Mesh(new T.BoxGeometry(.84,.32,.87),mat(0x397396,.5,.22));windowMesh.position.set(0,.99,-.2);boat.add(windowMesh);
   const roof=new T.Mesh(new T.BoxGeometry(1,.09,1.05),white);roof.position.set(0,1.28,-.2);boat.add(roof);
   const antenna=new T.Mesh(new T.CylinderGeometry(.025,.035,.7,10),silver);antenna.position.set(.25,1.6,-.4);boat.add(antenna);
   const indicator=new T.Mesh(new T.SphereGeometry(.075,16,16),new T.MeshStandardMaterial({color:0x3b91cf,emissive:0x2a6cc0,emissiveIntensity:.8}));indicator.position.set(.25,1.98,-.4);boat.add(indicator);
   const wearable=new T.Group();wearable.position.set(2.1,.55,3.5);world.add(wearable);
   const band=new T.Mesh(new T.TorusGeometry(.41,.11,12,32),navy);band.rotation.x=Math.PI/2;wearable.add(band);
   const face=new T.Mesh(new T.BoxGeometry(.6,.2,.69),silver);face.position.y=.38;wearable.add(face);
   const watchScreen=new T.Mesh(new T.BoxGeometry(.49,.03,.56),blue);watchScreen.position.y=.5;wearable.add(watchScreen);
   const boundary=new T.Group();world.add(boundary);
   const boundaryMat=new T.LineDashedMaterial({color:0xb67740,dashSize:.35,gapSize:.2,transparent:true,opacity:.7});
   const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(4.7,.08,-5),new T.Vector3(4.7,.08,5)]),boundaryMat);line.computeLineDistances();boundary.add(line);
   const signalMaterial=new T.MeshBasicMaterial({color:0x397fc0,transparent:true,opacity:.45});
   const signals=[0,1,2].map(()=>{const r=new T.Mesh(new T.TorusGeometry(1,.012,8,64),signalMaterial.clone());r.rotation.x=-Math.PI/2;r.position.copy(base.position);r.position.y=.13;world.add(r);return r;});
   const linkMat=new T.LineDashedMaterial({color:0x366fb3,dashSize:.15,gapSize:.13,transparent:true,opacity:.8});
   const linkGeometry=new T.BufferGeometry();const link=new T.Line(linkGeometry,linkMat);world.add(link);
   const resize=()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
   const ro=new ResizeObserver(resize);ro.observe(host.current);resize();let visible=true;const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});io.observe(host.current);
   const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;const clock=new T.Clock();let frame=0;
   const draw=()=>{if(dead)return;frame=requestAnimationFrame(draw);if(!visible||document.hidden)return;
    const time=reduced?0:clock.getElapsedTime();const p=phaseRef.current;waterMat.uniforms.uTime.value=time;
    const target=[-1,0,1.2,3.7][p];if(reduced)boat.position.x=target;else boat.position.x+=(target-boat.position.x)*.035;boat.position.y=.25+(reduced?0:Math.sin(time*1.2)*.045);boat.rotation.z=reduced?0:Math.sin(time)*.018;
    signals.forEach((r,i)=>{const s=(time*.45+i/3)%1;r.visible=p>=1;r.scale.setScalar(.2+s*4.5);(r.material as InstanceType<typeof T.MeshBasicMaterial>).opacity=(1-s)*.35;});
    link.visible=p>=1;linkGeometry.setFromPoints([new T.Vector3(-5,.7,-2.6),new T.Vector3(boat.position.x,1.2,.9)]);link.computeLineDistances();
    wearable.scale.setScalar(p>=2?1:.72);indicator.material.color.setHex(p===3?0xc77a37:0x3b91cf);indicator.material.emissive.setHex(p===3?0xa8592c:0x2a6cc0);
    if(labels.current){const pts=[base.position.clone().add(new T.Vector3(0,3,0)),boat.position.clone().add(new T.Vector3(0,2.3,0)),wearable.position.clone().add(new T.Vector3(0,.9,0)),new T.Vector3(4.7,.5,-3)];
     pts.forEach((point,i)=>{point.project(camera);const el=labels.current!.children[i] as HTMLElement;el.style.transform=`translate(${(point.x*.5+.5)*host.current!.clientWidth}px,${(-point.y*.5+.5)*host.current!.clientHeight}px) translate(-50%,-50%)`;});}
    renderer.render(scene,camera);
   };draw();setReady(true);
   const lost=()=>setFailed(true);renderer.domElement.addEventListener("webglcontextlost",lost);
   cleanup=()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();scene.traverse(obj=>{if(obj instanceof T.Mesh||obj instanceof T.Line){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  };const start=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start.disconnect();boot().catch(()=>{if(!dead)setFailed(true);});}},{rootMargin:"300px"});if(host.current)start.observe(host.current);return()=>{dead=true;start.disconnect();cleanup();};
 },[]);
 return <div className="sea-visual"><div ref={host} className="sea-canvas"/><div ref={labels} className={`sea-labels ${!ready||failed?"hidden":""}`} aria-hidden="true"><span>Base unit</span><span>Boat unit</span><span>Wearable</span><span>Defined boundary</span></div>{(!ready||failed)&&<div className="sea-fallback"><IconRadio size={40}/><p>Base unit → LoRa communication → Boat unit & wearable → Boundary awareness → Early alert</p></div>}<div className="sea-legend"><span>Conceptual system view</span><span>Illustrative, not a live navigation tool</span></div></div>;
}

export function SeaJourney({showLink=true}:{showLink?:boolean}) {
 const host=useRef<HTMLDivElement>(null);const [phase,setPhase]=useState(0);
 useEffect(()=>{if(!host.current)return;gsap.registerPlugin(ScrollTrigger);const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>(".sea-chapter").forEach((el,i)=>ScrollTrigger.create({trigger:el,start:"top 60%",end:"bottom 60%",onEnter:()=>setPhase(i),onEnterBack:()=>setPhase(i)}));},host);return()=>ctx.revert();},[]);
 return <section ref={host} className="sea-journey"><div className="section-heading reveal"><p className="eyebrow">Flagship innovation</p><h2>Smart Sea <em>Belt.</em></h2><p>A proactive technology concept designed to improve maritime boundary awareness and support safer coastal navigation.</p></div><div className="sea-layout"><div className="sea-sticky"><SeaScene phase={phase}/><div className="sea-progress" aria-label="System chapters">{chapters.map((c,i)=><button key={c.title} className={phase===i?"active":""} onClick={()=>document.getElementById(`sea-${i}`)?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"center"})} aria-label={c.title} aria-current={phase===i?"step":undefined}>0{i+1}</button>)}</div></div><div className="sea-chapters">{chapters.map((c,i)=><div id={`sea-${i}`} key={c.title} className={`sea-chapter ${phase===i?"active":""}`}><c.icon size={30}/><h3>{c.title}</h3><p>{c.text}</p></div>)}</div></div>{showLink&&<RouteLink href="/projects/smart-sea-belt" className="button navy">Explore the development journey <IconArrowUpRight/></RouteLink>}</section>;
}
