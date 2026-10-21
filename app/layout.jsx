import './globals.css';

export const metadata = {
  title: 'GrabMart - Belanja Sayur, Buah & Kebutuhan Dapur Segar',
  description: 'Aplikasi belanja kebutuhan grosir & sayuran segar bergaya GrabFood & GrabMart ramah mobile dengan harga terbaik.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#00B14F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-900 min-h-screen text-charcoal">
        {children}
      </body>
    </html>
  );
}
