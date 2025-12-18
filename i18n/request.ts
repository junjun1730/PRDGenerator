import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = new Set(["en", "ja", "ko"]);

const resolveLocale = async ({
  locale,
  requestLocale,
}: {
  locale?: string;
  requestLocale: Promise<string | undefined>;
}) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const segmentLocale = await requestLocale;

  const preferred = [locale, cookieLocale, segmentLocale].find(
    (candidate) => candidate && SUPPORTED_LOCALES.has(candidate)
  );

  return (preferred ?? DEFAULT_LOCALE) as "en" | "ja" | "ko";
};

export default getRequestConfig(async (params) => {
  const locale = await resolveLocale(params);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
