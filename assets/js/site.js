/* Mensajes de Dios del Corazón — shared site chrome, cart, i18n
   Loaded on every page. Cart/checkout are client-side (localStorage) demo
   state — wire to a real payment/ESP/download backend before launch. */
(function(){
  "use strict";

  var DICT = {
    "search":{es:"Buscar", en:"Search"},
    "cart":{es:"Carrito", en:"Cart"},
    "menu":{es:"Menú", en:"Menu"},
    "footer.explore":{es:"Explorar", en:"Explore"},
    "footer.store":{es:"Tienda", en:"Store"},
    "footer.support":{es:"Ayuda", en:"Support"},
    "footer.faq":{es:"Preguntas frecuentes", en:"FAQ"},
    "footer.privacy":{es:"Privacidad", en:"Privacy"},
    "footer.terms":{es:"Términos", en:"Terms"},
    "footer.search":{es:"Buscar", en:"Search"},
    "footer.account":{es:"Mi cuenta", en:"My account"},
    "footer.newsletter.title":{es:"Un mensaje para tu corazón", en:"A message for your heart"},
    "footer.newsletter.body":{es:"Recibe una reflexión breve cada semana — sin ruido, sin prisa.", en:"A short reflection in your inbox each week — no noise, no rush."},
    "footer.newsletter.placeholder":{es:"Tu correo electrónico", en:"Your email"},
    "footer.newsletter.cta":{es:"Suscribirme", en:"Subscribe"},
    "footer.rights":{es:"Todos los derechos reservados.", en:"All rights reserved."},
    "nav.spanish":{es:"Edición en español", en:"Spanish edition"},
    "nav.english":{es:"Edición en inglés", en:"English edition"},
    "footer.books":{es:"El libro", en:"The Book"},
    "footer.author":{es:"Autora", en:"Author"},
    "footer.blog":{es:"Blog", en:"Blog"},
    "footer.reader":{es:"Lector", en:"Reader"},
    "footer.devotionals":{es:"Devocionales", en:"Devotionals"},
    "footer.community":{es:"Comunidad", en:"Community"},
    "footer.prayer":{es:"Peticiones de oración", en:"Prayer requests"},
    "footer.newsletter.nav":{es:"Boletín", en:"Newsletter"},
    "footer.cookies":{es:"Cookies", en:"Cookie policy"}
  };

  function getLang(){
    // Language is defined by the URL architecture (/es/* vs /en/*), not by a
    // stored preference — otherwise EN pages get their lang attribute
    // overwritten to "es" at runtime. localStorage is only a fallback for
    // pages outside the language folders (the root redirect page).
    if(location.pathname.indexOf("/en/") > -1) return "en";
    if(location.pathname.indexOf("/es/") > -1) return "es";
    return localStorage.getItem("mdc-lang") || "es";
  }
  function setLang(l){ localStorage.setItem("mdc-lang", l); applyLang(l); }

  function applyLang(lang){
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "es");
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      var entry = DICT[key];
      if(entry && entry[lang]) el.textContent = entry[lang];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){
      var key = el.getAttribute("data-i18n-placeholder");
      var entry = DICT[key];
      if(entry && entry[lang]) el.setAttribute("placeholder", entry[lang]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function(el){
      var key = el.getAttribute("data-i18n-aria");
      var entry = DICT[key];
      if(entry && entry[lang]) el.setAttribute("aria-label", entry[lang]);
    });
    document.querySelectorAll(".lang-toggle button").forEach(function(btn){
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  /* Header/footer are static HTML baked into every page (bilingual URL
     architecture: /es/*.html and /en/*.html each carry their own
     in-language chrome + real cross-language links) — this function used
     to overwrite that markup with a JS-generated single-language version.
     It no longer touches #site-header/#site-footer content; it only wires
     up the interactive bits that live inside the already-static markup. */
  function mountChrome(){
    wireChrome();
    applyLang(getLang());
    renderCartBadge();
  }

  function wireChrome(){
    var toggle = document.getElementById("menu-toggle");
    var mnav = document.getElementById("mobile-nav");
    if(toggle && mnav){
      toggle.addEventListener("click", function(){
        var open = mnav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ---------------- cart ---------------- */
  var CART_KEY = "mdc-cart";
  function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; } }
  function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCartBadge(); }
  function cartCount(c){ c = c || getCart(); return c.reduce(function(s,i){ return s + i.qty; }, 0); }
  function addToCart(item){
    var c = getCart();
    var existing = c.find(function(i){ return i.id === item.id; });
    if(existing){ existing.qty += (item.qty || 1); }
    else{ c.push({ id:item.id, title:item.title, edition:item.edition, format:item.format, price:item.price, qty:item.qty || 1 }); }
    saveCart(c);
  }
  function removeFromCart(id){ saveCart(getCart().filter(function(i){ return i.id !== id; })); }
  function setQty(id, qty){
    var c = getCart();
    var it = c.find(function(i){ return i.id === id; });
    if(it){ it.qty = Math.max(1, qty); }
    saveCart(c);
  }
  function cartSubtotal(c){ c = c || getCart(); return c.reduce(function(s,i){ return s + i.price*i.qty; }, 0); }
  function renderCartBadge(){
    var n = cartCount();
    document.querySelectorAll("#cart-badge, .cart-badge").forEach(function(b){
      b.textContent = n; b.setAttribute("data-count", n);
    });
  }

  var COUPONS = { "GRACIA10": .10, "PAZ20": .20 };
  function applyCoupon(code){
    var pct = COUPONS[(code||"").trim().toUpperCase()];
    return pct || 0;
  }

  function fmtUSD(n){ return "$" + n.toFixed(2); }

  window.MDC = {
    mountChrome: mountChrome,
    getLang: getLang, setLang: setLang, applyLang: applyLang,
    getCart:getCart, addToCart:addToCart, removeFromCart:removeFromCart, setQty:setQty,
    cartCount:cartCount, cartSubtotal:cartSubtotal, applyCoupon:applyCoupon, fmtUSD:fmtUSD
  };

  document.addEventListener("DOMContentLoaded", mountChrome);
})();
