document.addEventListener('DOMContentLoaded', function () {
    const videoPlayer = videojs('videoPlayer');
    const categoryContainer = document.getElementById('categoryContainer');
    const channelContainer = document.getElementById('channelContainer');
    const searchInput = document.getElementById('searchInput');
    const loader = document.querySelector('.loader');
    let channels = [];

    const categories = ['Anime', 'Cine', 'Variado'];
    renderCategories(categories);

    const m3uURLs = {
      'Anime': 'https://raw.githubusercontent.com/gsolanoalvarez/argentina899999/main/ani',
      'Cine': 'https://raw.githubusercontent.com/gsolanoalvarez/argentina899999/main/pa',
      'Variado': 'https://raw.githubusercontent.com/bodegaacuenta/Moyobambaastral/main/TVCable.m3u',
    };
    fetch(m3uURLs[categories[0]])
        .then(response => response.text())
        .then(parseM3U)
        .catch(handleError);

    initializeApp();

    function initializeApp() {
      if (!navigator.onLine) {
        handleOffline();
      } else {
        loadChannels(categories[0]);

        searchInput.addEventListener('input', handleSearchInput);

        categoryContainer.addEventListener('click', handleCategoryClick);
        
      }
    }

    function handleCategoryClick(event) {
      const category = event.target.textContent;
      loadChannels(category);
    }

    function handleSearchInput(event) {
      const searchTerm = event.target.value.trim().toLowerCase();
      const filteredChannels = channels.filter(channel => channel.name.toLowerCase().includes(searchTerm));
      renderChannels(filteredChannels);
    }

    function loadChannels(category) {
      showLoader();
      fetch(m3uURLs[category])
        .then(response => response.text())
        .then(parseM3U)
        .catch(handleError)
        .finally(hideLoader);
    }

    function renderCategories(categories) {
      categoryContainer.innerHTML = '';
      categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('categoryButton');
        button.textContent = category;
        categoryContainer.appendChild(button);
      });
    }

    function showLoader() {
      loader.style.display = 'block';
      channelContainer.innerHTML = '<div class="loading-message">Cargando canales...</div>';
    }

    function hideLoader() {
      loader.style.display = 'none';
    }

    function parseM3U(data) {
      try {
        const lines = data.split('\n');
        channels = [];
        for (const line of lines) {
          if (line.startsWith('#EXTINF')) {
            const [, name] = line.match(/tvg-name="([^"]+)"/) || [, ''];
            const [, logo] = line.match(/tvg-logo="([^"]+)"/) || [, ''];
            const [, url] = lines[lines.indexOf(line) + 1].match(/^(http[^\s]+)/) || [, ''];
            channels.push({ name, logo, url });
          }
        }
        renderChannels(channels);
      } catch (error) {
        handleError(error);
      }
    }

    function handleError(error) {
      console.error('ERROR AL CARGAR LA LISTA', error.message);
      channelContainer.innerHTML = '<div class="error-message">Error...</div>';
      hideLoader();
    }

    function renderChannels(channels) {
      channelContainer.innerHTML = '';
      if (channels.length === 0) {
        channelContainer.innerHTML = '<div class="empty-message">No se encontraron canales.</div>';
      } else {
        channels.forEach(channel => {
          const channelElement = document.createElement('div');
          channelElement.classList.add('channelButton');
          channelElement.innerHTML = `
            <img src="${channel.logo}" alt="${channel.name}">
            <div>${channel.name}</div>
          `;
          channelElement.addEventListener('click', () => playChannel(channel.url));
          channelContainer.appendChild(channelElement);
        });
      }
      hideLoader();
    }

    function playChannel(url) {
      videoPlayer.src(url);
      videoPlayer.poster("https://i.imgur.com/YsdluoB.png");
      videoPlayer.play();
    }
  });