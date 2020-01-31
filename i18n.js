const NextI18Next = require('next-i18next').default;
// const {localeSubpaths} = require('next/config').default().publicRuntimeConfig;

// const localeSubpathVariations = {
//     none: {},
//     foreign: {
//         en: 'en',
//     },
//     all: {
//         ru: 'ru',
//         en: 'en',
//     },
// };
const i18nInit = new NextI18Next({
    // debug: true,
    // saveMissing: true,
    localePath: typeof window === 'undefined' ? 'public/locales' : 'locales',
    otherLanguages: ['en'],
    defaultLanguage: 'ru',
    // localeSubpaths: localeSubpathVariations[localeSubpaths],
});

module.exports = i18nInit;
