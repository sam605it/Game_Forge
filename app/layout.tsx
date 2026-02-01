import "./globals.css";

export const metadata = {
  title: "Gemini Game Forge",
  description: "AI-powered mini game generator",
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
