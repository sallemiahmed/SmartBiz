
const loadJson = async (path: string) => {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load JSON from ${path}`, error);
    return {};
  }
};

export const loadTranslations = async (lang: string) => {
  // Use absolute path from root to ensure it works from any route
  const path = `/languages/${lang}.json`;
  try {
    return await loadJson(path);
  } catch (e) {
    console.warn(`Failed to load language ${lang}, falling back to English.`);
    return await loadJson('/languages/en.json');
  }
};
