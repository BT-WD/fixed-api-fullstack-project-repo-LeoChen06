const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('pokemon-search');
const pokemonDisplay = document.getElementById('pokemon-display');
const namePlaceholder = document.getElementById('name-placeholder');
const imgElement = document.getElementById('pokemon-img');
const imgPlaceholder = document.getElementById('image-placeholder');
const typesPlaceholder = document.getElementById('types-placeholder');
const speciesPlaceholder = document.getElementById('species-placeholder');
const evolutionList = document.getElementById('evolution-list');
const searchHistory = document.getElementById('search-history');

let pastSearches = JSON.parse(localStorage.getItem('pastSearches')) || [];
updateSearchHistory();

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    searchPokemon(query);
  } else {
    console.error('Please enter a Pokemon name or ID');
  }
});

async function searchPokemon(query) {
  try {
    console.log(`Searching for: ${query}`);

    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!pokemonResponse.ok) {
      throw new Error(`Pokemon not found: ${pokemonResponse.status}`);
    }
    const pokemonData = await pokemonResponse.json();
    console.log('Pokemon data:', pokemonData);

    const speciesResponse = await fetch(pokemonData.species.url);
    if (!speciesResponse.ok) {
      throw new Error(`Species not found: ${speciesResponse.status}`);
    }
    const speciesData = await speciesResponse.json();
    console.log('Species data:', speciesData);

    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionResponse.ok) {
      throw new Error(`Evolution chain not found: ${evolutionResponse.status}`);
    }
    const evolutionData = await evolutionResponse.json();
    console.log('Evolution data:', evolutionData);

    displayPokemon(pokemonData, speciesData, evolutionData);

    addToHistory(query);

  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    alert('Pokemon not found or error occurred. Check console for details.');
  }
}

function displayPokemon(pokemon, species, evolution) {
  namePlaceholder.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  if (pokemon.sprites.front_default) {
    imgElement.src = pokemon.sprites.front_default;
    imgElement.style.display = 'block';
    imgPlaceholder.style.display = 'none';
  } else {
    imgElement.style.display = 'none';
    imgPlaceholder.style.display = 'block';
    imgPlaceholder.textContent = 'No image available';
  }

  const types = pokemon.types.map(type => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)).join(', ');
  typesPlaceholder.textContent = types;

  const flavorText = species.flavor_text_entries.find(entry => entry.language.name === 'en');
  speciesPlaceholder.textContent = flavorText ? flavorText.flavor_text.replace(/\f/g, ' ') : 'No description available';

  const evolutions = [];
  let chain = evolution.chain;
  while (chain) {
    evolutions.push(chain.species.name.charAt(0).toUpperCase() + chain.species.name.slice(1));
    chain = chain.evolves_to[0]; 
  }

  evolutionList.innerHTML = '';
  evolutions.forEach(evo => {
    const li = document.createElement('li');
    li.textContent = evo;
    evolutionList.appendChild(li);
  });

  pokemonDisplay.style.display = 'block';
}

function addToHistory(query) {
  if (!pastSearches.includes(query)) {
    pastSearches.unshift(query);
    if (pastSearches.length > 10) pastSearches.pop(); 
    localStorage.setItem('pastSearches', JSON.stringify(pastSearches));
    updateSearchHistory();
  }
}

function updateSearchHistory() {
  searchHistory.innerHTML = '';
  pastSearches.forEach(search => {
    const li = document.createElement('li');
    li.textContent = search.charAt(0).toUpperCase() + search.slice(1);
    li.addEventListener('click', () => {
      searchInput.value = search;
      searchPokemon(search);
    });
    searchHistory.appendChild(li);
  });
}

