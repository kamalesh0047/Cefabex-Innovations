import { ProjectPage } from "@/components/Pages";
import { projects } from "@/lib/cefabex";
import { notFound } from "next/navigation";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=projects.find(p=>p.slug===slug);return {title:p?.name||"Project not found"};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!projects.some(p=>p.slug===slug))notFound();return <ProjectPage slug={slug}/>;}
