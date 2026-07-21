// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    // Create modal HTML
    createFormModal();
    // Оставляем ОДНУ форму: инлайн-секцию Tilda «Регистрация» превращаем в кнопку, открывающую попап
    replaceInlineFormWithButton();
});

// Прячем инлайн-форму Tilda (#form1490306351) и ставим кнопку «Забронировать место»
function replaceInlineFormWithButton() {
    var tries = 0;
    var iv = setInterval(function () {
        var form = document.getElementById('form1490306351');
        if (!form) { if (++tries > 40) clearInterval(iv); return; }
        clearInterval(iv);
        if (document.getElementById('regSectionBtn')) return;
        form.style.display = 'none';
        var btn = document.createElement('button');
        btn.id = 'regSectionBtn';
        btn.type = 'button';
        btn.textContent = 'Забронировать место';
        btn.style.cssText = 'display:block;margin:8px auto 0;padding:18px 48px;background:#ffc000;color:#000;font:600 18px/1 Roboto,Arial,sans-serif;border:none;border-radius:100px;cursor:pointer;letter-spacing:1px;';
        btn.onmouseover = function(){ btn.style.opacity = '0.9'; };
        btn.onmouseout = function(){ btn.style.opacity = '1'; };
        btn.onclick = function () { if (window.openFormModal) openFormModal(); };
        form.parentNode.insertBefore(btn, form.nextSibling);
    }, 150);
}

// Open modal on CTA buttons
function openFormModal() {
    const modal = document.getElementById('formModal');
    modal.classList.add('form-modal--active');
    document.body.style.overflow = 'hidden';
}

