function(instance, properties, context) {

	const video = $(instance.canvas).find('video')[0];
	if (video) {

		if (video.src !== properties.video_url) {
			video.src = properties.video_url;
		}
	}
}