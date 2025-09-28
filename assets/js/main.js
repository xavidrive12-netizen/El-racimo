(function(){
  // DOM helpers - script is loaded with defer
  // Hamburger toggle (unchanged)
  const header = document.querySelector('header.fixed-header');
  const btn = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if(btn && header){
    btn.addEventListener('click', ()=>{
      const open = header.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) mobileMenu.querySelector('a')?.focus();
      else btn.focus();
    });
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=> {
        header.classList.remove('menu-open');
        btn.setAttribute('aria-expanded','false');
      });
    });
  }

  // IMAGES: one-shot un-zoom animation (no loop). Make images crisp and stop animation at the end.
  // Targets: hero image and the two wine photos (3 images total)
  const animatedImages = Array.from(document.querySelectorAll('img.zoom-reveal'));

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  animatedImages.forEach((img, idx) => {
    // read per-image data attributes (fall back to defaults)
    const dataStart = parseFloat(img.dataset.zoomStart || img.getAttribute('data-zoom-start') || 1.18);
    const dataDuration = img.dataset.zoomDuration || img.getAttribute('data-zoom-duration') || '12s';
    // set CSS variables on the element for the animation to use
    img.style.setProperty('--zoom-start', dataStart);
    img.style.setProperty('--zoom-duration', dataDuration);
    // If the developer set a per-image transform origin via inline CSS var (e.g. .wine-photo.second),
    // preserve it; otherwise set sensible defaults/stagger origins slightly.
    if(!img.style.getPropertyValue('--transform-origin')){
      const origins = ['center', 'center', 'center 35%']; // keep hero and wine origins predictable
      img.style.setProperty('--transform-origin', origins[idx] || 'center');
    }

    // Ensure the browser loads the full-resolution image as soon as possible (if not reduced motion)
    // decoding="sync" and loading="eager" set in HTML help; here we ensure we don't lazy-load unexpectedly.
    try {
      img.loading = 'eager';
    } catch(e){/* ignore on older browsers */ }

    // If user prefers reduced motion, cancel animation and set final transform
    if(prefersReduced){
      img.style.animation = 'none';
      img.style.transform = 'scale(1)';
      return;
    }

    // When the animation ends, keep the final state and remove animation to prevent reflow/looping
    function onAnimEnd(e){
      // make sure this event is for transform-related animation
      // set final transform explicitly to avoid subpixel changes
      img.style.transform = 'scale(1)';
      // remove animation property so the element remains static and won't re-trigger
      img.style.animation = 'none';
      // tidy up listener
      img.removeEventListener('animationend', onAnimEnd);
    }

    // Attach listener before animation starts to avoid race conditions
    img.addEventListener('animationend', onAnimEnd);

    // Small stagger: start hero immediately, wines slightly delayed — using animationDelay style
    // delays chosen to feel natural; they do not cause re-triggering.
    const delays = ['0s','0.8s','1.6s'];
    img.style.animationDelay = delays[idx] || '0s';

    // Force a reflow/read before the animation starts to ensure CSS variables are applied (safe)
    // (This also prevents some browsers from optimizing away the initial transform)
    void img.offsetWidth;
    // animation is defined in CSS; leaving it to run once (fill-mode: forwards) will stop at end.
  });

  // floating nav active state (unchanged)
  const nav = document.querySelector('.section-nav');
  if(nav){
    const items = Array.from(nav.querySelectorAll('.nav-item'));
    const sections = items.map(i => document.getElementById(i.dataset.target)).filter(Boolean);
    const observerOptions = { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 };
    const setActive = (id) => {
      items.forEach(it => {
        if(it.dataset.target === id){
          it.classList.add('active');
          it.setAttribute('aria-current','true');
        } else {
          it.classList.remove('active');
          it.removeAttribute('aria-current');
        }
      });
    };
    const io = new IntersectionObserver((entries)=>{
      const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio);
      if(visible.length) setActive(visible[0].target.id);
    }, observerOptions);
    sections.forEach(s => { if(s) io.observe(s); });
    document.addEventListener('DOMContentLoaded', ()=> { if(window.scrollY < 100) setActive('inicio'); });
    items.forEach(it=>{
      it.addEventListener('click', function(e){
        e.preventDefault();
        const target = document.getElementById(this.dataset.target);
        if(target){
          const rectTop = target.getBoundingClientRect().top + window.pageYOffset;
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
          window.scrollTo({ top: rectTop - offset - 8, behavior: 'smooth' });
        }
      });
    });
  }

  // accessibility: focus outlines appear after keyboard use
  function handleFirstTab(e){
    if(e.key === 'Tab'){
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);

  // small helper: keep footer year current (non-textual change)
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
})();
