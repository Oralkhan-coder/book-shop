// Simple localStorage-based authentication and profile management
// Data model:
// - users: { [email]: { name, email, phone, password } }
// - currentUserEmail: string | null

(function () {
	const PASSWORD_RULES = {
		minLength: 8,
		lower: /[a-z]/,
		upper: /[A-Z]/,
		number: /[0-9]/,
		special: /[^A-Za-z0-9]/,
	};

	function getUsers() {
		try {
			return JSON.parse(localStorage.getItem('users') || '{}');
		} catch (_) {
			return {};
		}
	}

	function setUsers(users) {
		localStorage.setItem('users', JSON.stringify(users));
	}

	function getCurrentUser() {
		const email = localStorage.getItem('currentUserEmail');
		if (!email) return null;
		const users = getUsers();
		return users[email] || null;
	}

	function logout() {
		localStorage.removeItem('currentUserEmail');
	}

	function validateEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	function validatePhone(phone) {
		if (!phone) return true;
		const digits = phone.replace(/\D/g, '');
		return /^[\d\s\-+()]+$/.test(phone) && digits.length >= 10 && digits.length <= 14;
	}

	function validatePasswordComplexity(password) {
		if (!password || password.length < PASSWORD_RULES.minLength) return false;
		return PASSWORD_RULES.lower.test(password) &&
			PASSWORD_RULES.upper.test(password) &&
			PASSWORD_RULES.number.test(password) &&
			PASSWORD_RULES.special.test(password);
	}

	function signup({ name, email, phone, password, confirmPassword }) {
		if (!name || !email || !password || !confirmPassword) {
			return { ok: false, error: 'All required fields must be filled.' };
		}
		if (!validateEmail(email)) return { ok: false, error: 'Invalid email format.' };
		if (!validatePhone(phone || '')) return { ok: false, error: 'Invalid phone number.' };
		if (!validatePasswordComplexity(password)) {
			return {
				ok: false,
				error: 'Password must be 8+ chars and include upper, lower, number, special.'
			};
		}
		if (password !== confirmPassword) return { ok: false, error: 'Passwords do not match.' };

		const users = getUsers();
		if (users[email]) return { ok: false, error: 'Account already exists.' };
		users[email] = { name: name.trim(), email: email.trim(), phone: (phone || '').trim(), password };
		setUsers(users);
		localStorage.setItem('currentUserEmail', email);
		return { ok: true };
	}

	function login({ email, password }) {
		if (!email || !password) return { ok: false, error: 'Email and password are required.' };
		const users = getUsers();
		const user = users[email];
		if (!user) return { ok: false, error: 'Account not found.' };
		if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
		localStorage.setItem('currentUserEmail', email);
		return { ok: true };
	}

	function resetPassword({ email, newPassword, confirmPassword }) {
		if (!email || !newPassword || !confirmPassword) {
			return { ok: false, error: 'All fields are required.' };
		}
		if (!validateEmail(email)) return { ok: false, error: 'Invalid email format.' };
		if (!validatePasswordComplexity(newPassword)) {
			return { ok: false, error: 'Password must be 8+ chars and include upper, lower, number, special.' };
		}
		if (newPassword !== confirmPassword) return { ok: false, error: 'Passwords do not match.' };
		const users = getUsers();
		if (!users[email]) return { ok: false, error: 'Account not found.' };
		users[email].password = newPassword;
		setUsers(users);
		return { ok: true };
	}

	// Expose helpers
	window.Auth = {
		getCurrentUser,
		logout,
		signup,
		login,
		resetPassword,
		validateEmail,
		validatePhone,
		validatePasswordComplexity
	};

	// Wire up forms if present on page
	document.addEventListener('DOMContentLoaded', function () {
		// Sign Up form
		const signupForm = document.getElementById('signup-form');
		if (signupForm) {
			signupForm.addEventListener('submit', function (e) {
				e.preventDefault();
				const data = {
					name: signupForm.querySelector('#su-name')?.value || '',
					email: signupForm.querySelector('#su-email')?.value || '',
					phone: signupForm.querySelector('#su-phone')?.value || '',
					password: signupForm.querySelector('#su-password')?.value || '',
					confirmPassword: signupForm.querySelector('#su-confirm')?.value || '',
				};
				const result = signup(data);
				if (!result.ok) {
					alert(result.error);
					return;
				}
				window.location.href = 'profile.html';
			});
		}

		// Log In form
		const loginForm = document.getElementById('login-form');
		if (loginForm) {
			loginForm.addEventListener('submit', function (e) {
				e.preventDefault();
				const creds = {
					email: loginForm.querySelector('#li-email')?.value || '',
					password: loginForm.querySelector('#li-password')?.value || '',
				};
				const result = login(creds);
				if (!result.ok) {
					alert(result.error);
					return;
				}
				window.location.href = 'profile.html';
			});
		}

		// Profile page rendering and logout
		const profileName = document.getElementById('profile-name');
		const profileEmail = document.getElementById('profile-email');
		const profilePhone = document.getElementById('profile-phone');
		if (profileName && profileEmail) {
			const user = getCurrentUser();
			if (!user) {
				window.location.href = 'form.html';
				return;
			}
			profileName.textContent = user.name;
			profileEmail.textContent = user.email;
			if (profilePhone) profilePhone.textContent = user.phone || '—';

			const logoutBtn = document.getElementById('logout-btn');
			if (logoutBtn) {
				logoutBtn.addEventListener('click', function () {
					logout();
					window.location.href = 'index.html';
				});
			}
		}

		// Reset password form
		const resetForm = document.getElementById('reset-form');
		if (resetForm) {
			resetForm.addEventListener('submit', function (e) {
				e.preventDefault();
				const payload = {
					email: resetForm.querySelector('#rp-email')?.value || '',
					newPassword: resetForm.querySelector('#rp-password')?.value || '',
					confirmPassword: resetForm.querySelector('#rp-confirm')?.value || '',
				};
				const result = resetPassword(payload);
				if (!result.ok) {
					alert(result.error);
					return;
				}
				alert('Password updated. Please log in with your new password.');
				window.location.href = 'login.html';
			});
		}
	});
})(); 

