import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
export const metadata:Metadata={title:{default:"Cefabex Innovations",template:"%s | Cefabex Innovations"},description:"Young startup. Serious work. Practical innovation. Digital solutions, engineering, creative services and the Smart Sea Belt coastal safety concept.",icons:{icon:"/media/logo.webp",shortcut:"/media/logo.webp"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Shell>{children}</Shell></body></html>;}
