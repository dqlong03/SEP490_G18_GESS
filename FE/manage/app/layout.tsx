'use client';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { isLayoutPage } from '@/utils/noLayoutPaths';
import { usePathname } from 'next/navigation';
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeaderFooter = !isLayoutPage(pathname);
  return (
    <html lang="en">
       <head>
          {/* Import Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
            rel="stylesheet"
          />
          </head>
      <body>
        <GoogleOAuthProvider clientId="542203501328-vsl3a9mr7pjmj9sro5tuc38673t289ae.apps.googleusercontent.com">
        <AuthProvider>
          {showHeaderFooter && <Header />}
          <main className="min-h-screen">{children}</main>
          {showHeaderFooter && <Footer />}
        </AuthProvider>
         </GoogleOAuthProvider>
      </body>
    </html>
  );
}