function createFormModal() {
    const modalHTML = `
    <div class="form-modal" id="formModal">
        <div class="form-modal__overlay"></div>
        <div class="form-modal__container">
            <button class="form-modal__close" aria-label="Закрыть">&times;</button>

            <!-- Registration Form -->
            <div class="form-step" id="formStep">
                <div class="form-step__header">
                    <h3 class="form-step__title">Регистрация на игру</h3>
                    <p class="form-step__subtitle">Заполните форму и мы забронируем для вас место</p>
                </div>

                <form id="registrationForm" class="form-fields" novalidate>
                    <div class="form-field">
                        <label for="userEmail">E-mail *</label>
                        <input type="email" id="userEmail" name="email" required placeholder="Ваш E-mail">
                    </div>

                    <div class="form-field">
                        <label for="userName">Имя и фамилия *</label>
                        <input type="text" id="userName" name="name" required placeholder="Имя и фамилия (или ник в нашем клубе)">
                    </div>

                    <div class="form-field">
                        <label for="userPhone">Телефон *</label>
                        <input type="tel" id="userPhone" name="phone" required placeholder="+7 (___) ___-__-__">
                    </div>

                    <div class="form-field form-field--checkbox">
                        <label class="checkbox-label">
                            <input type="checkbox" id="userPrivacy" name="privacy" required>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Я даю согласие на обработку персональных данных в соответствии с <a href="consent.html" target="_blank" rel="noreferrer noopener">Политикой обработки персональных данных</a></span>
                        </label>
                    </div>

                    

                    

                    

                    <button type="submit" class="form-btn form-btn--primary">
                        Забронировать место
                    </button>
                </form>
            </div>

            <!-- Success -->
            <div class="form-step form-step--hidden" id="formSuccess">
                <div class="form-success">
                    <div class="form-success__icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <circle cx="32" cy="32" r="32" fill="#13ce66" fill-opacity="0.1"/>
                            <path d="M20 32L28 40L44 24" stroke="#13ce66" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3 class="form-success__title">Место забронировано!</h3>
                    <p class="form-success__text">Спасибо за регистрацию. Мы свяжемся с вами в ближайшее время для подтверждения.</p>
                    <p class="form-success__text" style="margin-top:4px;">А пока — подпишитесь на наш телеграм-канал: анонсы игр и жизнь клуба.</p>
                    <a class="form-btn form-btn--primary" href="https://t.me/sellersmafia/216" target="_blank" rel="noreferrer noopener" style="display:block;text-decoration:none;text-align:center;background:#2AABEE;">Подписаться на канал</a>
                    <button class="form-btn" onclick="closeFormModal()" style="margin-top:10px;background:transparent;border:none;color:#888;cursor:pointer;">Закрыть</button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listeners
    document.querySelector('.form-modal__overlay').addEventListener('click', closeFormModal);
    document.querySelector('.form-modal__close').addEventListener('click', closeFormModal);

    // Form submission
    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);

    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeFormModal();
    });
}

function closeFormModal() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('form-modal--active');
    document.body.style.overflow = '';
}

function showSuccess() {
    document.getElementById('formStep').classList.add('form-step--hidden');
    document.getElementById('formSuccess').classList.remove('form-step--hidden');
    try { if (window.ym) ym(105329948, 'reachGoal', 'form_submit'); } catch(e){}
}

// Показ/снятие ошибки под полем
function fieldError(id, msg) {
    var input = document.getElementById(id);
    var field = input.closest('.form-field');
    var box = field.querySelector('.field-error');
    if (!box) {
        box = document.createElement('div');
        box.className = 'field-error';
        box.style.cssText = 'color:#e53935;font-size:13px;margin-top:6px;line-height:1.3;';
        field.appendChild(box);
    }
    if (msg) { box.textContent = msg; input.style.borderColor = '#e53935'; }
    else { box.textContent = ''; input.style.borderColor = ''; }
}

function validateRegForm() {
    var ok = true, firstBad = null;
    var email = document.getElementById('userEmail').value.trim();
    var name  = document.getElementById('userName').value.trim();
    var phone = document.getElementById('userPhone').value.trim();

    // e-mail: есть имя, @, домен с точкой
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        fieldError('userEmail', 'Введите корректный e-mail, например ivan@mail.ru');
        ok = false; firstBad = firstBad || 'userEmail';
    } else fieldError('userEmail', '');

    // имя: минимум 2 буквы
    if (name.length < 2) {
        fieldError('userName', 'Укажите имя (хотя бы 2 буквы)');
        ok = false; firstBad = firstBad || 'userName';
    } else fieldError('userName', '');

    // телефон: 11 цифр РФ (7/8 + 10) или 10 цифр
    var digits = phone.replace(/\D/g, '');
    var phoneOk = (digits.length === 11 && /^[78]/.test(digits)) || digits.length === 10;
    if (!phoneOk) {
        fieldError('userPhone', 'Введите телефон в формате +7 999 123-45-67');
        ok = false; firstBad = firstBad || 'userPhone';
    } else fieldError('userPhone', '');

    // согласия
    if (!document.getElementById('userPrivacy').checked) { alert('Нужно согласие на обработку персональных данных.'); ok = false; firstBad = firstBad || 'userPrivacy'; }

    if (firstBad) { var el = document.getElementById(firstBad); if (el && el.focus) el.focus(); }
    return ok;
}

// снимать ошибку по мере ввода
document.addEventListener('input', function (e) {
    if (e.target && e.target.closest && e.target.closest('#registrationForm') && e.target.id) {
        fieldError(e.target.id, '');
    }
}, true);

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // --- Проверка полей с понятными сообщениями ---
    if (!validateRegForm()) return;

    // Collect data
    const formData = {
        email: document.getElementById('userEmail').value,
        name: document.getElementById('userName').value,
        phone: document.getElementById('userPhone').value,
        oto: window.__mfcOtoActive ? 'спеццена 2 990 ₽ (сегодня)' : '',
        timestamp: new Date().toLocaleString('ru-RU')
    };

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    // Send to backend
    try {
        await sendToTelegram(formData);
        showSuccess();

        // Reset form
        form.reset();
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        alert('Произошла ошибка при отправке. Попробуйте ещё раз или свяжитесь с нами напрямую: +7 925 212 4626');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Забронировать место';
    }
}

async function sendToTelegram(formData) {
    const url = 'https://functions.yandexcloud.net/d4euhqpl00nd9om0aq0f';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error('Server error');
    }

    return response.json();
}
