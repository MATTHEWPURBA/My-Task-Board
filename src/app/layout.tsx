import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Task Board',
  description: 'A simple task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-10 min-h-screen`}>
        <header className="bg-blue-500 text-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">My Task Board</h1>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}