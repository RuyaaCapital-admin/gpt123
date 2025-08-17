export const metadata = { title: 'Liirat Assistant Starter' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', background: '#0b0f14', color: '#e6e9ef' }}>
        {children}
      </body>
    </html>
  );
}
