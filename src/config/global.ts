import { GlobalConfig } from '@eui/core';

export const GLOBAL: GlobalConfig = {
    appTitle: 'Security Attribute Provider',
    i18n: {
        i18nService: {
            // EDNEL: Set default language to Spanish
            defaultLanguage: 'es',
            languages: [
                {
                    code: 'en',
                    label: 'English'
                },
                // EDNEL: Main languages of Spain (start)
                {
                    code: 'es',
                    label: 'Spanish'
                },
                {
                    code: 'ca',
                    label: 'Catalan'
                },
                {
                    code: 'va',
                    label: 'Valencian'
                },
                {
                    code: 'gl',
                    label: 'Galician'
                },
                {
                    code: 'eu',
                    label: 'Basque'
                },
                // EDNEL: Main languages of Spain (end)
            ],
        },
        i18nLoader: {
            i18nFolders: [
                'i18n-eui',
                'i18n',
                'i18n-ecl'
            ],
        },
    },
    user: {
        defaultUserPreferences: {
            dashboard: { },
            // EDNEL: Set default language to Spanish.
            lang: 'es',
        },
    },
};
