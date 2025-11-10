// Simple page guard: redirect to login if no authenticated user
document.addEventListener('DOMContentLoaded', function () {
	try {
		const current = localStorage.getItem('currentUserEmail');
		if (!current) {
			// Avoid redirect loops if guard is ever included on public pages
			const publicPages = ['login.html', 'signup.html', 'index.html', 'form.html'];
			const href = (location.pathname || '').split('/').pop().toLowerCase();
			if (!publicPages.includes(href)) {
				window.location.replace('login.html');
			}
		}
	} catch (_) {
		// If localStorage not available, default to login
		const href = (location.pathname || '').split('/').pop().toLowerCase();
		if (!['login.html', 'signup.html', 'index.html', 'form.html'].includes(href)) {
			window.location.replace('login.html');
		}
	}
});



