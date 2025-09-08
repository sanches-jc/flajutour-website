// Standardized header loader for Flajutour website
(async function loadHeader(){
  try {
    const res = await fetch('header.html');
    if (!res.ok) throw new Error('header.html não encontrado');
    const text = await res.text();
    
    // Insert header at the beginning of body or in placeholder
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.innerHTML = text;
    } else {
      // If no placeholder, insert at beginning of body
      const headerDiv = document.createElement('div');
      headerDiv.innerHTML = text;
      document.body.insertBefore(headerDiv.firstElementChild, document.body.firstElementChild);
    }

    // Add proper body spacing for fixed header
    document.body.classList.add('has-fixed-header');

    // Initialize hamburger menu behavior
    const btn = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const primaryNav = document.querySelector('.primary-nav');
    const headerInner = document.querySelector('.header-inner');
    const rightBlock = headerInner && headerInner.querySelector('div[style*="margin-left:auto"]');

    if (!btn || !mobileNav || !primaryNav || !headerInner || !rightBlock) return;

    // Toggle hamburger menu
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileNav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    
    // Close menu when clicking on a link
    mobileNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileNav.classList.contains('open')) return;
      if (!mobileNav.contains(e.target) && !btn.contains(e.target)) {
        mobileNav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Dynamic menu adjustment (responsive behavior)
    function availableWidth(){
      const total = headerInner.getBoundingClientRect().width;
      const right = rightBlock.getBoundingClientRect().width;
      const logo = headerInner.querySelector('.logo') ? headerInner.querySelector('.logo').getBoundingClientRect().width : 0;
      const padding = 48;
      return total - right - logo - padding;
    }
    
    function moveItem(item, from, to, prepend = false) {
      if (!item) return;
      if (prepend) to.insertBefore(item, to.firstChild);
      else to.appendChild(item);
    }

    function adjustMenu(){
      // Move items from primary to mobile if exceeding space
      while (primaryNav.scrollWidth > availableWidth()){
        const children = Array.from(primaryNav.children);
        let lastRemovable = null;
        for (let i = children.length - 1; i >= 0; i--){
          const ch = children[i];
          if (ch.dataset.core !== '1'){ 
            lastRemovable = ch; 
            break; 
          }
        }
        if (!lastRemovable) break;
        moveItem(lastRemovable, primaryNav, mobileNav, false);
      }
      
      // Move items back from mobile to primary if there's space
      let moved = true;
      while (moved){
        moved = false;
        const firstMobile = mobileNav.querySelector('a');
        if (!firstMobile) break;
        primaryNav.appendChild(firstMobile);
        if (primaryNav.scrollWidth <= availableWidth()) { 
          moved = true; 
        } else { 
          mobileNav.insertBefore(firstMobile, mobileNav.firstChild); 
          break; 
        }
      }
    }

    // Debounced resize handler
    let resizeTimer = null;
    function scheduleAdjust() { 
      if (resizeTimer) clearTimeout(resizeTimer); 
      resizeTimer = setTimeout(adjustMenu, 80); 
    }
    
    // Event listeners for responsive adjustments
    window.addEventListener('resize', scheduleAdjust);
    window.addEventListener('load', scheduleAdjust);
    
    // Observer for DOM changes
    const obs = new MutationObserver(scheduleAdjust);
    obs.observe(headerInner, { childList: true, subtree: true });
    
    // Initial adjustment
    scheduleAdjust();
    
  } catch (err) {
    console.error('Erro ao carregar header:', err);
  }
})();