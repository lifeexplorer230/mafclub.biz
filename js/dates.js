// ЕДИНЫЙ ИСТОЧНИК ДАТ ИГР.
// Правишь только этот список — меняется и на сайте (герой, расписание, цена),
// и в форме регистрации (выбор дня). Прошедшие игры отпадают сами.
window.MAFCLUB_GAMES = [
  { date: "2026-08-08", label: "8 августа (Сб)" },
  { date: "2026-08-22", label: "22 августа (Сб)" },
  { date: "2026-09-12", label: "12 сентября (Сб)" },
  { date: "2026-09-26", label: "26 сентября (Сб)" },
  { date: "2026-10-10", label: "10 октября (Сб)" },
  { date: "2026-10-24", label: "24 октября (Сб)" }
];
window.MAFCLUB_TIME = "12:00–18:30";
window.MAFCLUB_METRO = "м. Улица 1905 года";

// Ближайшие игры (сегодня и позже). Если все прошли — вернём полный список (fallback).
window.mafcUpcoming = function () {
  var t = new Date(); t.setHours(0, 0, 0, 0);
  var up = (window.MAFCLUB_GAMES || []).filter(function (g) {
    return new Date(g.date + "T00:00:00") >= t;
  });
  return up.length ? up : (window.MAFCLUB_GAMES || []);
};

// Отрисовка сайта из источника: герой, карточка цены, плитки расписания.
window.mafcRenderSite = function () {
  var games = window.mafcUpcoming();
  if (!games.length) return;
  var next = games[0];

  // 1) дата в герое
  var hd = document.getElementById("mfc-hero-date");
  if (hd) hd.textContent = "Ближайшая — " + next.label + " · " + window.MAFCLUB_TIME + " · " + window.MAFCLUB_METRO + ".";

  // 2) дата в карточке цены
  var pd = document.getElementById("mfc-price-date");
  if (pd) pd.textContent = next.label;

  // 3) плитки расписания
  var box = document.querySelector(".mfc-sched__dates");
  if (box) {
    box.innerHTML = games.map(function (g, i) {
      var cls = "mfc-sched__pill" + (i === 0 ? " mfc-sched__pill--next" : "");
      var note = i === 0 ? " <span>(ближайшая)</span>" : "";
      return '<span class="' + cls + '">' + g.label.replace(/ \((Сб)\)/, ' <span>($1)</span>') + note + "</span>";
    }).join("");
  }
};

document.addEventListener("DOMContentLoaded", function () {
  try { window.mafcRenderSite(); } catch (e) {}
});
