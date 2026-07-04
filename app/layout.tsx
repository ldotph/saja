import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "САЖА — афиши локальных концертов";
const siteDescription =
  "Актуальные афиши локальных концертов на ближайший месяц: города, билеты, встречи, маршрут до клуба и заявка на размещение.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
