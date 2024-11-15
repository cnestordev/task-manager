import { createContext, useContext, useState, useEffect, useRef } from "react";
import { checkUser } from "../api/index";
import { applyTheme } from "../utils/themeUtil";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentThemeLink = useRef(null);

  // Check the user session on initial load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data } = await checkUser();
        // Check if response is valid and contains user information
        if (data.statusCode === 200 && data.user) {
          setUser(data.user);
          console.log(data.user)
          // Apply the user's theme if it exists
          if (data.user.theme) {
            applyTheme(data.user.theme, currentThemeLink);
          }
        } else {
          throw new Error("No user data found.");
        }
      } catch (error) {
        setUser(null); // Clear user if not authenticated
      } finally {
        setLoading(false); // Stop loading once check is complete
      }
    };

    checkUserSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    if (userData.theme) {
      applyTheme(userData.theme, currentThemeLink); // Apply theme on login
    }
  };

  const logout = () => {
    setUser(null);
    applyTheme(null, currentThemeLink); // Remove theme on logout
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser.theme) {
      applyTheme(updatedUser.theme, currentThemeLink); // Apply new theme if it’s updated
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
