function(instance, properties, context) {
    // Translations: { Langue: String, Texte: String }[]
	const translations = properties.translations

	const lang = properties.language
    const fallbackLang = properties.fallbackLang || 'fr'
	
    const requestedTranslation = translations.find(t => t.Langue === lang)
    const fallbackTranslation = translations.find(t => t.Langue === fallbackLang)
    const fallbackFirstTranslation = translations[0]

    const text = requestedTranslation?.Texte || fallbackTranslation?.Texte || fallbackFirstTranslation?.Texte || ''
    
	instance.publishState('text', text)
}