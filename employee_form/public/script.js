const form = document.getElementById('registrationForm');

const validators = {
    firstName: { pattern: /^[A-Za-z\s]{2,30}$/, message: 'Enter a valid first name (2-30 letters)' },
    lastName:  { pattern: /^[A-Za-z\s]{2,30}$/, message: 'Enter a valid last name (2-30 letters)' },
    email:     { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
    phone:     { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' },
    city:      { pattern: /^[A-Za-z\s]{2,50}$/, message: 'Enter a valid city name' },
    state:     { pattern: /^[A-Za-z\s]{2,50}$/, message: 'Enter a valid state name' },
    zipCode:   { pattern: /^[0-9]{5,10}$/, message: 'Enter a valid zip code (5-10 digits)' },
    country:   { pattern: /^[A-Za-z\s]{2,50}$/, message: 'Enter a valid country name' },
    employeeId: { pattern: /^[A-Za-z0-9\-]{3,20}$/, message: 'Enter a valid Employee ID (e.g. EMP-001)' },
    designation: { pattern: /^[A-Za-z\s]{2,50}$/, message: 'Enter a valid designation' },
    salary:    { pattern: /^[0-9]+$/, message: 'Enter a valid salary amount' }
};

Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => validateField(id));
        el.addEventListener('blur', () => validateField(id));
    }
});

document.getElementById('dob').addEventListener('change', validateDob);
document.getElementById('joinDate').addEventListener('change', validateJoinDate);

document.getElementById('password').addEventListener('input', function () {
    checkPasswordStrength(this.value);
    validateField('password');
    if (document.getElementById('confirmPassword').value) {
        validateConfirmPassword();
    }
});

document.getElementById('confirmPassword').addEventListener('input', validateConfirmPassword);

['gender', 'department', 'employmentType'].forEach(id => {
    document.getElementById(id).addEventListener('change', function () {
        const errEl = document.getElementById(id + 'Error');
        if (this.value) {
            this.classList.remove('invalid');
            this.classList.add('valid');
            errEl.textContent = '';
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
            errEl.textContent = 'This field is required';
        }
    });
});

document.getElementById('terms').addEventListener('change', function () {
    const errEl = document.getElementById('termsError');
    errEl.textContent = this.checked ? '' : 'You must agree to the terms';
});

document.getElementById('address').addEventListener('input', function () {
    const errEl = document.getElementById('addressError');
    if (this.value.trim().length >= 5) {
        this.classList.remove('invalid');
        this.classList.add('valid');
        errEl.textContent = '';
    } else {
        this.classList.remove('valid');
        this.classList.add('invalid');
        errEl.textContent = 'Enter a valid address (at least 5 characters)';
    }
});

function validateField(id) {
    const el = document.getElementById(id);
    const errEl = document.getElementById(id + 'Error');
    const val = el.value.trim();

    if (!val) {
        el.classList.remove('valid');
        el.classList.add('invalid');
        errEl.textContent = 'This field is required';
        return false;
    }

    if (validators[id]) {
        if (!validators[id].pattern.test(val)) {
            el.classList.remove('valid');
            el.classList.add('invalid');
            errEl.textContent = validators[id].message;
            return false;
        }
    }

    el.classList.remove('invalid');
    el.classList.add('valid');
    errEl.textContent = '';
    return true;
}

function validateDob() {
    const el = document.getElementById('dob');
    const errEl = document.getElementById('dobError');
    const val = el.value;

    if (!val) {
        el.classList.add('invalid');
        errEl.textContent = 'Date of birth is required';
        return false;
    }

    const dob = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    if (age < 18 || age > 65) {
        el.classList.add('invalid');
        el.classList.remove('valid');
        errEl.textContent = 'Employee age must be between 18 and 65';
        return false;
    }

    el.classList.remove('invalid');
    el.classList.add('valid');
    errEl.textContent = '';
    return true;
}

