// Function to dynamically apply a theme by adding/removing <link> tags
export const applyTheme = async (themeName, currentThemeLink) => {
    // Remove the existing theme link if it exists
    if (currentThemeLink.current) {
        document.head.removeChild(currentThemeLink.current);
        currentThemeLink.current = null;
    }

    // If a themeName is provided, load the new theme
    if (themeName) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `/themes/${themeName}.css`;
        console.log(link.href)
        link.type = "text/css";
        document.head.appendChild(link);
        currentThemeLink.current = link;
    }
};
