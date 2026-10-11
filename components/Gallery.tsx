"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconArrowLeft, IconArrowRight, IconArrowsMaximize, IconX } from "@tabler/icons-react";
import { moments, type Moment } from "@/lib/cefabex";

export function Lightbox({images,index,onClose}: {images:Moment[];index:number;onClose:()=>void}) {
  const [current,setCurrent]=useState(index);const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();return ()=>dialog.current?.close();},[]);
  return <dialog className="lightbox" ref={dialog} onCancel={onClose} data-lenis-prevent>
    <button className="lightbox-close icon-button" onClick={onClose} aria-label="Close photograph"><IconX/></button>
    <div className="lightbox-photo"><img src={images[current].src} alt={images[current].alt}/></div>
    <div className="lightbox-controls"><button className="icon-button" aria-label="Previous photograph" onClick={()=>setCurrent((current-1+images.length)%images.length)}><IconArrowLeft/></button><p>{images[current].caption}<span>{current+1} / {images.length}</span></p><button className="icon-button" aria-label="Next photograph" onClick={()=>setCurrent((current+1)%images.length)}><IconArrowRight/></button></div>
  </dialog>;
}
export function Photo({image,className="",priority=false}: {image:Moment;className?:string;priority?:boolean}) {
 const [open,setOpen]=useState(false);
 return <><button className={`photo ${className}`} onClick={()=>setOpen(true)} aria-label={`Enlarge: ${image.alt}`}><img src={image.src} alt={image.alt} loading={priority?"eager":"lazy"} decoding="async"/><span className="photo-enlarge"><IconArrowsMaximize size={18}/></span></button>{open&&<Lightbox images={[image]} index={0} onClose={()=>setOpen(false)}/>}</>;
}

