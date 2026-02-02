import "./globals.css";      // REQUIRED
import "../styles/index.css"; // if exists
import "../styles/tailwind.css";
import "../styles/theme.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
