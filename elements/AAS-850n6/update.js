function(instance, properties, context) {

  //Do the operation
    const currLang = properties.language || 'fr'

  //Load any data 
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


  //Do the operation

	const lang = languageList.find(l => l.value === properties.langCode)?.text || properties.langCode

    instance.publishState('text', lang)
}