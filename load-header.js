// load-header.js - Script unificado para carregamento do cabeçalho
(async function loadHeader() {
  try {
    const res = await fetch('header.html');
    if (!res.ok) throw new Error('header.html não encontrado');
    const text = await res.text();
    
    // Insere no topo do body
    const placeholder = document.getElementById('header-placeholder') || document.createElement('div');
    if (!placeholder.id) { 
      placeholder.id = 'header-placeholder'; 
      document.body.prepend(placeholder); 
    }
    placeholder.innerHTML = text;

    // Detecta se a página tem seção .hero para aplicar variante transparente
    const heroSection = document.querySelector('.hero');
    const header = document.querySelector('.site-header');
    
    if (heroSection && header) {
      header.classList.add('transparent');
    } else if (header) {
      // Adiciona classe has-fixed-header ao body para páginas sem hero
      document.body.classList.add('has-fixed-header');
    }

    // Inicializa comportamento do menu (hamburger + ajuste dinâmico)
    const btn = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const primaryNav = document.querySelector('.primary-nav');
    const headerInner = document.querySelector('.header-inner');
    const rightBlock = headerInner && headerInner.querySelector('div[style*="margin-left:auto"]');

    // Add FAQ link to primary navigation if not exists
    if (primaryNav && !primaryNav.querySelector('a[href="faq.html"]')) {
      const faqLink = document.createElement('a');
      faqLink.href = 'faq.html';
      faqLink.textContent = 'FAQ';
      faqLink.setAttribute('data-core', '0'); // Not a core item, can be moved to mobile
      primaryNav.appendChild(faqLink);
    }

    if (!btn || !mobileNav || !primaryNav || !headerInner || !rightBlock) return;

    // Toggle do menu mobile
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileNav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Fecha menu ao clicar em links
    mobileNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') { 
        mobileNav.classList.remove('open'); 
        btn.setAttribute('aria-expanded', 'false'); 
      }
    });

    // Fecha menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!mobileNav.classList.contains('open')) return;
      if (!mobileNav.contains(e.target) && !btn.contains(e.target)) {
        mobileNav.classList.remove('open'); 
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Ajuste dinâmico: move itens entre primary-nav e mobile-nav conforme espaço disponível
    function availableWidth() {
      const total = headerInner.getBoundingClientRect().width;
      const right = rightBlock.getBoundingClientRect().width;
      const logo = headerInner.querySelector('.logo') ? headerInner.querySelector('.logo').getBoundingClientRect().width : 0;
      const padding = 48; // folga para margens/paddings
      return total - right - logo - padding;
    }

    function moveItem(item, from, to, prepend = false) {
      if (!item) return;
      if (prepend) to.insertBefore(item, to.firstChild);
      else to.appendChild(item);
    }

    function adjustMenu() {
      // Move itens do primary para mobile se não há espaço
      while (primaryNav.scrollWidth > availableWidth()) {
        const children = Array.from(primaryNav.children);
        let lastRemovable = null;
        
        // Procura o último item que não é "core" (data-core="1")
        for (let i = children.length - 1; i >= 0; i--) {
          const ch = children[i];
          if (ch.dataset.core !== '1') { 
            lastRemovable = ch; 
            break; 
          }
        }
        
        if (!lastRemovable) break;
        moveItem(lastRemovable, primaryNav, mobileNav, false);
      }
      
      // Move itens do mobile para primary se há espaço
      let moved = true;
      while (moved) {
        moved = false;
        const firstMobile = mobileNav.querySelector('a');
        if (!firstMobile) break;
        
        // Move temporariamente e checa se ficou dentro do espaço
        primaryNav.appendChild(firstMobile);
        if (primaryNav.scrollWidth <= availableWidth()) {
          moved = true; // deixou no primary
        } else {
          // Sem espaço: devolve para mobile (na frente)
          mobileNav.insertBefore(firstMobile, mobileNav.firstChild);
          break;
        }
      }
    }

    // Debounce helper
    let resizeTimer = null;
    function scheduleAdjust() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { adjustMenu(); }, 80);
    }

    // Observar mudanças (fonts carregadas, imagens, etc)
    window.addEventListener('resize', scheduleAdjust);
    window.addEventListener('load', scheduleAdjust);
    // Também observa mutações no header (caso algo mude dinamicamente)
    const obs = new MutationObserver(scheduleAdjust);
    obs.observe(headerInner, { childList: true, subtree: true });

    // Execução inicial
    scheduleAdjust();
    
  } catch (err) {
    console.error('Erro ao carregar header:', err);
  }
})();