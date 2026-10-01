export interface DestinationConfig {
  heroImage: string;
  tagline: string;
  features: string[];
}

export const destinationConfigs: Record<string, DestinationConfig> = {
  serengeti: {
    heroImage: "/destinations/serengeti.jpg",
    tagline: "The Endless Plains",
    features: [
      "Great Migration",
      "Big Five Safari",
      "Endless Savannah",
      "Predator Paradise",
    ],
  },
  tarangire: {
    heroImage: "/destinations/tarangire.jpg",
    tagline: "Land of the Giants",
    features: [
      "Massive Elephant Herds",
      "Ancient Baobab Trees",
      "Termite Mounds",
      "Landscape Views",
    ],
  },
  ngorongoro: {
    heroImage: "/destinations/ngorongoro.jpg",
    tagline: "Africa's Eden",
    features: [
      "Ngorongoro Crater",
      "Big Five Density",
      "Volcanic Landscape",
      "Maasai Culture",
    ],
  },
  kilimanjaro: {
    heroImage: "/destinations/kilimanjaro.jpg",
    tagline: "Roof of Africa",
    features: [
      "Africa's Highest Peak",
      "Five Climate Zones",
      "Mountain Trekking",
      "Snow-Capped Summit",
    ],
  },
  zanzibar: {
    heroImage: "/destinations/zanzibar.jpg",
    tagline: "Spice Island Paradise",
    features: [
      "Pristine Beaches",
      "Stone Town History",
      "Spice Tours",
      "Dhow Sunset Cruises",
    ],
  },
  ruaha: {
    heroImage: "/destinations/ruaha.jpg",
    tagline: "Tanzania's Hidden Gem",
    features: [
      "Elephant Population",
      "Baobab Forests",
      "Great Ruaha River",
      "Remote Wilderness",
    ],
  },
  selous: {
    heroImage: "/destinations/selous.jpg",
    tagline: "Untouched Wilderness",
    features: [
      "Largest Game Reserve",
      "Wild Dogs",
      "Rufiji River",
      "Walking Safaris",
    ],
  },
  arusha: {
    heroImage: "/destinations/arusha.jpg",
    tagline: "Gateway to Safari",
    features: [
      "Safari Capital",
      "Mount Meru",
      "Cultural Tours",
      "Coffee Plantations",
    ],
  },
  "lake-manyara": {
    heroImage: "/destinations/lake-manyara.jpg",
    tagline: "Tree-Climbing Lions",
    features: [
      "Tree-Climbing Lions",
      "Flamingo Paradise",
      "Rift Valley Views",
      "Diverse Birdlife",
    ],
  },
  manyara: {
    heroImage: "/destinations/manyara.jpg",
    tagline: "Tree-Climbing Lions",
    features: [
      "Tree-Climbing Lions",
      "Flamingo Paradise",
      "Rift Valley Views",
      "Diverse Birdlife",
    ],
  },
};

const FALLBACK: DestinationConfig = {
  heroImage: "/destinations/serengeti.jpg",
  tagline: "Tanzania's Beauty",
  features: [
    "Wildlife Photography",
    "Stunning Landscapes",
    "Cultural Experiences",
    "Adventure Safari",
  ],
};

export function getDestinationConfig(
  slug: string,
  name?: string
): DestinationConfig {
  const haystack = `${slug} ${name ?? ""}`
    .toLowerCase()
    .replace(/_/g, "-");

  // Longest key first so `lake-manyara` wins over `manyara`
  const sortedKeys = Object.keys(destinationConfigs).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    const needle = key.toLowerCase().replace(/_/g, "-");
    if (haystack.includes(needle)) {
      return destinationConfigs[key];
    }
  }

  return FALLBACK;
}