/* =========================================================
   AXEL — Portfolio
   animations.js — GSAP + ScrollTrigger
   ========================================================= */

(function(){
  if(!window.gsap){ console.warn('GSAP non chargé'); return; }
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     LOADER — compteur GSAP + fade out
     ========================================================= */
  {
    const state = { pct: 0 };
    const pctEl = document.getElementById('pctval');
    const barFill = document.getElementById('barfill');
    const loader = document.getElementById('loader');

    gsap.to(state, {
      pct: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(state.pct);
        pctEl.textContent = v;
        barFill.style.transform = `scaleX(${v/100})`;
      },
      onComplete: () => {
        gsap.to(loader, { opacity: 0, duration: .6, delay: .2,
          onComplete: () => { loader.style.visibility = 'hidden'; playIntro(); }
        });
      }
    });
  }

  /* =========================================================
     INTRO — jouée après le loader
     Split du H1 hero + reveal des éléments hero
     ========================================================= */
  function playIntro(){
    const h1 = document.querySelector('.hero-title');
    if(!h1) return;

    const parts = [];
    h1.childNodes.forEach(node => {
      if(node.nodeType === Node.TEXT_NODE){
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(w => {
          if(/^\s+$/.test(w) || w === ''){ frag.appendChild(document.createTextNode(w)); return; }
          const span = document.createElement('span');
          span.className = 'word';
          span.style.display = 'inline-block';
          span.textContent = w;
          frag.appendChild(span);
          parts.push(span);
        });
        h1.replaceChild(frag, node);
      } else if(node.nodeType === Node.ELEMENT_NODE){
        node.style.display = 'inline-block';
        parts.push(node);
      }
    });

    const tl = gsap.timeline();
    tl.from(parts, {
      yPercent: 110,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.08
    })
    .from('#hero .eyebrow', { y: 20, opacity: 0, duration: .8, ease: 'power3.out' }, '-=0.9')
    .from('#hero .hero-lead', { y: 20, opacity: 0, duration: .8, ease: 'power3.out' }, '-=0.6')
    .from('#hero .scroll-hint', { opacity: 0, duration: .6 }, '-=0.3');
  }

  /* =========================================================
     REVEALS génériques — .reveal (hors hero et hors cards)
     ========================================================= */
  gsap.utils.toArray('.reveal').forEach(el => {
    if(el.closest('#hero')) return;      // hero animé par playIntro
    if(el.classList.contains('card')) return; // cartes gérées plus bas
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        scrollTrigger: { trigger: el, start: 'top 85%' },
        duration: 1, ease: 'power3.out'
      }
    );
  });

  /* =========================================================
     MANIFESTO — reveal mot par mot au scroll
     ========================================================= */
  {
    const h2 = document.querySelector('.manifesto-title');
    if(h2){
      const words = [];
      function walk(node, parent){
        node.childNodes.forEach(child => {
          if(child.nodeType === Node.TEXT_NODE){
            const chunks = child.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            chunks.forEach(c => {
              if(c === '') return;
              if(/^\s+$/.test(c)){ frag.appendChild(document.createTextNode(c)); return; }
              const span = document.createElement('span');
              span.className = 'word';
              span.style.display = 'inline-block';
              span.textContent = c;
              frag.appendChild(span);
              words.push(span);
            });
            parent.replaceChild(frag, child);
          } else if(child.nodeType === Node.ELEMENT_NODE){
            walk(child, child);
          }
        });
      }
      walk(h2, h2);

      gsap.fromTo(words,
        { opacity: 0.15, y: 8 },
        {
          opacity: 1, y: 0,
          scrollTrigger: { trigger: h2, start: 'top 80%', end: 'top 30%', scrub: 0.5 },
          stagger: 0.02, ease: 'none'
        }
      );
    }
  }

  /* =========================================================
     BENTO — reveal + hover glow qui suit la souris + tilt 3D
     ========================================================= */
  gsap.utils.toArray('.card').forEach((card, i) => {
    // Reveal au scroll : from → to explicite
    gsap.fromTo(card,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1,
        scrollTrigger: { trigger: card, start: 'top 90%' },
        duration: 1, delay: i * 0.08, ease: 'power3.out'
      }
    );

    // Un seul listener mousemove : glow radial + tilt 3D
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');

      if(reduced) return;
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      gsap.to(card, {
        rotationX: rx, rotationY: ry,
        transformPerspective: 800,
        duration: .6, ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0, rotationY: 0,
        duration: .8, ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });

  /* =========================================================
     SCROLL-LINKED : laptop 3D piloté par ScrollTrigger
     ========================================================= */
  if(window.SCENE){
    ScrollTrigger.create({
      trigger: 'main',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: self => {
        const p = self.progress;
        window.SCENE.rotationBoost = p * Math.PI * 2;
        window.SCENE.xTiltBoost = p * 0.4;
        window.SCENE.zBoost = p * 2.2;
      }
    });
  }

  /* =========================================================
     READOUT distance — animé au scroll
     ========================================================= */
  {
    const el = document.getElementById('ro-depth');
    if(el){
      ScrollTrigger.create({
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: self => {
          const d = self.progress * 42.2;
          el.textContent = d.toFixed(1).padStart(4, '0') + 'km';
        }
      });
    }
  }

  /* =========================================================
     CTA magnétique
     ========================================================= */
  {
    const cta = document.querySelector('#contact .cta');
    if(cta && !reduced){
      const radius = 60;
      cta.addEventListener('mousemove', e => {
        const rect = cta.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const pull = Math.min(1, radius / Math.max(dist, 1));
        gsap.to(cta, { x: dx * 0.3 * pull, y: dy * 0.3 * pull, duration: .5, ease: 'power2.out' });
      });
      cta.addEventListener('mouseleave', () => {
        gsap.to(cta, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,0.4)' });
      });
    }
  }

  /* =========================================================
     Refresh ScrollTrigger après chargement complet
     ========================================================= */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
