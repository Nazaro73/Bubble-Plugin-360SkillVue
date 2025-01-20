function(instance, properties, context) {

	const select = instance.data.select
    
    const availableLanguages = properties.available_languages?.get(0, properties.available_languages.length()) || []
    const filteredLanguages = properties.filter_languages?.get(0, properties.filter_languages.length()) || []
    
    console.log(availableLanguages, filteredLanguages)

	const updatedLangs = instance.data.languageList.filter(l => {
		// If availableLanguages is not empty, we check if lang is part of the list
		if (availableLanguages.length > 0) {
			const foundAvailableLang = availableLanguages.find(al => al === l.value)
			
			// Filter language if not present in the availableLanguages
            if (!foundAvailableLang) return false
		}
        
		// If filteredLanguages is not empty, we check if lang is part of the list
		if (filteredLanguages?.length > 0) {
			const foundfilteredLang = filteredLanguages.find(fl => fl === l.value)
			
			// Filter language if present in the filteredLanguages
            if (foundfilteredLang) return false
		}

		// Else, have the lang in the list
        return true
	})
    
    console.log(updatedLangs)
    
    select.setData(updatedLangs)
    
    if (properties.default_value && properties.default_value !== '' && !instance.data.hasSetDefaultValue) {
		// Check if the default value exists in the list
		if (updatedLangs.find(ul => ul.value === properties.default_value)) {
            instance.data.hasSetDefaultValue = true
            select.setSelected(properties.default_value)
        }
	}

}