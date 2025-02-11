function(instance, properties, context) {
    // Translations: { Langue: String, Texte: String }[]
	let translations = []
    if (properties.translations && properties.translations.length() > 0) {
        translations = properties.translations
            .get(0, properties.translations.length()) // Get all items in the list
            .map(t => ({
                Langue: t.get("langue_text"), // Access the "Langue" field
                Texte: t.get('texte_text')   // Access the "Texte" field
            }));

        // console.log(translations); // Debugging output
        instance.data.translations = translations; // Store for later use
    }
    
    // console.log(translations, properties.translations)

	const lang = properties.language
    const fallbackLang = properties.fallbackLang || 'fr'
	
    const requestedTranslation = translations.find(t => t.Langue === lang)
    const fallbackTranslation = translations.find(t => t.Langue === fallbackLang)
    const fallbackFirstTranslation = translations[0]

    const text = requestedTranslation?.Texte || fallbackTranslation?.Texte || fallbackFirstTranslation?.Texte || ''
    
    // console.log(text)
    
	instance.publishState('text', text)
}