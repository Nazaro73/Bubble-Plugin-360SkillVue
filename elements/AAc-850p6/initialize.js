function(instance, context) {
	
	const elemId = crypto.randomUUID()
    
    $(instance.canvas).append(`<div id="${elemId}"></div>`)
    
    window.plugin360SkillVueVideoRecord.init()
}