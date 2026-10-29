import './globals.css';

export const metadata = {
  title: 'Smart Grocery Sentinel - Asisten Belanja Hemat & Pelindung Anggaran Pintar',
  description: 'Aplikasi belanja kebutuhan pasar harian & sembako segar dengan harga akurat, detektor fluktuasi harga, dan budget safety cap.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#065F46',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-900 min-h-screen text-charcoal">
        {children}
      </body>
    </html>
  );
}
