import { extendTheme } from "@chakra-ui/react";
import { THEMES } from "../utils/themeConstants";
import { themeColors2 } from "../utils/themeColors";

const createTheme = (user) => {
    const userTheme = user?.theme || THEMES.BLUE;

    // Define colors for light and dark modes
    const colors = {
        light: {
            bg: themeColors2[userTheme].light,
            border: themeColors2[userTheme].dark,
            text: themeColors2[userTheme].dark,
        },
        dark: {
            bg: themeColors2[userTheme].dark,
            border: themeColors2[userTheme].light,
            text: themeColors2[userTheme].light,
        },
    };

    return extendTheme({
        config: {
            initialColorMode: user?.darkMode ? "dark" : "light",
            useSystemColorMode: false,
        },
        components: {
            Button: {
                baseStyle: (props) => ({
                    padding: "5px 12px",
                    lineHeight: "1.2",
                    borderRadius: "50px",
                    fontWeight: "500",
                    minWidth: "80px",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                    bgColor: colors[props.colorMode].bg,
                    color: colors[props.colorMode].text,
                    borderColor: colors[props.colorMode].border,
                    _hover: {
                        bgColor: colors[props.colorMode].text,
                        color: user?.darkMode ? "#fff" : "#000"
                    },
                }),
                defaultProps: {
                    variant: "outline",
                },
            },
            Modal: {
                baseStyle: (props) => ({
                    dialog: {
                        bg: colors[props.colorMode].bg,
                        color: colors[props.colorMode].text,
                        borderColor: colors[props.colorMode].border,
                    },
                }),
            },
            Menu: {
                baseStyle: (props) => ({
                    list: {
                        bg: colors[props.colorMode].bg,
                        borderColor: colors[props.colorMode].border,
                    },
                    item: {
                        bg: colors[props.colorMode].bg,
                        color: colors[props.colorMode].text,
                    },
                }),
            },
            Popover: {
                baseStyle: (props) => ({
                    content: {
                        bg: colors[props.colorMode].bg,
                        color: colors[props.colorMode].text,
                        borderColor: colors[props.colorMode].border,
                    },
                }),
            },
            Drawer: {
                baseStyle: (props) => ({
                    dialog: {
                        bg: colors[props.colorMode].bg,
                        color: colors[props.colorMode].text,
                        borderColor: colors[props.colorMode].border,
                    },
                }),
            },
            Input: {
                baseStyle: (props) => ({
                    field: {
                        bg: colors[props.colorMode].bg,
                        color: colors[props.colorMode].text,
                        borderColor: colors[props.colorMode].border,
                    },
                }),
            },
            Textarea: {
                baseStyle: (props) => ({
                    bg: colors[props.colorMode].bg,
                    color: colors[props.colorMode].text,
                    borderColor: colors[props.colorMode].border,
                }),
            },
            Select: {
                baseStyle: (props) => ({
                    field: {
                        bg: colors[props.colorMode].bg,
                        color: colors[props.colorMode].text,
                        borderColor: colors[props.colorMode].border,
                    },
                }),
            },
        },
    });
};

export default createTheme;
