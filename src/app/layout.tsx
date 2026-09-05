import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Moment Nepal | Professional Photography Studio",
  description:
    "Professional photography studio in Pokhara, Nepal specializing in wedding and indoor portrait photography. We transform moments into timeless memories.",
  keywords: [
    "Wedding Photography Nepal",
    "Photography Pokhara",
    "Indoor Photography",
    "Portrait Photography",
    "eSewa Payment",
    "Khalti Payment",
  ],
  authors: [{ name: "Wedding Moment Nepal" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Wedding Moment Nepal | Professional Photography",
    description:
      "Capture your precious moments with Wedding Moment Nepal, specializing in wedding and indoor portrait photography in Pokhara.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
