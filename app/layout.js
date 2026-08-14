import "./globals.css";

export const metadata = {
  title: "Mathe-Heft",
  description: "Mathe-Übungs-App für die ganze Familie",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
