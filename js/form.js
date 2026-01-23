// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    // Create modal HTML
    createFormModal();
});

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

                <form id="registrationForm" class="form-fields">
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

                    <div class="form-field form-field--checkbox">
                        <label class="checkbox-label">
                            <input type="checkbox" id="userOffer" name="offer" required>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Я согласен с <a href="offer.html" target="_blank" rel="noreferrer noopener">Договором офертой</a>.</span>
                        </label>
                    </div>

                    <div class="form-field form-field--checkbox">
                        <label class="checkbox-label">
                            <input type="checkbox" id="userPhoto" name="photo">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Я даю согласие на фото- и видеосъемку во время мероприятий и использование материалов в социальных сетях организатора (необязательно)</span>
                        </label>
                    </div>

                    <div class="form-field form-field--checkbox">
                        <label class="checkbox-label">
                            <input type="checkbox" id="userMarketing" name="marketing">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Я хочу получать информацию о предстоящих играх и специальных предложениях (необязательно)</span>
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
                    <button class="form-btn form-btn--primary" onclick="closeFormModal()">Отлично!</button>
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
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Collect data
    const formData = {
        email: document.getElementById('userEmail').value,
        name: document.getElementById('userName').value,
        phone: document.getElementById('userPhone').value,
        photoConsent: document.getElementById('userPhoto').checked,
        marketingConsent: document.getElementById('userMarketing').checked,
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
    const url = 'https://videos.moderator.top/telegram-submit.php';

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
