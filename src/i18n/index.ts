import en from './en';
import zhCn from './zh-cn';

const translations: Record<string, Record<string, string>> = {
	en,
	zh: zhCn,
	'zh-cn': zhCn,
	'zh-tw': zhCn,
	'zh-hans': zhCn,
	'zh-hant': zhCn,
};

function getLocale(): string {
	return (window as any).moment?.locale?.() ?? 'en';
}

function getTranslations(): Record<string, string> {
	const locale = getLocale();
	return translations[locale] ?? translations['en'];
}

export function t(key: string): string {
	return getTranslations()[key] ?? en[key] ?? key;
}
