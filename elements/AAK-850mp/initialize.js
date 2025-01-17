function(instance, context) {
    const elemId = 'language-' + crypto.randomUUID();
    
    // Append the dropdown to the instance canvas
    $(instance.canvas).append(`<select id="${elemId}"></select>`);
    
    // Helper function to get browser locales
    function getBrowserLocales(options = {}) {
        const defaultOptions = { languageCodeOnly: false };
        const opt = { ...defaultOptions, ...options };
        const browserLocales = navigator.languages || [navigator.language];
        if (!browserLocales) return undefined;
        return [...new Set(browserLocales.map(locale => {
            const trimmedLocale = locale.trim();
            return opt.languageCodeOnly ? trimmedLocale.split(/-|_/)[0] : trimmedLocale;
        }))];
    }
    
    // Get the current language of the browser
    const browserLocales = getBrowserLocales({ languageCodeOnly: true });
    const currLang = browserLocales[0] || 'en';
    
    // Get the language list
    const languageNames = new Intl.DisplayNames([currLang], {
        type: 'language',
        languageDisplay: 'standard'
    });
    const languageCodes = ISO6391.getAllCodes();
    const languageList = languageCodes.map(code => {
        const lang = languageNames.of(code);
        if (lang === code) return null;
        return { text: `${lang.charAt(0).toUpperCase()}${lang.slice(1)}`, value: code };
    }).filter(Boolean);

    // Store the language list in instance data
    instance.data.languageList = languageList;

    // Initialize SlimSelect
    instance.data.select = new SlimSelect({
        select: `#${elemId}`,
        placeholder: 'Select a language',
        data: languageList,
        events: {
            afterChange: (values) => {
                if (values.length > 0) {
                    // Publish the selected language as a state
                    instance.publishState('selected_language', values[0].value);
                    
                    // Trigger the custom event
                    instance.triggerEvent('language_changed');
                }
            }
        }
    });
}
