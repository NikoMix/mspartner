import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Microsoft Partner — Getting Started Resources',
  description:
    'A curated hub of starter links and helpful resources for Microsoft Partners: specializations, funding, skilling, and community.',
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('pr-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
