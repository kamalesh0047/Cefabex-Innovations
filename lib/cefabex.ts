export const socials = {
  whatsapp: "https://wa.me/919600371766",
  instagram: "https://www.instagram.com/cefabex.cfb/",
  youtube: "https://youtube.com/@cefabexinnovation",
  linkedin: "https://www.linkedin.com/in/fathima-rahna-r-b6759b30b/",
  email: "mailto:cefabex.cfb@gmail.com",
  phone: "tel:+919600371766",
};

export const services = [
  { name: "Website Development", group: "Digital", description: "Business websites, landing pages and custom web platforms built around your goals.", items: ["Business websites", "Landing pages", "Custom web platforms"] },
  { name: "App Development", group: "Digital", description: "Custom mobile and application solutions that turn a useful idea into an everyday tool.", items: ["Custom applications", "Mobile experiences", "Business workflows"] },
  { name: "AI & IoT Projects", group: "Innovation", description: "Artificial intelligence, connected devices and automation for practical challenges.", items: ["AI project development", "Connected devices", "Automation concepts"] },
  { name: "ATS Resume Services", group: "Creative", description: "Clear, ATS-friendly resumes and professional career documents.", items: ["ATS-friendly formatting", "Resume writing", "Professional documents"] },
  { name: "CAD & Automation Designs", group: "Innovation", description: "Engineering design, CAD concepts and automation planning.", items: ["CAD concepts", "Engineering design", "Automation planning"] },
  { name: "Social Media Management", group: "Growth", description: "Social planning, content and brand management for a consistent online presence.", items: ["Content planning", "Social media content", "Brand management"] },
  { name: "Content Writing", group: "Creative", description: "Scripts, captions, promotions and business content with a clear voice.", items: ["Scripts and captions", "Promotional writing", "Business content"] },
  { name: "Digital Marketing", group: "Growth", description: "Digital growth and online marketing solutions shaped around your business.", items: ["Campaign planning", "Online marketing", "Digital growth"] },
  { name: "SEO Optimization", group: "Growth", description: "Search visibility and website optimization that help people find your business.", items: ["Website optimization", "Search visibility", "Content structure"] },
  { name: "Customized Invitation Websites", group: "Creative", description: "Personal, interactive wedding and birthday invitation websites.", items: ["Wedding invitations", "Birthday invitations", "Interactive experiences"] },
];

export const moments = [
  { src: "/media/moment-02.webp", alt: "The Cefabex founding team seated together", caption: "The people behind the ideas" },
  { src: "/media/moment-01.webp", alt: "Cefabex team wearing life jackets during coastal fieldwork", caption: "Ideas meet the real world" },
  { src: "/media/moment-04.webp", alt: "Team members on a boat during coastal exploration", caption: "Learning in the field" },
  { src: "/media/moment-06.webp", alt: "Three team members at an innovation summit", caption: "Sharing our work" },
  { src: "/media/moment-09.webp", alt: "Cefabex team presenting a prototype at an exhibition", caption: "From concept to prototype" },
  { src: "/media/moment-10.webp", alt: "Team presenting a project on a display", caption: "Explaining the thinking" },
  { src: "/media/moment-07.webp", alt: "Team taking part in a certificate presentation", caption: "Moments of progress" },
  { src: "/media/moment-11.webp", alt: "Team members photographed outdoors at an event", caption: "Building together" },
  { src: "/media/moment-12.webp", alt: "Team and collaborators at an exhibition", caption: "New conversations" },
  { src: "/media/moment-03.webp", alt: "Cefabex Innovations badge held in a hand", caption: "Our identity, made tangible" },
  { src: "/media/moment-05.webp", alt: "An exhibition booth photographed by the Cefabex team", caption: "Ideas on display" },
  { src: "/media/moment-08.webp", alt: "An event participant pass supplied by the team", caption: "Taking part" },
];

export const projects = [
  { slug: "smart-sea-belt", name: "Smart Sea Belt", category: "AI / IoT / Coastal Safety Innovation", description: "LoRa-based proactive coastal navigation and boundary awareness.", domain: "AI / IoT / Coastal Safety", status: "Technology concept · development journey", features: ["Wearable devices", "Boat-side unit", "Base unit", "LoRa-based communication", "Navigation and boundary awareness", "Early warning and alerts"], images: [moments[1], moments[2], moments[4], moments[5]], flagship: true },
  { slug: "fida-clothing", name: "FIDA Clothing & Essentials", category: "Website Development", description: "A catalogue and business enquiry website for clothing and essentials.", domain: "Website Development", status: "Individual delivery status not supplied", features: ["Product catalogue", "Business enquiry"], images: [], flagship: false },
  { slug: "renjith-bakes", name: "Renjith Bakes", category: "Digital Project", description: "A selected Cefabex digital project. Further project details are awaiting confirmation.", domain: "Digital Project", status: "Individual delivery status not supplied", features: [], images: [], flagship: false },
  { slug: "queue-free-college", name: "Queue-Free College", category: "Technology Project", description: "A selected Cefabex technology project. Further project details are awaiting confirmation.", domain: "Technology Project", status: "Individual delivery status not supplied", features: [], images: [], flagship: false },
];

export const team = [
  { name: "Fathima Rahna R", title: "Managing Director & CEO", position: "Founder", focus: "Business Development & Operations" },
  { name: "Inbha Benisha J", title: "Chief Brand Officer", position: "Co-Founder", focus: "Innovation & Project Development" },
  { name: "Celano S", title: "Chief Growth Officer", position: "Co-Founder", focus: "Innovation & Project Development" },
];

export type Moment = typeof moments[number];
export type EventRecord = { id: string; title: string; date: string; description: string; image: string; published: boolean; archived: boolean };
export type ReviewRecord = { id: string; name: string; company: string; service: string; quote: string; rating: number; published: boolean; archived: boolean; consentConfirmed: boolean };
export type InquiryRecord = { id: string; name: string; email: string; phone: string; company: string; service: string; message: string; status: string; createdAt: string };
