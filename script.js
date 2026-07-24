const inputForm = document.getElementById("add-form");
inputForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const input = document.getElementById("add-input");
  insertPokemon(input.value);
  input.value = "";
})

const colourMap = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

function createCard(pokemon) {
  const card = document.getElementById("card-template").content.querySelector('.card').cloneNode(true);

  card.querySelector('.header-name').textContent = pokemon.displayName;
  card.querySelector('.header-id').textContent = pokemon.id;
  card.querySelector('.card-image').src = pokemon.standardImage;
  card.querySelector('.about').textContent = pokemon.about;

  //Image setup
  preloadImage(pokemon.shinyImage);
  card.dataset.shinyImage = pokemon.shinyImage;
  card.dataset.standardImage = pokemon.standardImage;

  //Card Backgrounds
  card.style.backgroundColor = pokemon.backgroundColours[0];
  if (pokemon.backgroundColours.length > 1) {
    const primaryColour = pokemon.backgroundColours[0];
    const secondaryColour = pokemon.backgroundColours[1];
    card.style.background = `linear-gradient(to bottom, ${primaryColour}, ${secondaryColour})`;
  }

  return card;
}

async function createPokemon(name) {
  const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const pokemonData = await pokemonResponse.json();

  const speciesResponse = await fetch(pokemonData.species.url);
  const speciesData = await speciesResponse.json();

  const dexEntries = speciesData.flavor_text_entries;
  let i = 0;
  while (dexEntries[i].language.name != "en") {
    i++;
  }

  const colours = pokemonData.types.map((type) => colourMap[type.type.name]);

  let pokemon = {
    displayName: formatName(pokemonData.name),
    id: `#${speciesData.id}`,
    about: speciesData.flavor_text_entries[i].flavor_text.replace(/[\s\f]+/g, ' '),
    standardImage: pokemonData.sprites.other['official-artwork'].front_default,
    shinyImage: pokemonData.sprites.other['official-artwork'].front_shiny,
    backgroundColours: colours,
  };

  return pokemon;
}

async function insertPokemon(name) {
  if (name === "pokedex") {
    fillAll();
    return;
  }
  const pokemon = await createPokemon(name);
  const card = createCard(pokemon);
  document.getElementById("main-container").append(card);
}

function clearPage() {
  document.getElementById("add-input").value = "";
  const container = document.getElementById("main-container");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

async function fillAll() {
  const allResponse = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=10000");
  const all = await allResponse.json();

  const promises = all.results.map(async (item) => {
    const result = await createPokemon(item.name);
    return result;
  });

  const pokemon = await Promise.all(promises);
  const container = document.getElementById("main-container");
  pokemon.forEach((pokemon) => container.append(createCard(pokemon)));
}

function toggleImage(card) {
  let image = card.querySelector('.card-image');
  if (card.dataset.shinyImage) {
    image.src = image.src === card.dataset.standardImage ? card.dataset.shinyImage : card.dataset.standardImage;
  }
}

function formatName(rawName) {
  const nameArray = rawName.split(/-/);
  const baseName = nameArray[0];
  let suffix = ""
  let result = "";
  for (let i = 1; i < nameArray.length; i++) {
    const word = nameArray[i];
    if (word.length < 2) {
      suffix += " " + word.toUpperCase();
    } else {
      result += word.charAt(0).toUpperCase() + word.slice(1) + " ";
    }
  }
  result += baseName.charAt(0).toUpperCase() + baseName.slice(1);
  result += suffix;
  return result;
}

function preloadImage(url) {
  const img = new Image();
  img.src = url;
}
