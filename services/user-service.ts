import { db } from "@/config/firebase";
import { NewUser, User } from "@/types";
import { CacheDuration, getCache, removeCache, setCache } from "@/utils/cache";
import { addDoc, collection } from "firebase/firestore";
import { identifyDevice } from "vexo-analytics";

const USER_CACHE_KEY = "user";

const adjectives = [
  "Gizemli",
  "Sessiz",
  "Huzurlu",
  "Umutlu",
  "Cesur",
  "Nazik",
  "Sabırlı",
  "Güçlü",
  "Sevecen",
  "Anlayışlı",
  "Korkusuz",
  "Meraklı",
];

const nouns = [
  "Yıldız",
  "Ay",
  "Güneş",
  "Bulut",
  "Deniz",
  "Rüzgar",
  "Kelebek",
  "Kuş",
  "Çiçek",
  "Ağaç",
  "Nehir",
  "Dağ",
];

export const generateAnonymousName = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999);
  return `${adj}${noun}${number}`;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await getCache<User>(USER_CACHE_KEY);
    if (user) {
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const createUser = async (): Promise<User> => {
  const user: NewUser = {
    anonymousName: generateAnonymousName(),
    createdAt: new Date(),
  };

  // Save to Firebase
  const docRef = await addDoc(collection(db, "users"), {
    ...user,
    createdAt: user.createdAt.toISOString(),
  });

  const savedUser: User = {
    id: docRef.id,
    ...user,
  };

  // Save to local storage (permanent cache for user data)
  await setCache(USER_CACHE_KEY, savedUser, CacheDuration.PERMANENT);

  return savedUser;
};

export const getOrCreateUser = async (): Promise<User> => {
  const existingUser = await getCurrentUser();
  if (existingUser) {
    // Mevcut kullanıcıyı analytics'e tanıt
    identifyDevice(existingUser.id).catch(() => {});
    return existingUser;
  }

  const newUser = await createUser();
  // Yeni kullanıcıyı analytics'e tanıt
  identifyDevice(newUser.id).catch(() => {});
  return newUser;
};

// Clear user data (for logout)
export const clearUserData = async (): Promise<void> => {
  await removeCache(USER_CACHE_KEY);
};
