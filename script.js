const inputForm = document.getElementById("input-form");
inputForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const input = document.getElementById("input-text");
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

function createCard(object) {
  const cardTemplate = document.getElementById("card-template").content.cloneNode(true);
  const card = cardTemplate.querySelector('.card');
  card.style.backgroundColor = object.colours[0];
  card.querySelector('.header-name').textContent = object.name;
  card.querySelector('.header-id').textContent = object.id;
  card.querySelector('.card-image').src = object.standardImage;
  preloadImage(object.shinyImage);
  card.querySelector('.about').textContent = object.info;
  if (object.colours.length > 1) {
    card.style.background = `linear-gradient(to bottom, ${object.colours[0]}, ${object.colours[1]})`;
  }
  card.dataset.standardImage = object.standardImage;
  card.dataset.shinyImage = object.shinyImage;
  console.log(card.dataset.shinyImage);
  return cardTemplate;
}

async function createPokemon(name) {
  const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const pokemon = await pokemonResponse.json();

  const speciesResponse = await fetch(pokemon.species.url);
  const species = await speciesResponse.json();

  const entries = species.flavor_text_entries;
  let i = 0;
  while (entries[i].language.name != "en") {
    i++;
  }


  const colours = pokemon.types.map((type) => colourMap[type.type.name]);

  let object = {
    name: formatName(pokemon.name),
    id: `#${species.id}`,
    info: species.flavor_text_entries[i].flavor_text.replace(/[\s\f]+/g, ' '),
    standardImage: pokemon.sprites.other['official-artwork'].front_default,
    shinyImage: pokemon.sprites.other['official-artwork'].front_shiny,
    colours: colours,
  };

  return object;
}

async function insertPokemon(name) {
  const pokemon = await createPokemon(name);
  const card = createCard(pokemon);
  document.getElementById("container").append(card);
}

function clearPage() {
  document.getElementById("input-text").value = "";
  const container = document.getElementById("container");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

async function fillAll() {
  const allResponse = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=1351");
  const all = await allResponse.json();
  for (let i = 0; i < all.results.length; i++) {
    insertPokemon(all.results[i].name);
    console.log(i);
  }
}

function toggleImage(card) {
  let image = card.querySelector('.card-image');
  if (card.dataset.shinyImage) {
    image.src = image.src == card.dataset.standardImage ? card.dataset.shinyImage : card.dataset.standardImage;
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
