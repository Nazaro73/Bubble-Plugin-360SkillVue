function(instance, context) {
	const elemId = 'language-' + crypto.randomUUID()

	console.log(elemId)
    
    $(instance.canvas).append(`<select id="${elemId}"></select>`)
    
    function getBrowserLocales(options = {}) {
      const defaultOptions = {
        languageCodeOnly: false,
      };
      const opt = {
        ...defaultOptions,
        ...options,
      };
      const browserLocales =
        navigator.languages === undefined
          ? [navigator.language]
          : navigator.languages;
      if (!browserLocales) {
        return undefined;
      }
      const locales = browserLocales.map(locale => {
        const trimmedLocale = locale.trim();
        return opt.languageCodeOnly
          ? trimmedLocale.split(/-|_/)[0]
          : trimmedLocale;
      });
        
      return [...new Set(locales)]
    }
    
    const browserLocales = getBrowserLocales({languageCodeOnly: true})
    
    const currLang = browserLocales[0] || 'en'
    
    console.log(browserLocales, currLang)

    const languageNames = new Intl.DisplayNames([currLang], {
      type: 'language',
      languageDisplay: 'standard'
    });
    const languageCodes = ISO6391.getAllCodes()
    const languageList = languageCodes.map(code => {
        let lang = languageNames.of(code)
        if (lang === code) { return null }
        let item = { text: String(lang).charAt(0).toUpperCase() + String(lang).slice(1), value: code }
        return item
    }).filter(Boolean)
    
    console.log(languageList)

    instance.data.languageList = languageList
    instance.data.select = new SlimSelect({
        select: `#${elemId}`,
        placeholder: 'Select a language',
        data: languageList,
        events: {
        	afterChange: (value) => {
                instance.publishState('selected_language', value.value)
            	instance.triggerEvent('language_changed')
            }
        }
    })
}