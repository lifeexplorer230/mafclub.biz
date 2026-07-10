/* mafclub-form-relay — перехват отправки формы Tilda → Яндекс Cloud Function → Telegram.
   Чинит «форму-притворщицу»: показывает «Спасибо» ТОЛЬКО когда заявка реально ушла,
   и зажигает цель Метрики form_submit на настоящем успехе, а не оптимистично.
   Tilda перехватывает КЛИК по кнопке (не submit-событие), поэтому ловим клик в capture-фазе. */
(function () {
  var FN_URL = "https://functions.yandexcloud.net/d4euhqpl00nd9om0aq0f"; // Яндекс Cloud Function
  var METRIKA_ID = 105329948;
  var sending = false;

  function val(form, name) {
    var el = form.querySelector('input[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function onClick(e) {
    var btn = e.target.closest('button[type="submit"], input[type="submit"], .t-submit');
    if (!btn) return;
    var form = btn.closest("form");
    if (!form) return;
    if (!form.querySelector('input[name="Phone"]') && !form.querySelector('input[name="Email"]')) return;

    // наша валидация (Tilda-валидацию мы обходим, поэтому проверяем сами)
    var name = val(form, "Name");
    var phone = val(form, "Phone");
    var email = val(form, "Email");
    var consent = form.querySelector('input[name="Checkbox"]'); // согласие на обработку ПД

    if (!name || !phone) { alert("Заполните имя и телефон."); block(e); return; }
    if (consent && !consent.checked) { alert("Нужно согласие на обработку персональных данных."); block(e); return; }

    // перехватываем клик до Tilda
    block(e);
    if (sending) return;
    sending = true;

    var orig = btn.innerText || btn.value;
    setText(btn, "Отправляем…");
    btn.disabled = true;

    fetch(FN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, phone: phone, email: email, hp: val(form, "hp") }),
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        sending = false;
        if (res && res.ok) {
          try { if (window.ym) ym(METRIKA_ID, "reachGoal", "form_submit"); } catch (x) {}
          showSuccess(form);
        } else { fail(btn, orig, "Не удалось отправить. Позвоните нам или напишите в Telegram."); }
      })
      .catch(function () {
        sending = false;
        fail(btn, orig, "Нет связи. Проверьте интернет и попробуйте ещё раз.");
      });
  }

  function block(e) { e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); }
  function setText(btn, t) { if ("value" in btn && btn.tagName === "INPUT") btn.value = t; else btn.innerText = t; }

  function showSuccess(form) {
    var wrap = form.closest(".t-form, .t396__elem") || form.parentElement;
    var succ = wrap && wrap.querySelector(".js-successbox, .t-form__successbox, .t678__success");
    if (succ) { form.style.display = "none"; succ.style.display = "block"; return; }
    form.innerHTML =
      '<div style="text-align:center;padding:28px;font-size:18px;color:#fff;">' +
      "Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее время." +
      "</div>";
  }

  function fail(btn, orig, msg) { btn.disabled = false; setText(btn, orig); alert(msg); }

  document.addEventListener("click", onClick, true);
})();
