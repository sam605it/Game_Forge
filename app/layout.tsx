import "./globals.css";

export const metadata = {
  title: "GameForge",
  description: "AI-powered game creation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
