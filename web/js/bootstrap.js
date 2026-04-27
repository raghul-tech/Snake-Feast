(function () {
	var isFile = window.location && window.location.protocol === 'file:';
	var isHttp = window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:');

	if (isHttp) {
		var link = document.createElement('link');
		link.rel = 'manifest';
		link.href = './manifest.json';
		document.head.appendChild(link);
	}

	if ('serviceWorker' in navigator && !isFile) {
		navigator.serviceWorker.register('./sw.js');
	}
})();
