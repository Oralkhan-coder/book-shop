// Toggle nav items based on authentication state
document.addEventListener('DOMContentLoaded', function () {
	try {
		var isLoggedIn = !!localStorage.getItem('currentUserEmail');
		// Find all nav lists in header
		var navLists = document.querySelectorAll('header nav ul');
		var publicHrefs = ['index.html', 'home.html', 'login.html'];
		navLists.forEach(function (ul) {
			var items = ul.querySelectorAll('li');
			var hasLogin = false;
			items.forEach(function (li) {
				var a = li.querySelector('a');
				if (!a) return;
				var href = (a.getAttribute('href') || '').trim().toLowerCase();
				// Normalize possible home links
				if (href === '' || href === './' || href === '/') href = 'index.html';
				if (href === 'login.html') hasLogin = true;
				// Before login: only show Home and Log In
				if (!isLoggedIn) {
					if (publicHrefs.indexOf(href) === -1) {
						li.style.display = 'none';
					} else {
						li.style.display = '';
					}
				} else {
					// After login: show all
					li.style.display = '';
				}
			});
			// Ensure Login is present for safety
			if (!isLoggedIn && !hasLogin) {
				var li = document.createElement('li');
				var a = document.createElement('a');
				a.setAttribute('href', 'login.html');
				a.textContent = 'Log In';
				li.appendChild(a);
				ul.appendChild(li);
			}
		});
	} catch (_) {
		// If storage inaccessible, default to public view (hide protected)
		var navLists = document.querySelectorAll('header nav ul');
		var publicHrefs = ['index.html', 'home.html', 'login.html'];
		navLists.forEach(function (ul) {
			ul.querySelectorAll('li').forEach(function (li) {
				var a = li.querySelector('a');
				if (!a) return;
				var href = (a.getAttribute('href') || '').trim().toLowerCase();
				if (href === '' || href === './' || href === '/') href = 'index.html';
				if (publicHrefs.indexOf(href) === -1) {
					li.style.display = 'none';
				}
			});
		});
	}
});


