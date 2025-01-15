function(instance, context) {
	const video = document.createElement('video');
	
	// video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
	video.controls = true;
	video.style.objectFit = 'contain'
	video.style.width = '100%';
	video.style.height = '100%';

	$(instance.canvas).append(video);
}