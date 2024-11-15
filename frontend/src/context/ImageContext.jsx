import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const ImageContext = createContext(null);

export const useImageContext = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState({});
  const { user } = useUser();
  const assets = user?.team?.assets || {};

  const preloadImage = () => {
    for (let id in assets) {
      // Skip if the asset is null or not a valid URL string
      if (!assets[id]) {
        continue;
      }
      
      // Only load the image if it hasn't been loaded already
      if (images[id] !== assets[id]) {
        const img = new Image();
        img.src = assets[id];

        img.onload = () => {
          setImages((prev) => ({
            ...prev,
            [id]: img,
          }));
        };

        img.onerror = () => {
          console.log(`Failed to load image for id ${id}`);
        };
      }
    }
  };

  useEffect(() => {
    preloadImage();
  }, [user]);
  return (
    <ImageContext.Provider value={{ images }}>{children}</ImageContext.Provider>
  );
};
