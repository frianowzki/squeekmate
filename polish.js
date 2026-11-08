"use strict";
(function () {
  function $(id) { return document.getElementById(id); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var dot = $("liveDot");
  var liveText = $("liveText");
  function syncLive() {
    if (!dot || !liveText) return;
    var off = dot.classList.contains("off");
    var pulse = dot.classList.contains("pulse");
    liveText.textContent = off
      ? "Squeekchain API unreachable"
      : pulse
        ? "Squeekchain API live, wheel turning"
        : "Squeekchain API live";
  }
  if (dot && window.MutationObserver) {
    new MutationObserver(syncLive).observe(dot, { attributes: true, attributeFilter: ["class"] });
  }
  syncLive();

  function visualSlides(deck) {
    return Array.prototype.slice.call(deck.children).sort(function (a, b) {
      return a.offsetLeft - b.offsetLeft;
    });
  }
  function scrollToSlide(deck, slide) {
    if (!deck || !slide) return;
    var left = slide.offsetLeft - (deck.firstElementChild ? visualSlides(deck)[0].offsetLeft : 0);
    deck.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
  }
  document.querySelectorAll(".deckdots").forEach(function (dots) {
    var deck = dots.previousElementSibling;
    if (!deck) return;
    Array.prototype.forEach.call(dots.children, function (btn, i) {
      btn.addEventListener("click", function () {
        scrollToSlide(deck, visualSlides(deck)[i]);
      });
    });
  });

  var visit = $("visitId");
  if (visit) {
    visit.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        $("btnVisit").click();
      }
    });
  }

  var addr = $("wAddr");
  if (addr) {
    addr.setAttribute("role", "button");
    addr.setAttribute("tabindex", "0");
    addr.setAttribute("aria-label", "Copy wallet address");
    function markCopied() {
      addr.setAttribute("data-copied", "true");
      window.setTimeout(function () { addr.removeAttribute("data-copied"); }, 1400);
    }
    function copyAddr() {
      var text = (addr.textContent || "").replace(/Copied/g, "").trim();
      if (!/^0x[0-9a-fA-F]{40}$/.test(text)) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(markCopied).catch(function () {});
      }
    }
    addr.addEventListener("click", copyAddr);
    addr.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyAddr();
      }
    });
  }

  var themePop = $("themePop");
  if (themePop) {
    themePop.addEventListener("keydown", function (e) {
      var horizontal = e.key === "ArrowLeft" || e.key === "ArrowRight";
      var vertical = e.key === "ArrowUp" || e.key === "ArrowDown";
      if (!horizontal && !vertical) return;
      var buttons = themePop.querySelectorAll(".themebtn");
      if (!buttons.length) return;
      var idx = 0;
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i] === document.activeElement) idx = i;
      }
      var next = idx + (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? 3 : -3);
      if (next < 0 || next >= buttons.length) return;
      e.preventDefault();
      buttons[next].focus();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    var el = document.activeElement;
    var tag = el && el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || (el && el.isContentEditable)) return;
    if (themePop && !themePop.classList.contains("hidden") && themePop.contains(el)) return;

    var petOn = $("view-pet") && $("view-pet").classList.contains("on");
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (petOn && (key === "a" || key === "c" || key === "b") && typeof selectCare === "function" && typeof care === "function") {
      e.preventDefault();
      if (key === "a") selectCare(selIdx - 1);
      else if (key === "c") selectCare(selIdx + 1);
      else care(careKinds[selIdx]);
      return;
    }

    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var view = document.querySelector(".view.on");
    var dots = view && view.querySelector(".deckdots");
    var deck = dots && dots.previousElementSibling;
    if (!dots || !deck || window.getComputedStyle(dots).display === "none") return;
    var width = deck.clientWidth || 1;
    var slides = visualSlides(deck);
    var origin = slides.length ? slides[0].offsetLeft : 0;
    var index = Math.round((deck.scrollLeft) / width) + (e.key === "ArrowRight" ? 1 : -1);
    var slide = slides[index];
    if (!slide) return;
    e.preventDefault();
    deck.scrollTo({ left: slide.offsetLeft - origin, behavior: reduce ? "auto" : "smooth" });
  });
})();
