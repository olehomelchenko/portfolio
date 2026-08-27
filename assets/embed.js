/* Вбудовує графіки у сторінку.
 *
 * Цей файл правити не треба. Графік ставиться в тексті роботи одним
 * рядком, там, де він потрібен:
 *
 *   ![Підпис](specs/файл.json)                — специфікація Vega-Lite
 *   ![Підпис](https://public.tableau.com/…)   — графік Tableau Public
 *   ```vega-lite … ```                        — специфікація просто в тексті
 *
 * Два таких рядки поруч, без порожнього рядка між ними, стають парою
 * графіків в один ряд. У дужках після адреси можна дописати wide
 * (на всю ширину) і число (висота рамки Tableau).
 *
 * Блок із помилкою показує підказку і не ламає решту сторінки.
 */
(function () {
  "use strict";

  /* Бібліотеки Vega-Lite. Вантажаться, лише коли на сторінці є
     специфікація: сторінці з самим Tableau вони не потрібні. */
  var VEGA = [
    "https://cdn.jsdelivr.net/npm/vega@5",
    "https://cdn.jsdelivr.net/npm/vega-lite@5",
    "https://cdn.jsdelivr.net/npm/vega-embed@6"
  ];

  function box(el, kind, title, hint) {
    var d = document.createElement("div");
    d.className = "viz-msg viz-msg--" + kind;
    d.innerHTML = "<b></b><span></span>";
    d.querySelector("b").textContent = title;
    d.querySelector("span").textContent = hint || "";
    el.replaceChildren(d);
  }

  /* ── що це за адреса ───────────────────────────────────────────── */

  function isSpec(src) { return /\.json(\?|#|$)/i.test(src || ""); }
  function isTableau(src) { return /public\.tableau\.com/i.test(src || ""); }
  function isChart(src) { return isSpec(src) || isTableau(src); }

  /* ── Tableau Public ────────────────────────────────────────────── */

  /* Адреса графіка Tableau Public → адреса, яку можна вбудувати.
     Приймає і те, що видно в адресному рядку, і готову адресу /views/. */
  function tableauEmbedUrl(raw) {
    var url = String(raw).trim().split("?")[0];
    var m = url.match(/[#!/]*\/(?:viz|views|vizhome)\/([^/]+)\/([^/?#]+)/);
    if (!m) return null;

    /* tabs=no обов'язковий: без нього рамка показує всі аркуші книги,
       разом із чернетками, і будь-хто може в них клацнути. */
    return "https://public.tableau.com/views/" + m[1] + "/" + m[2] +
           "?:showVizHome=no&:embed=y&:tabs=no&:display_count=no&:toolbar=no";
  }

  function mountTableau(el) {
    var raw = el.getAttribute("data-tableau");
    var src = tableauEmbedUrl(raw);

    if (!src) {
      box(el, "warn", "Не вдалося прочитати адресу Tableau",
          "Має бути адреса вигляду " +
          "public.tableau.com/app/profile/…/viz/Книга/Аркуш. " +
          "Відкрийте графік на Tableau Public і скопіюйте адресу з адресного рядка.");
      return;
    }

    var frame = document.createElement("iframe");
    frame.className = "viz-frame";
    frame.src = src;
    frame.loading = "lazy";
    frame.title = "Графік Tableau Public";
    frame.setAttribute("allowfullscreen", "");
    frame.style.height = (el.getAttribute("data-height") || 620) + "px";

    /* Пряме посилання під рамкою. Усередині рамки Tableau малює власну
       сторінку помилки, якої ми звідси не бачимо. Посилання дає читачеві
       шлях до графіка, а автору показує, чи жива адреса. */
    var link = document.createElement("p");
    link.className = "viz-link";
    var a = document.createElement("a");
    a.href = String(raw).trim();
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Відкрити на Tableau Public";
    link.appendChild(a);

    el.replaceChildren(frame, link);
  }

  /* ── Vega-Lite ─────────────────────────────────────────────────── */

  var vegaReady = null;

  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = ok;
      s.onerror = function () { fail(new Error("cdn: " + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureVega() {
    if (typeof window.vegaEmbed === "function") return Promise.resolve();
    if (!vegaReady) {
      vegaReady = VEGA.reduce(function (chain, src) {
        return chain.then(function () { return loadScript(src); });
      }, Promise.resolve());
    }
    return vegaReady;
  }

  /* Специфікація без width займає всю ширину колонки, тому та сама
     робота читається і на телефоні. Для facet, concat і repeat так
     не можна: там ширину рахує сама Vega-Lite. */
  function fitToColumn(spec) {
    if (!spec || typeof spec !== "object") return spec;
    if ("width" in spec) return spec;
    if (spec.facet || spec.hconcat || spec.vconcat || spec.concat || spec.repeat) return spec;
    spec.width = "container";
    return spec;
  }

  function specSource(el) {
    if (el.inlineSpec) return Promise.resolve(el.inlineSpec);

    var path = el.getAttribute("data-spec");
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("404");
      return r.json();
    });
  }

  function mountSpec(el) {
    var path = el.getAttribute("data-spec") || "специфікація в тексті роботи";

    ensureVega()
      .then(function () { return specSource(el); })
      .then(function (spec) {
        return window.vegaEmbed(el, fitToColumn(spec), { actions: false, renderer: "svg" });
      })
      .then(function (res) { el.vegaView = res && res.view; })
      .catch(function (err) {
        var msg = String((err && err.message) || err);

        if (/^cdn:/.test(msg)) {
          box(el, "warn", "Бібліотека Vega-Lite не завантажилась",
              "Перевірте інтернет і оновіть сторінку.");
          return;
        }
        var hint;
        if (/404|fetch|load|network/i.test(msg)) {
          hint = "Файл " + path + " не знайдено. Перевірте, що він лежить у теці " +
                 "specs/ і що ім'я збігається. Великі й малі літери мають значення.";
        } else if (/JSON|token|Unexpected/i.test(msg)) {
          hint = "Специфікація не читається як JSON. Найчастіша причина — зайва " +
                 "або пропущена кома. Вставте специфікацію у Vega Editor: він " +
                 "покаже, де саме.";
        } else {
          hint = "Vega-Lite відмовилась малювати цю специфікацію: " + msg +
                 ". Перевірте її у Vega Editor.";
        }
        box(el, "warn", "Графік не вдалося показати", hint);
      });
  }

  /* ── графіки, поставлені в тексті ──────────────────────────────── */

  function vizFor(src, height) {
    var el = document.createElement("div");
    el.className = "viz";
    if (height) el.setAttribute("data-height", height);
    if (isTableau(src)) el.setAttribute("data-tableau", src);
    else el.setAttribute("data-spec", src);
    return el;
  }

  function figureFor(node, caption, wide) {
    var fig = document.createElement("figure");
    fig.className = "chart" + (wide ? " wide" : "");
    fig.appendChild(node);
    if (caption) {
      var cap = document.createElement("figcaption");
      cap.textContent = caption;
      fig.appendChild(cap);
    }
    return fig;
  }

  /* Підпис у лапках після адреси: wide — на всю ширину, число —
     висота рамки Tableau. ![Графік](адреса "wide 900") */
  function readOptions(title) {
    var o = {};
    String(title || "").split(/\s+/).forEach(function (word) {
      if (/^wide$/i.test(word)) o.wide = true;
      else if (/^\d+$/.test(word)) o.height = word;
    });
    return o;
  }

  function figureForImage(img) {
    var o = readOptions(img.getAttribute("title"));
    return figureFor(vizFor(img.getAttribute("src"), o.height), img.getAttribute("alt"), o.wide);
  }

  function chartImages(node) {
    return [].slice.call(node.querySelectorAll("img")).filter(function (img) {
      return isChart(img.getAttribute("src"));
    });
  }

  function upgradeImages(root) {
    /* Спочатку абзаци, у яких стоять самі графіки. Два графіки в
       одному абзаці — це рядок із двох: так їх ставлять поруч. */
    [].slice.call(root.querySelectorAll("p")).forEach(function (p) {
      var imgs = chartImages(p);
      if (!imgs.length) return;

      var alone = imgs.length === p.children.length && p.textContent.trim() === "";
      var figs = imgs.map(figureForImage);

      if (!alone) {
        imgs.forEach(function (img, i) { img.replaceWith(figs[i]); });
        return;
      }
      if (figs.length === 1) {
        p.replaceWith(figs[0]);
        return;
      }

      var row = document.createElement("div");
      row.className = "chart-row";
      figs.forEach(function (f) { row.appendChild(f); });
      p.replaceWith(row);
    });

    /* Графіки поза абзацом: у списку, у таблиці, у цитаті. */
    chartImages(root).forEach(function (img) {
      img.replaceWith(figureForImage(img));
    });
  }

  /* Специфікація, написана просто в тексті роботи:
     ```vega-lite … ``` */
  function upgradeFences(root) {
    var blocks = [].slice.call(root.querySelectorAll('[class*="language-vega-lite"]'));

    blocks.forEach(function (el) {
      /* Підсвітка коду загортає код у кілька рівнів. Беремо
         найзовнішній блок: його ми і замінюємо на графік. */
      var block = el.closest("div[class*='language-vega-lite']") ||
                  el.closest("pre") || el;
      if (block.dataset.chartDone) return;
      block.dataset.chartDone = "1";

      var code = el.matches("code") ? el : (el.querySelector("code") || el);
      var viz = document.createElement("div");
      viz.className = "viz";
      var fig = figureFor(viz, null, false);
      block.replaceWith(fig);

      try {
        viz.inlineSpec = JSON.parse(code.textContent);
      } catch (e) {
        box(viz, "warn", "Специфікація в тексті не читається як JSON",
            "Найчастіша причина — зайва або пропущена кома. Вставте її у " +
            "Vega Editor: він покаже, де саме. Повідомлення браузера: " +
            String(e.message || e));
      }
    });
  }

  /* ── бічна панель ──────────────────────────────────────────────── */

  /* Підсвічує в бічній панелі ту роботу, яка зараз на екрані. */
  function followScroll() {
    var links = document.querySelectorAll(".side-works a");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var pairs = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el) pairs.push({ a: a, el: el });
    });

    var seen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
      });
      pairs.forEach(function (p) { p.a.classList.remove("here"); });
      for (var i = 0; i < pairs.length; i++) {
        if (seen.has(pairs[i].el)) { pairs[i].a.classList.add("here"); break; }
      }
    }, { rootMargin: "-20% 0px -70% 0px" });

    pairs.forEach(function (p) { io.observe(p.el); });
  }

  /* Клік у бічній панелі або адреса з #якорем мають розгортати роботу,
     навіть якщо читач її згорнув. */
  function openOnJump() {
    function openHash() {
      var id = location.hash.slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el && el.tagName === "DETAILS") el.open = true;
    }
    openHash();
    window.addEventListener("hashchange", openHash);
    document.querySelectorAll('.side-works a').forEach(function (a) {
      a.addEventListener("click", function () {
        var el = document.getElementById(a.getAttribute("href").slice(1));
        if (el && el.tagName === "DETAILS") el.open = true;
      });
    });
  }

  /* Одна кнопка: згорнути всі роботи або розгорнути назад. */
  function foldAll() {
    var works = document.querySelectorAll("details.work");
    var side = document.querySelector(".side");
    if (!works.length || !side) return;

    var btn = document.createElement("button");
    btn.className = "side-fold";
    btn.type = "button";
    side.appendChild(btn);

    function label() {
      var open = document.querySelectorAll("details.work[open]").length;
      btn.textContent = open ? "Згорнути всі" : "Розгорнути всі";
    }

    btn.addEventListener("click", function () {
      var open = document.querySelectorAll("details.work[open]").length;
      works.forEach(function (w) { w.open = open === 0; });
      label();
    });

    works.forEach(function (w) { w.addEventListener("toggle", label); });
    label();
  }

  /* ── старт ─────────────────────────────────────────────────────── */

  function mountAll() {
    var main = document.querySelector("main") || document.body;

    try {
      upgradeFences(main);
      upgradeImages(main);
    } catch (e) {
      /* Розпізнавання графіків у тексті не має ламати решту сторінки. */
    }

    document.querySelectorAll(".viz").forEach(function (el) {
      try {
        if (el.hasAttribute("data-tableau")) mountTableau(el);
        else if (el.inlineSpec || el.hasAttribute("data-spec")) mountSpec(el);
      } catch (e) {
        box(el, "warn", "Цей блок не вдалося показати", String(e.message || e));
      }
    });

    followScroll();
    openOnJump();
    foldAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
