const colorNames = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
    "Brown",
    "Cyan",
    "Magenta",
    "Lime",
    "Teal",
    "Indigo",
    "Violet",
    "Gold",
    "Silver",
    "Beige",
    "Maroon",
    "Olive",
    "Coral"
];

const nouns = [
    "apple",
    "book",
    "car",
    "dog",
    "elephant",
    "flower",
    "guitar",
    "house",
    "island",
    "jacket",
    "kite",
    "lamp",
    "mountain",
    "notebook",
    "ocean",
    "pencil",
    "queen",
    "river",
    "sandwich",
    "tree",
    "umbrella",
    "violin",
    "window",
    "xylophone",
    "yacht",
    "zebra",
    "castle",
    "garden",
    "train",
    "camera",
    "bottle",
    "bridge",
    "cloud",
    "planet",
    "pillow"
];

const verbsWithIng = [
    "running",
    "jumping",
    "swimming",
    "writing",
    "reading",
    "dancing",
    "singing",
    "walking",
    "flying",
    "painting",
    "cooking",
    "eating",
    "drinking",
    "climbing",
    "talking",
    "listening",
    "watching",
    "building",
    "drawing",
    "laughing",
    "crying",
    "playing",
    "working",
    "sleeping",
    "studying",
    "traveling",
    "teaching",
    "learning",
    "driving",
    "throwing"
];

const adjectives = [
    "happy",
    "sad",
    "angry",
    "excited",
    "bright",
    "dark",
    "quick",
    "slow",
    "loud",
    "quiet",
    "strong",
    "weak",
    "hot",
    "cold",
    "soft",
    "hard",
    "sharp",
    "blunt",
    "big",
    "small",
    "tall",
    "short",
    "wide",
    "narrow",
    "beautiful",
    "ugly",
    "friendly",
    "mean",
    "kind",
    "rude",
    "clean",
    "dirty",
    "young",
    "old",
    "rich",
    "poor",
    "funny",
    "serious",
    "brave",
    "shy"
];

export const createRandomUser = () => {
    const components = [adjectives, colorNames, verbsWithIng, nouns];
    const parts = [];

    const numberOfParts = Math.floor(Math.random() * 2) + 2; // 2 or 3 parts

    for (let i = 0; i < numberOfParts; i++) {
        const randomArray = components[Math.floor(Math.random() * components.length)];
        const randomIndex = Math.floor(Math.random() * randomArray.length);
        parts.push(randomArray[randomIndex]);
    }

    return parts.join('');
};