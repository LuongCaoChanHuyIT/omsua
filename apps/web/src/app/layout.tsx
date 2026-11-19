import type { Metadata } from 'next';
import {
  Be_Vietnam_Pro,
  Dancing_Script,
  Fraunces,
  Lora,
  Shantell_Sans,
} from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin', 'vietnamese'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-fraunces',
});

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

const dancingScript = Dancing_Script({
  subsets: ['latin', 'vietnamese'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-dancing-script',
});

const shantellSans = Shantell_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-shantell-sans',
});

const fontVariableClasses = [
  fraunces.variable,
  lora.variable,
  beVietnamPro.variable,
  dancingScript.variable,
  shantellSans.variable,
].join(' ');

export const metadata: Metadata = {
  title: 'Ốm Sữa — Trà sữa của người Đà Lạt • Since 2017',
  description:
    'Tiên phong nấu trà từ bông Atiso xanh tươi Đà Lạt, sữa tươi thanh trùng, trân châu nhà làm & bánh tráng snack Đà Lạt từ 2017.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={fontVariableClasses}>
      <body className="min-h-screen bg-canvas-cream font-sans text-espresso antialiased">
        {children}
      </body>
    </html>
  );
}
