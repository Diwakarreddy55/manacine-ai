import "./globals.css";

export const metadata = {
  title: "ManaCine AI",
  description: "Create Telugu AI movies from prompts"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="te"><body>{children}</body></html>;
}
