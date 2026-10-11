"use client";
export default function Error({reset}:{reset:()=>void}){return <main id="main"><section className="not-found"><h2>We couldn’t load this page.</h2><p>Please try again, or contact Cefabex on WhatsApp.</p><button className="button navy" onClick={reset}>Try again</button></section></main>;}
