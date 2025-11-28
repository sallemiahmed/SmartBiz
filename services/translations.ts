
import { Language } from '../types';

export const loadTranslations = async (lang: string): Promise<Record<string, string>> => {
  try {
    const response = await fetch(`/languages/${lang}.json`);
    if (!response.ok) {
        throw new Error(`Could not load translations for ${lang}`);
    }
    const translations = await response.json();
    return translations;
  } catch (error) {
    console.error("Translation load error:", error);
    return {};
  }
};
