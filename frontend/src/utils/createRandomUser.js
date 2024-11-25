const colorNames = [
    "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink",
    "Brown", "Cyan", "Magenta", "Lime", "Teal", "Indigo", "Violet",
    "Gold", "Silver", "Beige", "Maroon", "Olive", "Coral"
];

const nouns = [
    "apple", "book", "car", "dog", "elephant", "flower", "guitar",
    "house", "island", "jacket", "kite", "lamp", "mountain", "notebook",
    "ocean", "pencil", "queen", "river", "sandwich", "tree", "umbrella",
    "violin", "window", "xylophone", "yacht", "zebra", "castle", "garden",
    "train", "camera", "bottle", "bridge", "cloud", "planet", "pillow"
];

const verbsWithIng = [
    "running", "jumping", "swimming", "writing", "reading", "dancing",
    "singing", "walking", "flying", "painting", "cooking", "eating",
    "drinking", "climbing", "talking", "listening", "watching", "building",
    "drawing", "laughing", "playing", "working", "sleeping", "studying",
    "traveling", "teaching", "learning", "driving", "throwing"
];

const adjectives = [
    "happy", "excited", "bright", "dark", "quick", "slow", "loud",
    "quiet", "strong", "soft", "hard", "sharp", "big", "small",
    "tall", "far", "wide", "narrow", "beautiful", "friendly",
    "kind", "clean", "young", "old", "rich", "funny", "serious",
    "brave", "shy"
];

// Helper function to get a random element from an array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Main function to create a random user name
export const createRandomUser = () => {
    const components = [adjectives, colorNames, verbsWithIng, nouns];
    const parts = [];

    const numberOfParts = Math.floor(Math.random() * 2) + 2; // 2 or 3 parts

    // Build the random username
    for (let i = 0; i < numberOfParts; i++) {
        const randomArray = getRandomElement(components);
        const randomWord = getRandomElement(randomArray);
        parts.push(randomWord);
    }

    return parts.join('');
};
