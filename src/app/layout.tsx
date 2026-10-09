import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'What Did I Miss? | Local-First AI Chat Briefing Engine',
  description:
    'Autonomous client-side chat summarization and prioritization engine built for the ProtocolX Hackathon by PRANAAM. 100% in-browser WASM processing.',
  authors: [{ name: 'PRANAAM' }],
  keywords: [
    'ProtocolX Hackathon',
    'Local AI',
    'In-Browser Summarization',
    'What Did I Miss',
    'Transformers.js',
    'PRANAAM',
    'WebAssembly NLP',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
