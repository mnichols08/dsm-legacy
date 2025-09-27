(function () {
  const CONTENT_PATH = 'data/site-content.json';

  const setText = (element, text) => {
    if (element && typeof text === 'string') {
      element.textContent = text;
    }
  };

  const createParagraph = (text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  };

  const populateHero = (hero) => {
    if (!hero) return;
    const heroElement = document.querySelector('dsm-hero#home');
    if (!heroElement) return;

    if (hero.title) heroElement.setAttribute('title', hero.title);
    if (hero.subtitle) heroElement.setAttribute('subtitle', hero.subtitle);
    if (hero.ctaText) heroElement.setAttribute('cta-text', hero.ctaText);
    if (hero.ctaLink) heroElement.setAttribute('cta-link', hero.ctaLink);
    if (hero.image) heroElement.setAttribute('image', hero.image);
  };

  const populateAbout = (about) => {
    if (!about) return;
    const aboutSection = document.querySelector('#about');
    if (!aboutSection) return;

    setText(aboutSection.querySelector('.section-title h2'), about.title || 'THE PARTNERSHIP');
    setText(aboutSection.querySelector('.section-title p'), about.subtitle || 'How two automotive giants joined forces to create a legend');
    const headline = aboutSection.querySelector('.about-headline');
    const copyContainer = aboutSection.querySelector('.about-copy');

    if (headline) {
      headline.textContent = '';
      if (about.headline) {
        headline.textContent = about.headline;
      }
    }

    if (copyContainer) {
      copyContainer.innerHTML = '';
      (about.paragraphs || []).forEach((text) => {
        copyContainer.appendChild(createParagraph(text));
      });
    }

    const aboutImage = aboutSection.querySelector('.about-image img');
    if (aboutImage && about.image) {
      aboutImage.src = about.image;
    }
  };

  const populatePrecursors = (precursors) => {
    if (!precursors) return;
    const introTitle = document.querySelector('.precursors-intro-title');
    const introDescription = document.querySelector('.precursors-intro-description');
    const cardsContainer = document.getElementById('precursor-cards');

    setText(introTitle, precursors.introTitle || 'Precursors');
    setText(introDescription, precursors.introDescription || '');

    if (!cardsContainer) return;
    cardsContainer.innerHTML = '';

    (precursors.cards || []).forEach((card) => {
      const cardElement = document.createElement('dsm-vehicle-card');
      if (card.image) cardElement.setAttribute('image', card.image);
      if (card.title) cardElement.setAttribute('title', card.title);
      if (card.years) cardElement.setAttribute('years', card.years);
      if (card.description) cardElement.setAttribute('description', card.description);
      if (card.specs) {
        try {
          cardElement.setAttribute('specs', JSON.stringify(card.specs));
        } catch (error) {
          console.error('Unable to stringify specs for card', card.title, error);
        }
      }
      cardsContainer.appendChild(cardElement);
    });
  };

  const populateTimeline = (timeline) => {
    if (!timeline) return;
    const timelineElement = document.querySelector('dsm-timeline#timeline');
    if (!timelineElement) return;

    if (timeline.title) timelineElement.setAttribute('title', timeline.title);
    if (timeline.subtitle) timelineElement.setAttribute('subtitle', timeline.subtitle);

    while (timelineElement.firstChild) {
      timelineElement.removeChild(timelineElement.firstChild);
    }

    (timeline.events || []).forEach((event) => {
      const item = document.createElement('dsm-timeline-item');
      if (event.year) item.setAttribute('year', event.year);
      if (event.title) item.setAttribute('title', event.title);

      const descriptionParagraph = createParagraph(event.description || '');
      item.appendChild(descriptionParagraph);
      timelineElement.appendChild(item);
    });
  };

  const populateEngineHeritage = (heritage) => {
    if (!heritage) return;
    const heritageSection = document.querySelector('#heritage-content');
    if (!heritageSection) return;

    const introTitle = heritageSection.querySelector('.engine-intro-title');
    const introDescription = heritageSection.querySelector('.engine-intro-description');
    setText(introTitle, heritage.intro?.title || 'Engine Heritage');
    setText(introDescription, heritage.intro?.description || '');

    const timelineContainer = document.getElementById('engine-milestones');
    if (timelineContainer) {
      timelineContainer.innerHTML = '';
      (heritage.milestones || []).forEach((milestone) => {
        const item = document.createElement('div');
        item.className = 'engine-timeline-item';

        const period = document.createElement('div');
        period.className = 'engine-year';
        period.textContent = milestone.period || '';

        const detail = document.createElement('div');
        detail.className = 'engine-detail';

        const title = document.createElement('h4');
        title.textContent = milestone.title || '';
        const description = createParagraph(milestone.description || '');

        detail.append(title, description);
        item.append(period, detail);
        timelineContainer.appendChild(item);
      });
    }

    const specsGrid = document.getElementById('engine-specs-grid');
    if (specsGrid) {
      specsGrid.innerHTML = '';
      (heritage.specs || []).forEach((spec) => {
        const specItem = document.createElement('div');
        specItem.className = 'spec-item';

        const specTitle = document.createElement('div');
        specTitle.className = 'spec-title';
        specTitle.textContent = spec.title || '';

        const specValue = document.createElement('div');
        specValue.className = 'spec-value';
        specValue.textContent = spec.value || '';

        specItem.append(specTitle, specValue);
        specsGrid.appendChild(specItem);
      });
    }

    const tabsContainer = heritageSection.querySelector('.engine-subtabs');
    const panelsContainer = heritageSection.querySelector('.engine-subtab-panels');

    if (tabsContainer && panelsContainer) {
      tabsContainer.innerHTML = '';
      delete tabsContainer.dataset.initialized;
      panelsContainer.innerHTML = '';

      (heritage.tabs || []).forEach((tab, index) => {
        const button = document.createElement('button');
        button.className = 'legacy-tab';
        button.type = 'button';
        button.dataset.tab = tab.id;
        button.textContent = tab.label;
        if (index === 0) {
          button.classList.add('active');
        }
        tabsContainer.appendChild(button);

        const panel = document.createElement('div');
        panel.className = 'legacy-subtab-content';
        panel.id = `${tab.id}-content`;
        if (index === 0) {
          panel.classList.add('active');
        }

        if (tab.intro) {
          panel.appendChild(createParagraph(tab.intro));
        }

        if (tab.bullets && tab.bullets.length) {
          const list = document.createElement('ul');
          list.className = 'engine-points';
          tab.bullets.forEach((bullet) => {
            const listItem = document.createElement('li');
            if (bullet.title) {
              const strong = document.createElement('strong');
              strong.textContent = bullet.title;
              listItem.appendChild(strong);
            }
            if (bullet.text) {
              const span = document.createElement('span');
              span.textContent = ` ${bullet.text}`;
              listItem.appendChild(span);
            }
            list.appendChild(listItem);
          });
          panel.appendChild(list);
        }

        panelsContainer.appendChild(panel);
      });

      document.dispatchEvent(new CustomEvent('dsm-engine-tabs-updated'));
    }
  };

  const reinitalizeTabsWhenReady = () => {
    const runInitializers = () => {
      if (typeof window.initLegacyTabs === 'function') {
        window.initLegacyTabs();
      }
      if (typeof window.initEngineHeritageTabs === 'function') {
        window.initEngineHeritageTabs();
      }
    };

    if (typeof window.initLegacyTabs === 'function' || typeof window.initEngineHeritageTabs === 'function') {
      runInitializers();
    } else {
      document.addEventListener('dsm-main-loaded', runInitializers, { once: true });
    }
  };

  const loadContent = async () => {
    try {
      const response = await fetch(CONTENT_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch site content: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      populateHero(data.hero);
      populateAbout(data.about);
      populatePrecursors(data.precursors);
      populateTimeline(data.timeline);
      populateEngineHeritage(data.engineHeritage);

      document.dispatchEvent(new CustomEvent('dsm-content-updated', { detail: data }));
      reinitalizeTabsWhenReady();
    } catch (error) {
      console.error('DSM content loader error:', error);
    }
  };

  const bootstrap = () => {
    if (typeof window.componentsReady === 'function') {
      window.componentsReady().then(loadContent);
    } else if (document.readyState !== 'loading') {
      loadContent();
    } else {
      document.addEventListener('DOMContentLoaded', loadContent);
    }
  };

  bootstrap();
})();
