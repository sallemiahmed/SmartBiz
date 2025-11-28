import { Language } from '../types';

export const loadTranslations = async (lang: Language): Promise<Record<string, string>> => {
  try {
    const response = await fetch(`/languages/${lang}.xml`);
    if (!response.ok) {
      throw new Error(`Failed to load translation file for ${lang}`);
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    
    const resources: Record<string, string> = {};
    const strings = xmlDoc.getElementsByTagName("string");
    
    for (let i = 0; i < strings.length; i++) {
      const key = strings[i].getAttribute("name");
      const value = strings[i].textContent;
      if (key && value) {
        resources[key] = value;
      }
    }
    
    return resources;
  } catch (error) {
    console.error("Error loading translations:", error);
    return {};
  }
};