export function OrbitGallery({compact=false}: {compact?:boolean}) {
  const host=useRef<HTMLDivElement>(null);const canvasHost=useRef<HTMLDivElement>(null);
  const rotation=useRef({value:0});const activeRef=useRef(0);const [active,setActive]=useState(0);
  const [ready,setReady]=useState(false);const [fallback,setFallback]=useState(false);const [open,setOpen]=useState<number|null>(null);
  useEffect(()=>{
    let dead=false;let cleanup:()=>void=()=>{};
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setFallback(true);return;}
    const boot=async()=>{
      const THREE=await import("three");if(dead||!canvasHost.current||!host.current)return;
      let renderer:InstanceType<typeof THREE.WebGLRenderer>;
      try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}catch{setFallback(true);return;}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;
      canvasHost.current.appendChild(renderer.domElement);renderer.domElement.setAttribute("aria-hidden","true");
      const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.z=12;
      const group=new THREE.Group();scene.add(group);const meshes:InstanceType<typeof THREE.Mesh>[]=[];
      const loader=new THREE.TextureLoader();
      const textureLoads=moments.map(async(photo,i)=>{
        const texture=await loader.loadAsync(photo.src);if(dead){texture.dispose();return;}
        texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
        const aspect=texture.image.width/texture.image.height;
        const mat=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,uniforms:{uMap:{value:texture},uAspect:{value:aspect},uFrame:{value:1.48}},
          vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader:`uniform sampler2D uMap;uniform float uAspect;uniform float uFrame;varying vec2 vUv;void main(){vec2 p=vUv-.5;vec2 fit=vec2(1.);if(uAspect>uFrame)fit.y=uFrame/uAspect;else fit.x=uAspect/uFrame;vec2 uv=p/fit+.5;vec4 col=vec4(.95,.96,.98,1.);if(all(greaterThanEqual(uv,vec2(0.)))&&all(lessThanEqual(uv,vec2(1.))))col=texture2D(uMap,uv);gl_FragColor=col;#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(";#include",";\n#include")
        });
        const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.32,1.57),mat);mesh.userData.index=i;meshes[i]=mesh;group.add(mesh);
      });
      const raycaster=new THREE.Raycaster();const mouse=new THREE.Vector2();let visible=true;let raf=0;
      const resize=()=>{
        if(!canvasHost.current)return;const {width,height}=canvasHost.current.getBoundingClientRect();
        renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();
        group.scale.setScalar(Math.min(1,width/height*.64));
      };const observer=new ResizeObserver(resize);observer.observe(canvasHost.current);resize();
      const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});visibility.observe(host.current);
      const pointer=(e:PointerEvent)=>{
        const r=renderer.domElement.getBoundingClientRect();mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
      };
      const click=(e:MouseEvent)=>{
        if(Math.abs(e.movementX)+Math.abs(e.movementY)>4)return;
        raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(meshes.filter(Boolean));if(hits[0])setOpen(hits[0].object.userData.index);
      };
      renderer.domElement.addEventListener("pointermove",pointer);renderer.domElement.addEventListener("click",click);
      renderer.domElement.addEventListener("webglcontextlost",()=>setFallback(true),{once:true});
      const render=()=>{
        if(dead)return;raf=requestAnimationFrame(render);if(!visible||document.hidden)return;
        meshes.forEach((mesh,i)=>{const a=i/moments.length*Math.PI*2+rotation.current.value;
          mesh.position.set(Math.sin(a)*5.15,Math.cos(a)*(canvasHost.current!.clientWidth<640?5.2:2.6),Math.cos(a)*-2.05);
          mesh.rotation.set(0,-Math.sin(a)*.5,-Math.sin(a)*.12);
        });
        group.rotation.y+=(mouse.x*.07-group.rotation.y)*.035;renderer.render(scene,camera);
      };render();
      gsap.registerPlugin(ScrollTrigger);
      const trigger=ScrollTrigger.create({trigger:host.current,start:"top bottom",end:"bottom top",onUpdate:self=>{
        if(!gsap.isTweening(rotation.current))rotation.current.value=self.progress*Math.PI*.9-activeRef.current*Math.PI*2/moments.length;
      }});
      cleanup=()=>{cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();trigger.kill();meshes.forEach(mesh=>{mesh.geometry.dispose();const m=mesh.material as InstanceType<typeof THREE.ShaderMaterial>;m.uniforms.uMap.value.dispose();m.dispose();});renderer.dispose();renderer.domElement.remove();};
      await Promise.allSettled(textureLoads);if(!dead)setReady(true);
    };const start=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start.disconnect();boot().catch(()=>{if(!dead)setFallback(true);});}},{rootMargin:"350px"});if(host.current)start.observe(host.current);
    return ()=>{dead=true;start.disconnect();cleanup();};
  },[]);
  const step=(delta:number)=>{const i=(active+delta+moments.length)%moments.length;setActive(i);activeRef.current=i;gsap.to(rotation.current,{value:rotation.current.value-delta*Math.PI*2/moments.length,duration:1.1,ease:"power3.inOut"});};
  return <section ref={host} className={`orbit-section ${compact?"compact":""}`} aria-label="Cefabex photographic journey">
    <div className="orbit-top"><span>Our world, in motion</span><span>Real people. Real work.</span></div>
    <div ref={canvasHost} className={`orbit-canvas ${fallback?"is-fallback":""}`}/>
    {(fallback||!ready)&&<div className={`orbit-fallback ${fallback?"permanent":""}`}><Photo image={moments[active]}/></div>}
    <div className="orbit-statement"><h2>Every idea starts<br/>with <em>people.</em></h2></div>
    <div className="orbit-controls"><button className="icon-button" onClick={()=>step(-1)} aria-label="Rotate photographs left"><IconArrowLeft/></button><button className="gallery-open" onClick={()=>setOpen(active)}>Explore photographs <IconArrowsMaximize size={16}/></button><button className="icon-button" onClick={()=>step(1)} aria-label="Rotate photographs right"><IconArrowRight/></button></div>
    <p className="sr-only" aria-live="polite">Photograph {active+1} of {moments.length}: {moments[active].caption}</p>
    {open!==null&&<Lightbox images={moments} index={open} onClose={()=>setOpen(null)}/>}
  </section>;
}
