/* Mensajes de Dios del Corazón — sample-chapter reader
   Free preview reader: five chapters unlocked, remainder shown as
   locked previews with a purchase CTA (full book requires purchase). */
(function(){
  "use strict";

  var CHAPTERS = {
    es: [
      { id:1, title:"Capítulo 1 — La primera luz", locked:false,
        body:["Antes de que puedas ver el camino completo, Dios ya está caminando en él contigo. Esta primera reflexión no es sobre tener todas las respuestas — es sobre aprender a confiar en la mano que sostiene la tuya en la oscuridad de la madrugada.",
              "Cuando Lyanette escribió estas líneas, estaba sentada junto a una ventana esperando que amaneciera después de una noche larga. \"No sabía qué traería el día\", escribe, \"pero sabía que no lo enfrentaría sola.\"",
              "Hoy, tómate un momento antes de seguir. Respira. Permite que esta primera luz — pequeña, apenas visible — te recuerde que no caminas sola."] },
      { id:2, title:"Capítulo 2 — Gracia para el cansancio", locked:false,
        body:["Hay un cansancio que el descanso no cura — el cansancio del alma que carga más de lo que puede sostener. A este cansancio, Dios no responde con exigencia sino con gracia.",
              "\"Vengan a mí todos los que están cansados y cargados, y yo les daré descanso\" no es una invitación condicional. Es una promesa abierta, hoy, para ti, exactamente como estás."] },
      { id:3, title:"Capítulo 3 — Cuando la oración se siente vacía", locked:false,
        body:["A veces oramos y sentimos que las palabras caen al suelo antes de llegar al cielo. Este capítulo es una carta para esos días — los días en que la fe se siente más como una decisión que como un sentimiento.",
              "Dios no mide tu oración por su elocuencia sino por su honestidad."] },
      { id:4, title:"Capítulo 4 — El corazón que sana despacio", locked:false,
        body:["La sanidad rara vez llega de una vez. Llega en capas, como la marea — un poco hoy, un poco mañana, y a veces, un retroceso que no significa que hayas fallado.",
              "Este capítulo camina contigo a través de esa lentitud, recordándote que Dios no tiene prisa contigo, así que tú tampoco deberías tenerla contigo misma."] },
      { id:5, title:"Capítulo 5 — Una carta a tu corazón de hoy", locked:false,
        body:["Si nadie te lo ha dicho hoy: eres vista, eres amada, y lo que sientes ahora mismo no es el final de tu historia.",
              "Esta es la última reflexión de tu vista previa. Las siguientes treinta y cinco páginas del devocional te esperan en la edición completa."] },
      { id:6, title:"Capítulo 6 — Paz en la espera", locked:true, excerpt:"La espera no es tiempo perdido — es tiempo donde Dios trabaja en lo que no puedes ver todavía…" },
      { id:7, title:"Capítulo 7 — Fe del tamaño de un día", locked:true, excerpt:"No se te pide fe para todo el año. Solo para hoy…" },
      { id:8, title:"Capítulo 8 — Cuando Dios parece callado", locked:true, excerpt:"El silencio de Dios no es ausencia — es, muchas veces, una invitación a escuchar de otra manera…" },
      { id:9, title:"Capítulo 9 — Restaurar lo que se quebró", locked:true, excerpt:"Hay una diferencia entre lo que se rompe y lo que termina. Dios especializa en la primera…" },
      { id:10, title:"Capítulo 10 — Caminar en gratitud", locked:true, excerpt:"La gratitud no espera a que todo esté bien. Empieza donde tú estás…" }
    ],
    en: [
      { id:1, title:"Chapter 1 — The First Light", locked:false,
        body:["Before you can see the whole path, God is already walking it with you. This first reflection isn't about having every answer — it's about learning to trust the hand holding yours in the dark hours before dawn.",
              "When Lyanette wrote these lines, she was sitting by a window waiting for morning after a long night. \"I didn't know what the day would bring,\" she writes, \"but I knew I wouldn't face it alone.\"",
              "Today, take a moment before you continue. Breathe. Let this first light — small, barely visible — remind you that you do not walk alone."] },
      { id:2, title:"Chapter 2 — Grace for the Weary", locked:false,
        body:["There is a tiredness rest cannot cure — the tiredness of a soul carrying more than it can hold. To this tiredness, God answers not with demand but with grace.",
              "\"Come to me, all who are weary and burdened, and I will give you rest\" is not a conditional invitation. It is an open promise, today, for you, exactly as you are."] },
      { id:3, title:"Chapter 3 — When Prayer Feels Empty", locked:false,
        body:["Sometimes we pray and feel the words fall to the ground before reaching heaven. This chapter is a letter for those days — the days faith feels more like a decision than a feeling."] },
      { id:4, title:"Chapter 4 — A Heart That Heals Slowly", locked:false,
        body:["Healing rarely arrives all at once. It comes in layers, like the tide — a little today, a little tomorrow, and sometimes a step back that doesn't mean you have failed."] },
      { id:5, title:"Chapter 5 — A Letter to Your Heart Today", locked:false,
        body:["If no one has told you today: you are seen, you are loved, and what you feel right now is not the end of your story.",
              "This is the last reflection in your preview. Thirty-five more pages of the devotional are waiting in the full edition."] },
      { id:6, title:"Chapter 6 — Peace in the Waiting", locked:true, excerpt:"Waiting is not lost time — it is time where God is working on what you cannot see yet…" },
      { id:7, title:"Chapter 7 — Faith the Size of a Day", locked:true, excerpt:"You are not asked for faith for the whole year. Only for today…" },
      { id:8, title:"Chapter 8 — When God Seems Silent", locked:true, excerpt:"God's silence is not absence — it is, often, an invitation to listen differently…" },
      { id:9, title:"Chapter 9 — Restoring What Broke", locked:true, excerpt:"There is a difference between what breaks and what ends. God specializes in the former…" },
      { id:10, title:"Chapter 10 — Walking in Gratitude", locked:true, excerpt:"Gratitude doesn't wait for everything to be fine. It starts where you are…" }
    ]
  };

  var state = { edition:"es", chapter:1, fontStep:0, dark:false };

  function bookmarksKey(){ return "mdc-bookmarks"; }
  function getBookmarks(){ try{ return JSON.parse(localStorage.getItem(bookmarksKey())) || []; }catch(e){ return []; } }
  function toggleBookmark(id){
    var b = getBookmarks();
    var key = state.edition+"-"+id;
    var idx = b.indexOf(key);
    if(idx>-1) b.splice(idx,1); else b.push(key);
    localStorage.setItem(bookmarksKey(), JSON.stringify(b));
    render();
  }
  function isBookmarked(id){ return getBookmarks().indexOf(state.edition+"-"+id) > -1; }

  function chapters(){ return CHAPTERS[state.edition]; }
  function findChapter(id){ return chapters().find(function(c){ return c.id === id; }); }

  function renderToc(filter){
    var list = document.getElementById("reader-toc");
    var q = (filter||"").trim().toLowerCase();
    list.innerHTML = chapters().filter(function(c){
      return !q || c.title.toLowerCase().indexOf(q) > -1;
    }).map(function(c){
      var active = c.id === state.chapter ? " active" : "";
      var lockIcon = c.locked ? '<svg viewBox="0 0 24 24" width="11" height="11" style="vertical-align:-1px;margin-left:4px;"><rect x="5" y="11" width="14" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' : "";
      return '<li><a href="#" class="'+active.trim()+'" data-ch="'+c.id+'">'+c.title.replace(/^Cap[íi]tulo \d+ — |^Chapter \d+ — /,"")+'<span class="muted" style="font-size:11px;">'+(c.id)+lockIcon+'</span></a></li>';
    }).join("");
    list.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(e){ e.preventDefault(); state.chapter = parseInt(a.getAttribute("data-ch"),10); render(); window.scrollTo({top:document.getElementById("reader-toolbar").offsetTop, behavior:"smooth"}); });
    });
  }

  function renderText(){
    var c = findChapter(state.chapter);
    var el = document.getElementById("reader-article");
    var bm = isBookmarked(c.id);
    if(!c.locked){
      el.innerHTML =
        '<div class="running-head" style="border:0;padding:0 0 var(--space-2);">'+
          '<span>'+(state.edition==="en"?"Sample chapter":"Capítulo de muestra")+' · '+c.id+' / '+chapters().length+'</span>'+
          '<button class="bookmark-flag'+(bm?" active":"")+'" id="bookmark-btn" aria-label="Bookmark">'+
            '<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px;margin-right:5px;"><path d="M6 3h12v18l-6-4-6 4V3Z" fill="'+(bm?"currentColor":"none")+'" stroke="currentColor" stroke-width="1.6"/></svg>'+
            (bm?(state.edition==="en"?"Bookmarked":"Marcado"):(state.edition==="en"?"Bookmark":"Marcar"))+
          '</button>'+
        '</div>'+
        '<h2>'+c.title+'</h2>'+
        c.body.map(function(p){ return '<p>'+p+'</p>'; }).join("");
    } else {
      el.innerHTML =
        '<div class="running-head" style="border:0;padding:0 0 var(--space-2);"><span>'+(state.edition==="en"?"Locked chapter":"Capítulo bloqueado")+' · '+c.id+' / '+chapters().length+'</span></div>'+
        '<h2>'+c.title+'</h2>'+
        '<p class="muted" style="font-style:italic;">'+c.excerpt+'</p>'+
        '<div class="quote-card" style="margin-top:var(--space-4);text-align:center;">'+
          '<p style="margin-bottom:var(--space-2);">'+(state.edition==="en"?"Unlock the full devotional to keep reading.":"Desbloquea el devocional completo para seguir leyendo.")+'</p>'+
          '<a class="btn btn-primary" href="store.html">'+(state.edition==="en"?"Unlock full book":"Desbloquear libro completo")+'</a>'+
        '</div>';
    }
    var bmBtn = document.getElementById("bookmark-btn");
    if(bmBtn) bmBtn.addEventListener("click", function(){ toggleBookmark(c.id); });
    updateProgress();
  }

  function updateProgress(){
    var idx = chapters().findIndex(function(c){ return c.id === state.chapter; });
    var pct = Math.round(((idx+1) / chapters().length) * 100);
    document.getElementById("reader-progress-bar").style.width = pct + "%";
    document.getElementById("reader-progress-label").textContent = pct + "%";
  }

  function renderToolbarLabels(){
    document.getElementById("edition-toggle").querySelectorAll("button").forEach(function(b){
      b.classList.toggle("active", b.getAttribute("data-ed") === state.edition);
    });
    var article = document.getElementById("reader-article");
    article.classList.remove("font-lg","font-xl");
    if(state.fontStep===1) article.classList.add("font-lg");
    if(state.fontStep===2) article.classList.add("font-xl");
    document.documentElement.classList.toggle("reader-dark", state.dark);
    document.getElementById("dark-toggle").setAttribute("aria-pressed", state.dark ? "true" : "false");
    var sunSvg = '<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px;margin-right:5px;"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="1.6"/></svg>';
    var moonSvg = '<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px;margin-right:5px;"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    document.getElementById("dark-toggle").innerHTML = state.dark ? (sunSvg + (state.edition==="en"?"Light":"Claro")) : (moonSvg + (state.edition==="en"?"Dark":"Oscuro"));
  }

  function render(){
    renderToc(document.getElementById("reader-search").value);
    renderText();
    renderToolbarLabels();
  }

  document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("edition-toggle").addEventListener("click", function(e){
      var btn = e.target.closest("button[data-ed]");
      if(!btn) return;
      state.edition = btn.getAttribute("data-ed");
      state.chapter = 1;
      render();
    });
    document.getElementById("reader-search").addEventListener("input", function(e){ renderToc(e.target.value); });
    document.getElementById("font-minus").addEventListener("click", function(){ state.fontStep = Math.max(0, state.fontStep-1); renderToolbarLabels(); });
    document.getElementById("font-plus").addEventListener("click", function(){ state.fontStep = Math.min(2, state.fontStep+1); renderToolbarLabels(); });
    document.getElementById("dark-toggle").addEventListener("click", function(){ state.dark = !state.dark; renderToolbarLabels(); });
    document.getElementById("prev-chapter").addEventListener("click", function(){ var i = chapters().findIndex(function(c){return c.id===state.chapter;}); if(i>0){ state.chapter = chapters()[i-1].id; render(); } });
    document.getElementById("next-chapter").addEventListener("click", function(){ var i = chapters().findIndex(function(c){return c.id===state.chapter;}); if(i<chapters().length-1){ state.chapter = chapters()[i+1].id; render(); } });
    document.getElementById("sidebar-toggle").addEventListener("click", function(){ document.getElementById("reader-sidebar").classList.toggle("open-mobile"); });
    render();
  });
})();
