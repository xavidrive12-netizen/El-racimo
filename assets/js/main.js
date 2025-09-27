(function(){
  // DOM helpers - script is loaded with defer
  // Hamburger toggle
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

  // assign transform-origin and subtle stagger for animated images
  const heroImg = document.querySelector('img.hero-spaghetti');
  const wineFirst = document.querySelector('img.wine-photo.first');
  const wineSecond = document.querySelector('img.wine-photo.second');

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(heroImg){
    heroImg.style.transformOrigin = 'center';
    heroImg.style.animationDelay = '0s';
  }
  if(wineFirst){
    wineFirst.style.transformOrigin = 'center';
    wineFirst.style.animationDelay = '0.8s';
  }
  if(wineSecond){
    wineSecond.style.transformOrigin = 'center 35%';
    wineSecond.style.animationDelay = '1.6s';
  }

  // Optional: subtle dynamic origin changes to vary the reveal area (respects reduced motion)
  if(!prefersReduced){
    const toggleOrigins = ()=>{
      // small randomized origin shifts, constrained
      const origins = ['center', 'left center', 'right center', 'center 25%', 'center 75%'];
      if(heroImg) heroImg.style.transformOrigin = origins[Math.floor(Math.random()*origins.length)];
      if(wineFirst) wineFirst.style.transformOrigin = origins[Math.floor(Math.random()*origins.length)];
      if(wineSecond) wineSecond.style.transformOrigin = ['center 35%','center 30%','center 40%'][Math.floor(Math.random()*3)];
    };
    // change every 10s (matches the animation duration range)
    setInterval(toggleOrigins, 10000);
  }

  // floating nav active state
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