function validateJoinDate() {
    const el = document.getElementById('joinDate');
    const errEl = document.getElementById('joinDateError');
    const val = el.value;

    if (!val) {
        el.classList.add('invalid');
        errEl.textContent = 'Join date is required';
        return false;
    }

    const joinDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (joinDate > today) {
        el.classList.add('invalid');
        el.classList.remove('valid');
        errEl.textContent = 'Join date cannot be in the future';
        return false;
    }

    el.classList.remove('invalid');
    el.classList.add('valid');
    errEl.textContent = '';
    return true;
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword');
    const errEl = document.getElementById('confirmPasswordError');

    if (!confirm.value) {
        confirm.classList.add('invalid');
        confirm.classList.remove('valid');
        errEl.textContent = 'Please confirm your password';
        return false;
    }

    if (password !== confirm.value) {
        confirm.classList.add('invalid');
        confirm.classList.remove('valid');
        errEl.textContent = 'Passwords do not match';
        return false;
    }

    confirm.classList.remove('invalid');
    confirm.classList.add('valid');
    errEl.textContent = '';
    return true;
}

function checkPasswordStrength(password) {
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
        { width: '0%', color: 'transparent', label: '', textColor: 'transparent' },
        { width: '20%', color: '#e53935', label: 'Very Weak', textColor: '#e53935' },
        { width: '40%', color: '#ff9800', label: 'Weak', textColor: '#ff9800' },
        { width: '60%', color: '#ffc107', label: 'Fair', textColor: '#ffc107' },
        { width: '80%', color: '#8bc34a', label: 'Strong', textColor: '#8bc34a' },
        { width: '100%', color: '#4caf50', label: 'Very Strong', textColor: '#4caf50' }
    ];

    const level = levels[strength];
    fill.style.width = level.width;
    fill.style.background = level.color;
    text.textContent = level.label;
    text.style.color = level.textColor;
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const btn = field.nextElementSibling;
    if (field.type === 'password') {
        field.type = 'text';
        btn.innerHTML = '&#128064;';
    } else {
        field.type = 'password';
        btn.innerHTML = '&#128065;';
    }
}

function validateForm() {
    let isValid = true;

    Object.keys(validators).forEach(id => {
        if (!validateField(id)) isValid = false;
    });

    if (!validateDob()) isValid = false;
    if (!validateJoinDate()) isValid = false;
    if (!validateConfirmPassword()) isValid = false;

    ['gender', 'department', 'employmentType'].forEach(id => {
        const el = document.getElementById(id);
        const errEl = document.getElementById(id + 'Error');
        if (!el.value) {
            el.classList.add('invalid');
            errEl.textContent = 'This field is required';
            isValid = false;
        }
    });

    const address = document.getElementById('address');
    const addressErr = document.getElementById('addressError');
    if (address.value.trim().length < 5) {
        address.classList.add('invalid');
        addressErr.textContent = 'Enter a valid address (at least 5 characters)';
        isValid = false;
    }

    const terms = document.getElementById('terms');
    const termsErr = document.getElementById('termsError');
    if (!terms.checked) {
        termsErr.textContent = 'You must agree to the terms';
        isValid = false;
    }

    return isValid;
}

form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (validateForm()) {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                form.classList.add('hidden');
                document.querySelector('.view-link').classList.add('hidden');
                document.getElementById('successMessage').classList.remove('hidden');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(() => {
            alert('An error occurred while submitting the form. Please try again.');
        });
    } else {
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }
    }
});

function resetForm() {
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('.error').forEach(el => {
        el.textContent = '';
    });
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    if (strengthFill) {
        strengthFill.style.width = '0%';
        strengthFill.style.background = 'transparent';
    }
    if (strengthText) {
        strengthText.textContent = '';
    }
}

function showForm() {
    form.reset();
    resetForm();
    form.classList.remove('hidden');
    document.querySelector('.view-link').classList.remove('hidden');
    document.getElementById('successMessage').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
