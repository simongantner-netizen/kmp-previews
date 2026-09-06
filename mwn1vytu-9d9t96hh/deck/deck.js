/* =========================================================
   Kampagnons Präsentations-System – Deck-Engine

   Steuerung wie in PowerPoint, damit niemand umlernen muss:

     → ← Leertaste Bild↑ Bild↓   blättern
     Pos1 / Ende                  erste / letzte Folie
     Zahl + Enter                 direkt zu einer Folie
     F                            Vollbild an und aus
     B                            Blackout (Bild weg, Blick zurück in den Raum)
     O                            Übersicht - Modul anspringen
     Esc                          Übersicht oder Blackout schliessen
     Klick rechts / links         blättern
     Wischen                      blättern (Tablet)

   ?print im URL öffnet den Export-Modus: alle Reveals offen,
   kein Chrome, eine Folie pro Seite.
   ========================================================= */

(function () {
  'use strict';

  var stage   = document.getElementById('stage');
  var slides  = [].slice.call(document.querySelectorAll('.slide'));
  var bar     = document.getElementById('bar');
  var counter = document.getElementById('counter');
  var hint    = document.getElementById('hint');

  var isPrint  = new URLSearchParams(location.search).has('print');
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0;
  var going = 1;
  var firstShow = true;

  /* ---------------------------------------------------------------
     Lockup auf jede Folie klonen.
     Das Original-SVG, nie nachgebaut. Positiv und Negativ liegen
     beide im Markup, die CSS entscheidet nach Folientyp.
     --------------------------------------------------------------- */
  var cmSrc = document.getElementById('cornermark');
  if (cmSrc) {
    slides.forEach(function (s) {
      var c = cmSrc.cloneNode(true);
      c.removeAttribute('id');
      c.className = 'cm';
      s.appendChild(c);
    });
    cmSrc.remove();
  }

  /* ---------------------------------------------------------------
     Wörter einpacken für data-rise.

     Ein Wort ist hier alles zwischen zwei Leerzeichen - egal, aus
     wie vielen Knoten es besteht. «<span class="hl">Namen</span>,»
     ist EIN Wort und bekommt EIN Paket.

     Warum das zählt: die Pakete sind inline-block, und zwischen zwei
     inline-blocks darf der Browser umbrechen. Wer das Satzzeichen in
     ein eigenes Paket legt, bekommt Zeilen, die mit einem Komma
     anfangen. Am 19.08.2026 am Gianluca-Deck aufgeschlagen
     («Nenne drei Menschen mit Namen / , die dich buchen würden») und
     hier repariert, weil es jede Folie mit Marker plus Satzzeichen
     trifft - und das sind fast alle.
     --------------------------------------------------------------- */
  function wrap(parts, delayIndex) {
    var w  = document.createElement('span');
    var wi = document.createElement('span');
    w.className = 'w';
    wi.className = 'wi';
    wi.style.setProperty('--wd', (delayIndex * 45) + 'ms');
    parts.forEach(function (part) { wi.appendChild(part); });
    w.appendChild(wi);
    return w;
  }

  document.querySelectorAll('[data-rise]').forEach(function (el) {
    var nodes = [].slice.call(el.childNodes);
    var frag  = document.createDocumentFragment();
    var n = 0;
    var group = [];

    function flush() {
      if (!group.length) return;
      frag.appendChild(wrap(group, n++));
      group = [];
    }

    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { flush(); frag.appendChild(document.createTextNode(' ')); return; }
          group.push(document.createTextNode(part));
        });
      } else if (node.nodeName === 'BR') {
        flush();
        frag.appendChild(node);
      } else {
        group.push(node);
      }
    });
    flush();

    el.innerHTML = '';
    el.appendChild(frag);
  });

  /* ---------------------------------------------------------------
     Zahlen hochzählen. Nur für Zahlen, die etwas beweisen.
     Schweizer Schreibung: Apostroph als Tausendertrenner.
     --------------------------------------------------------------- */
  function swissNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    if (reduced || isPrint) { el.textContent = prefix + swissNum(target) + suffix; return; }

    var dur = 1100;
    var t0  = Date.now();

    /* Wanduhr statt Frame-Zeitstempel. Browser drosseln
       requestAnimationFrame, sobald das Fenster nicht vorne ist - und
       genau das ist der Normalfall beim Präsentieren, wenn das Deck auf
       dem Beamer läuft und der Fokus woanders liegt. Mit Frame-Zeit
       bliebe die Zahl bei 3 stehen. */
    function step() {
      var p = Math.min(1, (Date.now() - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + swissNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(step);

    /* Sicherheitsnetz: feuert kein einziger Frame, steht am Ende
       trotzdem die richtige Zahl da. Eine halb gezählte Kennzahl vor
       einem Kunden ist schlimmer als gar keine Animation. */
    setTimeout(function () {
      el.textContent = prefix + swissNum(target) + suffix;
    }, dur + 150);
  }

  /* ---------------------------------------------------------------
     Bühne auf das Fenster skalieren.
     Funktioniert im Fenster wie im Vollbild - beides ist nur eine
     andere innerWidth.
     --------------------------------------------------------------- */
  /* zoom statt transform: scale - siehe die Begründung in deck.css.
     Kurz: zoom legt das Layout in der Zielgrösse an, deshalb bleibt
     Schrift auch auf einem 4K-Beamer scharf. transform vergrössert
     ein fertig gerastertes Bild und macht sie weich.

     Der Rückfall auf transform ist für Browser ohne zoom-Unterstützung
     (Firefox vor 126). Dort sieht es aus wie vorher, statt gar nicht. */
  var kannZoom = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('zoom', '2');

  function fit() {
    var s = Math.min(innerWidth / 1920, innerHeight / 1080);
    if (kannZoom) {
      stage.style.zoom = s;
    } else {
      stage.style.transform = 'scale(' + s + ')';
    }
  }

  /* ---------------------------------------------------------------
     Blättern
     --------------------------------------------------------------- */
  function show(n) {
    var next = Math.max(0, Math.min(slides.length - 1, n));
    going = next >= i ? 1 : -1;
    i = next;

    stage.classList.toggle('back', going === -1);

    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });

    var dark = slides[i].classList.contains('ink') || slides[i].classList.contains('t-full');
    stage.classList.toggle('dark', dark);

    if (bar) bar.style.width = ((i + 1) / slides.length * 100) + '%';
    if (counter) {
      counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }
    /* Der Hinweis verschwindet beim ersten Blättern - aber nicht schon
       beim Aufbau der ersten Folie. show() läuft beim Start einmal
       selbst; würde hier unbedingt versteckt, hätte der Hinweis nie
       eine sichtbare Sekunde und niemand erführe von F und O. */
    if (hint && !firstShow) hint.classList.add('hide');
    firstShow = false;

    history.replaceState(null, '', '#' + (i + 1));

    slides[i].querySelectorAll('[data-count]').forEach(function (el) {
      setTimeout(function () { countUp(el); }, reduced ? 0 : 300);
    });

    /* Hintergrund-Videos laufen nur auf der aktiven Folie. Sonst
       dreht ein unsichtbares Video die ganze Präsentation lang mit
       und kostet Rechenzeit, die dem Blättern fehlt. */
    /* Auch die Logo- und Arbeitsvideos auf Referenzfolien laufen nur
       auf der aktiven Folie, und sie tragen deshalb KEIN `autoplay`:
       Sonst liefen alle beim Laden des Decks einmal durch,
       unsichtbar, und wer später hinblättert sieht nur noch das
       Standbild.
       Bei `prefers-reduced-motion` bleiben sie stehen - das Poster
       zeigt den Schlusszustand, die Folie sagt dasselbe. */
    slides.forEach(function (s, k) {
      s.querySelectorAll('.veil video, .ref-fig video').forEach(function (v) {
        if (k === i && !reduced) { v.currentTime = 0; starteVideo(v); }
        else { v.pause(); if (v.hasAttribute('data-ton')) tonSetzen(v, false); }
      });
    });

    markOverview();
    document.dispatchEvent(new CustomEvent('slidechange', { detail: { index: i, slide: slides[i] } }));
  }

  /* ---------------------------------------------------------------
     Vollbild
     --------------------------------------------------------------- */
  var fsBtn = document.createElement('button');
  fsBtn.className = 'fsbtn';
  fsBtn.type = 'button';
  fsBtn.textContent = 'VOLLBILD';
  document.body.appendChild(fsBtn);

  function inFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggleFullscreen() {
    var el = document.documentElement;
    try {
      if (!inFullscreen()) {
        var req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (!req) return;
        var p = req.call(el);
        /* Der Aufruf kann abgelehnt werden - eingebettet in einem
           iframe ohne Vollbild-Recht etwa. Dann still bleiben statt
           eine Fehlermeldung in die Konsole zu werfen. */
        if (p && p.catch) p.catch(function () {});
      } else {
        var ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) { var q = ex.call(document); if (q && q.catch) q.catch(function () {}); }
      }
    } catch (e) { /* nichts - Vollbild ist Komfort, kein Muss */ }
  }

  fsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleFullscreen();
  });

  /* Im Vollbild verschwindet der Knopf ganz, statt zu «FENSTER» zu
     wechseln. Simons Entscheid vom 17.08.2026: er geht mit Esc raus,
     und im Vollbild soll nichts auf der Folie stehen, was nicht zur
     Folie gehört. Der Weg hinein bleibt - der Knopf ist für alle, die
     die Taste F nicht kennen; der Weg hinaus braucht ihn nicht, weil
     Esc auf jedem System funktioniert. */
  function syncFsBtn() {
    fsBtn.hidden = inFullscreen();
    fit();
  }
  document.addEventListener('fullscreenchange', syncFsBtn);
  document.addEventListener('webkitfullscreenchange', syncFsBtn);

  /* ---------------------------------------------------------------
     Blackout und Übersicht
     --------------------------------------------------------------- */
  var black = document.createElement('div');
  black.className = 'blackout';
  document.body.appendChild(black);

  var ov = document.createElement('div');
  ov.className = 'overview';
  ov.innerHTML = '<h4>Übersicht – Folie anspringen</h4><div class="ov-grid"></div>';
  document.body.appendChild(ov);

  var ovGrid = ov.querySelector('.ov-grid');
  slides.forEach(function (s, k) {
    var item = document.createElement('div');
    item.className = 'ov-item';
    item.innerHTML = '<span class="n">' + String(k + 1).padStart(2, '0') + '</span>' +
                     '<span class="t"></span>';
    item.querySelector('.t').textContent = s.getAttribute('data-title') || 'Folie ' + (k + 1);
    item.addEventListener('click', function () { ov.classList.remove('on'); show(k); });
    ovGrid.appendChild(item);
  });

  function markOverview() {
    [].slice.call(ovGrid.children).forEach(function (el, k) {
      el.classList.toggle('is-current', k === i);
    });
  }

  /* ---------------------------------------------------------------
     Eingaben
     --------------------------------------------------------------- */
  var jump = '';
  var jumpTimer = null;

  addEventListener('keydown', function (e) {
    var k = e.key;

    if (/^[0-9]$/.test(k)) {
      jump += k;
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(function () { jump = ''; }, 1200);
      return;
    }
    if (k === 'Enter' && jump) {
      e.preventDefault();
      show(parseInt(jump, 10) - 1);
      jump = '';
      return;
    }

    if (['ArrowRight', ' ', 'PageDown', 'Enter'].indexOf(k) > -1) { e.preventDefault(); show(i + 1); return; }
    if (['ArrowLeft', 'PageUp', 'Backspace'].indexOf(k) > -1)     { e.preventDefault(); show(i - 1); return; }
    if (k === 'ArrowDown') { e.preventDefault(); show(i + 1); return; }
    if (k === 'ArrowUp')   { e.preventDefault(); show(i - 1); return; }
    if (k === 'Home') { show(0); return; }
    if (k === 'End')  { show(slides.length - 1); return; }

    if (k === 'f' || k === 'F') { e.preventDefault(); toggleFullscreen(); return; }
    if (k === 'b' || k === 'B') { e.preventDefault(); black.classList.toggle('on'); return; }
    if (k === 'o' || k === 'O') { e.preventDefault(); ov.classList.toggle('on'); markOverview(); return; }
    if (k === 'Escape') {
      if (ov.classList.contains('on')) { ov.classList.remove('on'); e.preventDefault(); }
      if (black.classList.contains('on')) { black.classList.remove('on'); }
      return;
    }
  });

  addEventListener('click', function (e) {
    if (ov.contains(e.target)) return;
    /* Ein Link im Deck darf nicht gleichzeitig blättern. Ohne diese Zeile
       öffnet ein Klick auf einen Absprung-Button das Ziel UND schaltet
       eine Folie weiter - man kommt zurück und steht woanders.

       Dasselbe gilt für Knöpfe, und das ist am 05.09.2026 teuer
       aufgefallen: Der Ton-Knopf schaltete den Ton ein und blätterte
       gleichzeitig weiter - wodurch die Engine das Video sofort wieder
       stummschaltete. Der Knopf sah aus, als würde er nicht
       funktionieren, dabei arbeitete er einwandfrei.
       Wer ein neues Bedienelement ins Deck setzt, prüft diese Zeile. */
    if (e.target.closest && e.target.closest('a[href], button')) return;
    if (black.classList.contains('on')) { black.classList.remove('on'); return; }
    show(e.clientX > innerWidth * 0.25 ? i + 1 : i - 1);
  });

  var touchX = null;
  addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  addEventListener('resize', fit);

  /* ---------------------------------------------------------------
     Die Spur

     Die Unterstreichung unter dem markierten Wort IST die Spur. Sie
     läuft gerade unter der restlichen Zeile weiter, wird erst nach
     dem letzten Wort rund und verlässt die Folie rechts.

     EIN Pfad, EINE Bewegung. Der erste Versuch am 05.09.2026 hatte
     zwei: den CSS-Marker und eine Linie, die danach ansetzte. Zwei
     Animationen aneinandergeklebt laufen nie synchron - beim
     Zurückblättern war die Spur längst da, während sich der Marker
     noch zeichnete. Deshalb übernimmt der Pfad jetzt auch die
     Unterstreichung, und der CSS-Marker wird auf diesem einen Wort
     abgeschaltet. Ohne JavaScript bleibt er stehen: erst wenn der
     Pfad steht, verschwindet er.

     Zwei Folien tragen dafür ein Attribut:
       data-spur="start"   die Spur geht - sie beginnt in der
                           Unterstreichung und verlässt die Folie.
       data-spur="ende"    die Spur kommt an - sie fällt von oben
                           herein, zieht in einem Bogen um den Text
                           und geht unten links wieder hinaus.

     Die zwei sind nicht dasselbe. Die Startfolie hängt am Marker:
     Der Strich IST dort die Unterstreichung und wächst aus ihr
     heraus. Die Schlussfolie hängt an der rechten Textkante: Dort
     ist der Strich eine freie Linie und unterstreicht nichts mehr.
     Simons Entscheid vom 06.09.2026 - «es muss nichts mehr
     unterstrichen sein». Die Folie trägt deshalb als einzige im Deck
     keinen Lime-Marker.

     Gleich ist das Tempo: Die Startfolie gibt mit ihren 2000 ms die
     Geschwindigkeit der Spitze vor, die Schlussfolie bekommt ihre
     Dauer aus ihrer eigenen Länge. Feste 2000 ms für beide hiessen,
     dass der kürzere Weg schleicht und der längere hetzt.

     Der Pfad wird GERECHNET, nicht getippt. Er hängt an der
     gemessenen Markierung und am gemessenen Zeilenende, verrutscht
     also nicht, wenn jemand die Überschrift umschreibt. Getippte
     Koordinaten wären beim ersten Textwechsel falsch, und zwar
     unbemerkt.
     --------------------------------------------------------------- */
  (function () {
    var folien = document.querySelectorAll('.slide[data-spur]');
    if (!folien.length) return;
    var NS = 'http://www.w3.org/2000/svg';
    /* Die Startfolie setzt das Tempo (ihre Länge auf 2000 ms), die
       Schlussfolie rechnet ihre Dauer daraus. Fehlt die Startfolie,
       gilt der Erfahrungswert. */
    var tempo = 0.85;

    /* Gemessen wird über die Layout-Werte, NICHT über
       getBoundingClientRect. Zwei Gründe, beide teuer gelernt:
       Die Bühne wird mit `zoom` skaliert und die Wörter der
       Überschrift stehen in `.wi`-Hüllen, die beim Einlaufen
       verschoben und gedreht sind - ein Rect misst durch beides
       hindurch und liefert je nach Moment etwas anderes.
       offsetLeft/offsetTop kennen weder Zoom noch Transform. Die
       Kette muss aufaddiert werden, weil `.wi` selbst schon
       offsetParent ist. */
    function lage(node, bis) {
      var x = 0, y = 0, n = node;
      while (n && n !== bis) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x, y: y };
    }

    function anker(el, hl) {
      /* Der Marker sitzt auf 92 % der Zeilenhöhe und ist 0.14em dick
         (--mark-position, --mark-thickness aus den Tokens). Wer die
         Tokens ändert, ändert diese zwei Zahlen mit. */
      var dicke = 0.14 * parseFloat(getComputedStyle(hl).fontSize);
      var l = lage(hl, el);

      /* Das Ende der Zeile, nicht das Ende des Wortes: bis dorthin
         bleibt die Linie gerade. Die Überschrift steht in
         `.wi`-Hüllen, die letzte ist das letzte Wort. Fehlen sie,
         bleibt der Lauf hinter dem markierten Wort ein fester Wert -
         lieber etwas kurz als quer durch den Text. */
      var wi = hl.closest('[data-rise]');
      var alle = wi ? wi.querySelectorAll('.wi') : null;
      var ende = l.x + hl.offsetWidth + 260;
      if (alle && alle.length) {
        var letzte = alle[alle.length - 1];
        var lz = lage(letzte, el);
        ende = lz.x + letzte.offsetWidth;
      }

      return {
        /* Der runde Abschluss ragt eine halbe Strichstärke hinaus.
           Um die nach rechts versetzt, sitzt die Linie bündig unter
           dem ersten Buchstaben statt daneben. */
        x: l.x + dicke / 2,
        rechts: l.x + hl.offsetWidth - dicke / 2,
        gerade: ende + 34,
        y: l.y + (hl.offsetHeight - dicke) * 0.92 + dicke / 2,
        dicke: dicke
      };
    }

    /* Der Weg hinaus.

       Gerade unter der Zeile, bis das letzte Wort zu Ende ist - so
       weit ist der Strich die Unterstreichung. Danach dreht er in
       einem einzigen Bogen nach rechts, kommt herunter und verlässt
       die Folie unten.

       Die erste Fassung vom 05.09.2026 folgte Simons Handskizze: ein
       Scheitel über der Zeile, ein steiler Abfall, ein Linkshaken
       zurück, dann hinaus. Am 06.09.2026 gestrichen - «etwas weniger
       kurvig und harmonischer». Der Grund ist derselbe wie auf der
       Schlussfolie: Die alte Linie wechselte dreimal die Drehrichtung.
       Jeder Wechsel zerlegt eine Bewegung in zwei kürzere, und drei
       Wechsel machen aus einer Spur eine Schnörkelei. Jetzt dreht sie
       durchgehend im selben Sinn, rund 165 Grad von waagrecht nach
       links unten.

       Nach unten und nicht nach oben, aus zwei Gründen: Oben rechts
       steht das Lockup (x 1523, y 56 bis 116) - ein Scheitel über der
       Zeile läuft ihm in die Arme. Und die Schlussfolie holt die Spur
       oben wieder herein. Unten hinaus, oben herein: Das ist die
       Richtung, in der etwas weitergeht.

       Die Anschlüsse sind gerechnet, nicht geschätzt (G1). Wer eine
       Zahl ändert, ändert die Nachbarzahl mit, sonst bekommt die
       Linie einen Knick, den man nicht sieht, aber spürt.

       Der Bogen bleibt rechts vom Fliesstext: Der steht bis x 1370,
       die Linie ist auf seiner Höhe bei x 1708. Und sie geht dem
       Seitenzähler unten rechts aus dem Weg.

       Der Ausgang hängt an der BÜHNE (y 1160), nicht an der Zeile.
       Die Überschrift wandert, wenn der Fliesstext länger wird - die
       t-statement-Folie zentriert ihren Block. Am 06.09.2026 endete
       die Linie deshalb 13 px VOR der Blattkante und hörte einfach
       auf, statt hinauszugehen. Ein Ausgang, der relativ zur Zeile
       liegt, ist kein Ausgang.
       VERBOT: nicht durch Fliesstext. Eine Linie, die Wörter kreuzt,
       macht den Text schlechter lesbar und sich selbst nicht
       schöner. → Design-Gate */
    function wegHinaus(a, n) {
      var y = a.y;
      return 'M ' + n(a.x) + ' ' + n(y) +
             ' L ' + n(a.gerade) + ' ' + n(y) +
             ' C ' + n(a.gerade + 200) + ' ' + n(y) + ', 1800 ' + n(y + 70) + ', 1800 ' + n(y + 250) +
             ' C 1800 ' + n(y + 430) + ', 1660 ' + n(y + 540) + ', 1440 1160';
    }

    /* Der Weg herein.

       Umgekehrte Dramaturgie: Auf der Startfolie beginnt der Strich
       im Wort und geht. Hier kommt er von oben herein, zieht in
       einem einzigen Bogen um den Textblock herum und verlässt die
       Folie unten links. Er unterstreicht nichts.

       Von oben, nicht von unten - Simons Entscheid vom 06.09.2026.
       Eine Spur, die von unten hochsteigt, wirkt wie ein Aufschwung.
       Eine, die von oben hereinkommt, wirkt wie etwas, das schon
       unterwegs war und hier durchgeht. Das ist der Satz.

       Die Kurve dreht durchgehend im selben Sinn - von rechts unten
       über senkrecht nach links unten, rund 175 Grad ohne einen
       einzigen Wendepunkt. Genau das macht sie ruhig. Die Fassung
       davor endete in einem Haken zum Wort hin, und dieser Haken war
       das Unruhige daran: Ein Gegenbogen auf den letzten 100 px
       zerlegt eine lange Bewegung in zwei kurze.

       Alle vier Anschlüsse liegen exakt auf gleicher Tangente (G1) -
       nicht ungefähr, sondern gerechnet. Bei 10 px Strichstärke
       sieht man einen Knick von zwei Grad nicht, aber die Linie
       wirkt dann gebastelt.

       Das Rückgrat ist gemessen, nicht getippt: Es liegt 230 px
       rechts vom breitesten Text der Folie. Wird der Text breiter,
       rückt die Kurve mit; wird er schmaler, bleibt sie im Rahmen
       (1500 bis 1720), damit sie nicht an die Blattkante wandert.
       VERBOT: nicht durch Fliesstext. Eine Linie, die Wörter kreuzt,
       macht den Text schlechter lesbar und sich selbst nicht
       schöner. → Design-Gate */
    function rueckgrat(el) {
      /* Die rechte Kante des Textes. Überschrift und Überzeile sind
         blockbreit, ihre `offsetWidth` sagt also nichts - gemessen
         werden die Wortpakete von `data-rise`. Der Fliesstext hat
         eine echte Breite (max-width) und zählt direkt. */
      var rechts = 0;
      el.querySelectorAll('.wi').forEach(function (n) {
        var l = lage(n, el);
        if (l.x + n.offsetWidth > rechts) rechts = l.x + n.offsetWidth;
      });
      el.querySelectorAll('.kicker, .lead, p').forEach(function (n) {
        var l = lage(n, el);
        if (l.x + n.offsetWidth > rechts) rechts = l.x + n.offsetWidth;
      });
      return Math.max(1500, Math.min(1720, rechts + 230));
    }

    function wegHerein(el, n) {
      var r = rueckgrat(el);
      return 'M ' + n(r - 700) + ' -80' +
             ' C ' + n(r - 450) + ' -60, ' + n(r - 180) + ' 120, ' + n(r - 80) + ' 380' +
             ' C ' + n(r - 40) + ' 484, ' + n(r) + ' 560, ' + n(r) + ' 700' +
             ' C ' + n(r) + ' 840, ' + n(r - 150) + ' 930, ' + n(r - 350) + ' 960' +
             ' C ' + n(r - 550) + ' 990, ' + n(r - 900) + ' 1090, ' + n(r - 1120) + ' 1140';
    }

    function zeichnen(el) {
      var n = function (v) { return Math.round(v * 10) / 10; };
      var kommt = el.dataset.spur === 'ende';
      var hl = el.querySelector('.hl');
      /* Die Startfolie braucht den Marker - er ist ihr Anfang. Die
         Schlussfolie braucht ihn nicht und hat keinen. */
      if (!kommt && !hl) return;

      var d, dicke;
      if (kommt) {
        /* Gleiche Strichstärke wie der Marker: 0.14em der
           Überschrift. Sonst sieht man auf der Schlussfolie, dass es
           ein anderer Stift war. */
        var h1 = el.querySelector('h1');
        dicke = 0.14 * parseFloat(getComputedStyle(h1 || el).fontSize);
        d = wegHerein(el, n);
      } else {
        var a = anker(el, hl);
        dicke = a.dicke;
        d = wegHinaus(a, n);
      }

      var alt = el.querySelector('.spur');
      if (alt) alt.remove();
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'spur');
      svg.setAttribute('viewBox', '0 0 1920 1080');
      svg.setAttribute('aria-hidden', 'true');
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke-width', dicke);
      svg.appendChild(p);
      el.insertBefore(svg, el.firstChild);

      var laenge = p.getTotalLength();
      el.style.setProperty('--spur-len', laenge);
      if (kommt) {
        el.style.setProperty('--spur-ms', Math.round(laenge / tempo) + 'ms');
      } else {
        tempo = laenge / 2000;
        /* Erst wenn der Pfad wirklich steht, gibt der CSS-Marker ab.
           Andersherum stünde das Wort ohne Unterstreichung da, falls
           hier etwas schiefgeht. */
        hl.classList.add('hl-spur');
      }
      if (isPrint) { p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = '0'; }
    }

    function alleZeichnen() { folien.forEach(function (el) { zeichnen(el); }); }

    alleZeichnen();
    /* Und noch einmal, sobald Calibre geladen ist. Vor dem Font
       rechnet der Browser mit der Ersatzschrift, die breiter baut -
       die Spur setzte dadurch rund 130 px zu weit rechts an, mitten
       im nächsten Wort. Fällt nur auf, wenn man es weiss. */
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(alleZeichnen); }
    var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(alleZeichnen, 150); });
  })();

  /* ---------------------------------------------------------------
     Ton auf Videos

     Ein Video mit `data-ton` will laufen und klingen. Browser
     erlauben das nur, wenn die Seite schon berührt wurde - wer bis
     zu einer Referenzfolie geblättert hat, hat sie berührt, deshalb
     ist der Versuch meistens erfolgreich. Wird er abgelehnt, läuft
     das Video stumm weiter und der Knopf holt den Ton nach.

     Nie umgekehrt aufbauen: erst stumm starten und dann laut machen
     wollen heisst, dass bei jedem Folienwechsel kurz nichts läuft.
     --------------------------------------------------------------- */
  function tonKnopf(v) {
    var f = v.closest('.ref-fig');
    return f ? f.querySelector('.tonbtn') : null;
  }

  function tonSetzen(v, an) {
    v.muted = !an;
    var b = tonKnopf(v);
    if (b) {
      b.textContent = an ? 'Ton aus' : 'Ton an';
      b.setAttribute('aria-pressed', an ? 'true' : 'false');
    }
  }

  function starteVideo(v) {
    var willTon = v.hasAttribute('data-ton');
    v.muted = !willTon;
    if (willTon) tonSetzen(v, true);
    var p = v.play();
    if (p && p.catch) {
      p.catch(function () {
        /* Ton verweigert. Stumm läuft es immer, und der Knopf sagt
           jetzt «Ton an» statt «Ton aus». */
        tonSetzen(v, false);
        var q = v.play();
        if (q && q.catch) q.catch(function () {});
      });
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.tonbtn') : null;
    if (!b) return;
    var f = b.closest('.ref-fig');
    var v = f ? f.querySelector('video') : null;
    if (!v) return;
    tonSetzen(v, v.muted);
    if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  });

  /* ---------------------------------------------------------------
     Start
     --------------------------------------------------------------- */
  fit();
  var start = parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(start) && start >= 1 ? start - 1 : 0);
  if (hint) setTimeout(function () { hint.classList.add('hide'); }, 6000);

  window.Deck = { show: show, next: function () { show(i + 1); }, prev: function () { show(i - 1); }, slides: slides };
})();
