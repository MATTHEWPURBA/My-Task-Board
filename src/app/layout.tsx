import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Task Board | Simple Task Management',
  description: 'A simple and intuitive task management application with drag-and-drop functionality',
  // keywords: 'task management, to-do app, project management, productivity',
  // viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  // themeColor: '#ffffff',
  // authors: [{ name: 'Task Board Team' }],
  // icons: {
  //   icon: '/favicon.ico',
  // },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl mr-2">📋</span>
              <h1 className="text-xl font-semibold text-gray-900">Task Board</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-900 font-medium rounded-full hover:bg-gray-100 px-4 py-2 transition-colors"
              >
                📝 Add New Board
              </Link>
              <Link 
                href="https://github.com/MATTHEWPURBA/My-Task-Board" 
                target="_blank"
                rel="noopener noreferrer" 
                className="text-gray-500 hover:text-gray-900 hidden sm:block"
              >
                <span className="text-xl">📚</span>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="pb-20">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-100 py-4 text-center text-gray-500 text-sm mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <p>© {new Date().getFullYear()} My Task Board. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}