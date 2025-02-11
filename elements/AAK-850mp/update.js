function(instance, properties, context) {

	const select = instance.data.select

	const availableLanguages = properties.available_languages?.get(0, properties.available_languages.length()) || []
	const filteredLanguages = properties.filter_languages?.get(0, properties.filter_languages.length()) || []

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

	const currData = select.getData()

	// If the data is not the same as the updated data, update the select
	function arraysHaveSameValuesByKey(arr1, arr2, key) {
		if (arr1.length !== arr2.length) return false

		const getValuesArray = arr => arr.map(item => item[key]).sort()

		const sortedValues1 = getValuesArray(arr1)
		const sortedValues2 = getValuesArray(arr2)

		return sortedValues1.every((value, index) => value === sortedValues2[index])
	}

	if (!arraysHaveSameValuesByKey(currData, updatedLangs, 'value')) {
		select.setData(updatedLangs)
	}

	if (properties.default_value && properties.default_value !== '' && !instance.data.hasSetDefaultValue) {
		// Check if the default value exists in the list
		if (updatedLangs.find(ul => ul.value === properties.default_value)) {
			instance.data.hasSetDefaultValue = true
			select.setSelected(properties.default_value)
		}
	}

}