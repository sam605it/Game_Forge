import "./globals.css";

export const metadata = {
  title: "GameForge",
  description: "AI-powered mini game creator",
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
