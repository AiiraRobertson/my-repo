/* Signup form handler: collects all inputs, validates, shows inline errors, and sends a mock POST */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action="/submit-signup"]') || document.querySelector('form');
  if (!form) return;

  const fields = {
    firstName: document.getElementById('first-name'),
    surname: document.getElementById('surname'),
    dob: document.getElementById('dob'),
    nationality: document.getElementById('nationality'),
    phone: document.getElementById('phone-number'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirm-password')
  };

  // Create a container for validation messages
  let messageBox = document.getElementById('signup-messages');
  if (!messageBox) {
    messageBox = document.createElement('div');
    messageBox.id = 'signup-messages';
    form.parentNode.insertBefore(messageBox, form);
  }

  const validators = {
    required: (v) => v !== null && String(v).trim() !== '',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    phone: (v) => /^[0-9()+\-\s]{7,20}$/.test(v),
    minLen: (v, n) => String(v).length >= n
  };

  function clearErrors() {
    messageBox.innerHTML = '';
    Object.values(fields).forEach((el) => {
      if (!el) return;
      el.removeAttribute('aria-invalid');
      const err = el.nextElementSibling;
      if (err && err.classList && err.classList.contains('field-error')) err.remove();
    });
  }

  function showFieldError(fieldEl, msg) {
    if (!fieldEl) return;
    fieldEl.setAttribute('aria-invalid', 'true');
    const span = document.createElement('div');
    span.className = 'field-error';
    span.style.color = '#b00020';
    span.style.fontSize = '0.9rem';
    span.style.marginTop = '6px';
    span.textContent = msg;
    fieldEl.parentNode.insertBefore(span, fieldEl.nextSibling);
  }

  function showMessages(messages, isSuccess = false) {
    messageBox.innerHTML = '';
    const box = document.createElement('div');
    box.style.padding = '10px 14px';
    box.style.borderRadius = '8px';
    box.style.marginBottom = '12px';
    box.style.color = isSuccess ? '#0b3' : '#8b0000';
    box.style.background = isSuccess ? 'rgba(16,128,16,0.06)' : 'rgba(220,20,60,0.04)';
    if (Array.isArray(messages)) {
      const ul = document.createElement('ul');
      messages.forEach((m) => {
        const li = document.createElement('li');
        li.textContent = m;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    } else {
      box.textContent = messages;
    }
    messageBox.appendChild(box);
  }

  function validateForm() {
    const errs = [];
    const v = {};
    Object.keys(fields).forEach((key) => {
      const el = fields[key];
      v[key] = el ? el.value.trim() : '';
    });

    // Required checks
    ['firstName','surname','dob','nationality','phone','email','password','confirmPassword'].forEach((k) => {
      if (!validators.required(v[k])) errs.push(`${k === 'firstName' ? 'First name' : k === 'confirmPassword' ? 'Confirm password' : k.charAt(0).toUpperCase() + k.slice(1)} is required.`);
    });

    // Email
    if (v.email && !validators.email(v.email)) errs.push('Please enter a valid email address.');

    // Phone (optional strictness)
    if (v.phone && !validators.phone(v.phone)) errs.push('Please enter a valid phone number (numbers, spaces, +, - are allowed).');

    // Password rules
    if (v.password && !validators.minLen(v.password, 8)) errs.push('Password must be at least 8 characters.');
    if (v.password !== v.confirmPassword) errs.push('Passwords do not match.');

    return { valid: errs.length === 0, errors: errs, values: v };
  }

  // Attach simple input listeners to remove field-level errors as user types
  Object.values(fields).forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      const next = el.nextElementSibling;
      if (next && next.classList && next.classList.contains('field-error')) next.remove();
      el.removeAttribute('aria-invalid');
      if (messageBox) messageBox.innerHTML = '';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const result = validateForm();
    if (!result.valid) {
      // show field-level highlights for the first few errors (best-effort)
      showMessages(result.errors);
      // focus first invalid field
      const firstInvalid = Object.keys(fields).map(k => fields[k]).find(el => el && (el.value.trim() === '' || el.getAttribute('aria-invalid') === 'true'));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Build payload (do NOT include confirmPassword)
    const payload = {
      firstName: result.values.firstName,
      surname: result.values.surname,
      dob: result.values.dob,
      nationality: result.values.nationality,
      phone: result.values.phone,
      email: result.values.email,
      password: result.values.password
    };

    // Mock submission: try to POST to form.action. If no backend, we'll still log it.
    try {
      const action = form.getAttribute('action') || '/submit-signup';
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // If server returns error, show message (but still parse body if available)
        let text;
        try { text = await res.text(); } catch (err) { text = res.statusText; }
        showMessages([`Server error: ${res.status} ${text}`]);
        return;
      }

      // Success
      showMessages('Signup successful! Thank you — redirecting...', true);
      console.log('Signup payload:', payload);
      form.reset();
      // Optional: redirect after short delay
      setTimeout(() => { window.location.href = '/recipe/distrohome.html'; }, 1100);
    } catch (err) {
      console.error('Signup failed', err);
      showMessages(['Network error: could not submit signup.']);
    }
  });
});
