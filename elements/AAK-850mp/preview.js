function(instance, properties) {
	const elemId = 'language-' + crypto.randomUUID()
    
    $(instance.canvas).append(`<select id="${elemId}"></select>`)

	instance.data.select = new SlimSelect({
        select: `#${elemId}`,
        placeholder: 'Select a language',
        data: [{text: 'Select a language', placeholder: true}, {text: 'English'}]
    })
}