import "./globals.css";
import Layout from "@/components/Layout";

export const metadata = {
  title: "School Portal | Official Web Portal",
  description: "Quality Education for All - CBSE Affiliated Senior Secondary School",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#090D1A]" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#090D1A] text-slate-100 antialiased selection:bg-indigo-600 selection:text-white" suppressHydrationWarning>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
