import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI PRD Generator | 프로젝트 기획서 자동 생성',
  description: '아이디어를 빠르게 문서화하는 AI 기반 PRD 생성 서비스',
  keywords: ['PRD', '기획서', 'AI', '프로젝트 문서', '자동 생성'],
  authors: [{ name: 'PRD Generator Team' }],
  openGraph: {
    title: 'AI PRD Generator',
    description: '아이디어를 빠르게 문서화하는 AI 기반 PRD 생성 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
