import { Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AddEntryProvider } from "./AddEntrySheet";
import { DataProvider } from "./DataContext";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Ledger",
  description: "Keep a beautiful record.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DataProvider>
          <AddEntryProvider>{children}</AddEntryProvider>
        </DataProvider>
      </body>
    </html>
  );
}
