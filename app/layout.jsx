import { Inter } from "next/font/google";
import "./globals.css";
import "./more.css";
import { TopBar } from "@/components/etc/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BRSK",
  description: "Buy BRSK now!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <body className={inter.className}>
            <main className="flex-grow">
                <div className="absolute w-full h-full left-0 top-0 flex items-center justify-center select-none blur-[1px]">
                    <h1 className="text-[140pt] font-black opacity-50 shadow-xl px-10 tracking-tighter">BRR____SK</h1>
                </div>
                {children}
            </main>
        </body>
    </html>
  );
}
