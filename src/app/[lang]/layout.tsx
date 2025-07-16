import type { Dictionary } from '@/i18n/get-dictionary';
import { getDictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/i18n-config';
import { DictionaryProvider } from '@/hooks/use-dictionary';
import AppLayout from '@/components/app-layout';


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(params.lang);
  return (
      <DictionaryProvider dictionary={dictionary}>
        <AppLayout>{children}</AppLayout>
      </DictionaryProvider>
  );
}