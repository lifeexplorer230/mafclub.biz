/* mafclub-form-relay — перехват отправки формы Tilda → Яндекс Cloud Function → Telegram.
   Чинит «форму-притворщицу»: показывает «Спасибо» ТОЛЬКО когда заявка реально ушла,
   и зажигает цель Метрики form_submit на настоящем успехе, а не оптимистично.
   Вставляется одним <script> перед </body>. URL функции подставлен. */
(function () {
  var WORKER_URL = "https://functions.yandexcloud.net/d4euhqpl00nd9om0aq0f"; // Яндекс Cloud Function
  var METRIKA_ID = 105329948;

  function val(form, name) {
    var el = form.querySelector('input[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function onSubmit(e) {
    var form = e.target;
    if (!form || form.tagName !== "FORM") return;
    if (!form.querySelector('input[name="Phone"]') && !form.querySelector('input[name="Email"]')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var payload = {
      name: val(form, "Name"),
      phone: val(form, "Phone"),
      email: val(form, "Email"),
      hp: val(form, "hp"), // honeypot
    };

    var btn = form.querySelector('button[type="submit"], button');
    if (btn) { btn.disabled = true; btn.dataset.t = btn.innerText; btn.innerText = "Отправляем…"; }

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        if (res && res.ok) {
          try { if (window.ym) ym(METRIKA_ID, "reachGoal", "form_submit"); } catch (x) {}
          showSuccess(form);
        } else {
          fail(btn, "Не удалось отправить. Позвоните нам или напишите в Telegram.");
        }
      })
      .catch(function () {
        fail(btn, "Нет связи. Проверьте интернет и попробуйте ещё раз.");
      });
  }

  function showSuccess(form) {
    // отдать управление штатному success-блоку Tilda, если он есть
    try {
      var wrap = form.closest(".t-form") || form.parentElement;
      var succ = wrap && wrap.querySelector(".js-successbox, .t-form__successbox, .t678__success");
      if (succ) { form.style.display = "none"; succ.style.display = "block"; return; }
    } catch (x) {}
    form.innerHTML =
      '<div style="text-align:center;padding:24px;font-size:18px;">' +
      "Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее время." +
      "</div>";
  }

  function fail(btn, msg) {
    if (btn) { btn.disabled = false; if (btn.dataset.t) btn.innerText = btn.dataset.t; }
    alert(msg);
  }

  // перехватываем на этапе capture, чтобы опередить обработчик Tilda
  document.addEventListener("submit", onSubmit, true);
})();
