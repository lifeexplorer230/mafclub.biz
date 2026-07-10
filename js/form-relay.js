/* mafclub-form-relay — чинит ТОЛЬКО инлайн-форму Tilda (#form1490306351) в секции «Регистрация».
   Попап (js/form.js) чинит сам себя. Здесь перехватываем клик по кнопке Tilda-формы,
   шлём на ту же Яндекс Cloud Function и зажигаем цель Метрики form_submit. */
(function () {
  var FN_URL = "https://functions.yandexcloud.net/d4euhqpl00nd9om0aq0f";
  var METRIKA_ID = 105329948;
  var FORM_ID = "form1490306351"; // только инлайн-форма Tilda
  var sending = false;

  function val(form, name) {
    var el = form.querySelector('input[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest('button[type="submit"], input[type="submit"], .t-submit');
    if (!btn) return;
    var form = btn.closest("form");
    if (!form || form.id !== FORM_ID) return; // чужие формы не трогаем

    var name = val(form, "Name"), phone = val(form, "Phone"), email = val(form, "Email");
    var digits = phone.replace(/\D/g, "");
    var phoneOk = (digits.length === 11 && /^[78]/.test(digits)) || digits.length === 10;
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (name.length < 2 || !emailOk || !phoneOk) {
      var m = [];
      if (name.length < 2) m.push("укажите имя");
      if (!emailOk) m.push("корректный e-mail (например ivan@mail.ru)");
      if (!phoneOk) m.push("телефон в формате +7 999 123-45-67");
      alert("Проверьте поля: " + m.join(", ") + ".");
      e.preventDefault(); e.stopImmediatePropagation(); return;
    }

    e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
    if (sending) return;
    sending = true;
    var orig = btn.innerText || btn.value;
    btn.disabled = true; if (btn.tagName === "INPUT") btn.value = "Отправляем…"; else btn.innerText = "Отправляем…";

    fetch(FN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, phone: phone, email: email }),
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        sending = false;
        if (res && res.ok) {
          try { if (window.ym) ym(METRIKA_ID, "reachGoal", "form_submit"); } catch (x) {}
          form.innerHTML = '<div style="text-align:center;padding:28px;font-size:18px;">Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее время.</div>';
        } else { restore(btn, orig, "Не удалось отправить. Позвоните нам или напишите в Telegram."); }
      })
      .catch(function () { sending = false; restore(btn, orig, "Нет связи. Попробуйте ещё раз."); });
  }, true);

  function restore(btn, orig, msg) {
    btn.disabled = false;
    if (btn.tagName === "INPUT") btn.value = orig; else btn.innerText = orig;
    alert(msg);
  }
})();
