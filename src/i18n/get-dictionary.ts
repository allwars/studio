import 'server-only';
import type { Locale } from './i18n-config';

const dictionaries = {
  en: () => import('./locales/en.json').then((module) => module.default),
  es: () => import('./locales/es.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    const loader = dictionaries[locale] || dictionaries.es;
    const dict = await loader();
    return { ...dict, lang: locale };
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
