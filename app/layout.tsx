import "./globals.css";
import { NextIntlClientProvider } from "next-intl";

// ⭐️ 서버 컴포넌트이므로 async 가능
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
