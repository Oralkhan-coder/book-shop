function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const formattedDate = now.toLocaleString('en-US', options);
    document.getElementById('current-datetime').textContent = formattedDate;
}

updateDateTime();
setInterval(updateDateTime, 1000);

const contactForm = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');

function validateName(name) {
    return name.trim().length >= 2;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validatePhone(phone) {
    if (phone.trim() === '') return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function validateMessage(message) {
    return message.trim().length >= 10;
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + '-error');
    input.classList.add('error');
    errorElement.textContent = message;
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + '-error');
    input.classList.remove('error');
    errorElement.textContent = '';
}

document.getElementById('name').addEventListener('blur', function() {
    if (!validateName(this.value)) {
        showError('name', 'Name must be at least 2 characters long');
    } else {
        clearError('name');
    }
});

document.getElementById('email').addEventListener('blur', function() {
    if (!validateEmail(this.value)) {
        showError('email', 'Please enter a valid email address');
    } else {
        clearError('email');
    }
});

document.getElementById('password').addEventListener('blur', function() {
    if (!validatePassword(this.value)) {
        showError('password', 'Password must be at least 8 characters long');
    } else {
        clearError('password');
    }
});

document.getElementById('confirm-password').addEventListener('blur', function() {
    const password = document.getElementById('password').value;
    if (this.value !== password) {
        showError('confirm-password', 'Passwords do not match');
    } else {
        clearError('confirm-password');
    }
});

document.getElementById('phone').addEventListener('blur', function() {
    if (this.value && !validatePhone(this.value)) {
        showError('phone', 'Please enter a valid phone number');
    } else {
        clearError('phone');
    }
});

document.getElementById('message').addEventListener('blur', function() {
    if (!validateMessage(this.value)) {
        showError('message', 'Message must be at least 10 characters long');
    } else {
        clearError('message');
    }
});

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearError('name');
    clearError('email');
    clearError('password');
    clearError('confirm-password');
    clearError('phone');
    clearError('message');

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    let isValid = true;

    if (!validateName(name)) {
        showError('name', 'Name is required and must be at least 2 characters');
        isValid = false;
    }

    if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    if (!validatePassword(password)) {
        showError('password', 'Password must be at least 8 characters long');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError('confirm-password', 'Passwords do not match');
        isValid = false;
    }

    if (phone && !validatePhone(phone)) {
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
    }

    if (!validateMessage(message)) {
        showError('message', 'Message is required and must be at least 10 characters');
        isValid = false;
    }

    if (isValid) {
        successMessage.classList.add('show');
        contactForm.reset();

        setTimeout(function() {
            successMessage.classList.remove('show');
        }, 5000);
    }
});

const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
        const accordionItem = this.parentElement;
        const isActive = accordionItem.classList.contains('active');

        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
        });

        if (!isActive) {
            accordionItem.classList.add('active');
        }
    });
});

const subscribeBtn = document.getElementById('subscribe-btn');
const popupOverlay = document.getElementById('popup-overlay');
const popupClose = document.getElementById('popup-close');
const subscriptionForm = document.getElementById('subscription-form');

subscribeBtn.addEventListener('click', function() {
    popupOverlay.classList.add('show');
});

popupClose.addEventListener('click', function() {
    popupOverlay.classList.remove('show');
});

popupOverlay.addEventListener('click', function(e) {
    if (e.target === popupOverlay) {
        popupOverlay.classList.remove('show');
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popupOverlay.classList.contains('show')) {
        popupOverlay.classList.remove('show');
    }
});

subscriptionForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const subName = document.getElementById('sub-name').value;
    const subEmail = document.getElementById('sub-email').value;
    const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
        .map(cb => cb.value);

    if (subName.trim() === '' || !validateEmail(subEmail)) {
        alert('Please fill in all required fields with valid information.');
        return;
    }

    alert(`Thank you for subscribing, ${subName}! You'll receive updates about: ${preferences.join(', ') || 'all categories'}`);

    subscriptionForm.reset();
    popupOverlay.classList.remove('show');
});
