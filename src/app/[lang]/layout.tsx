import { DictionaryProvider } from '@/hooks/use-dictionary';
import { getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/i18n-config';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(params.lang);
  return <DictionaryProvider dictionary={dictionary}>{children}</DictionaryProvider>;
}
