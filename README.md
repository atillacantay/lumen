# 🌙 Lumen - Anonymous Venting Platform

A mobile application where people can anonymously share their troubles and support each other through difficult times.

## 📱 Features

- **Anonymous Sharing**: Hide your identity with automatically generated nicknames
- **Category System**: Relationships, Family, Work/Career, School, Financial, Health, Loneliness, Anxiety/Stress, Other
- **Hug System**: Instead of "likes", users can send supportive "hugs" 🤗
- **Commenting**: Offer support and comfort to others' troubles
- **Image Upload**: Free image hosting via Cloudinary
- **Category Filtering**: Easily find topics you're interested in
- **Search**: Search through posts

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Database**: Firebase Firestore
- **Image Hosting**: Cloudinary (Free tier)
- **Navigation**: Expo Router

## 📁 Project Structure

```
project-lumen/
├── app/                    # Pages (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home (Feed)
│   │   ├── explore.tsx    # Explore
│   │   └── profile.tsx    # Profile
│   ├── create-post.tsx    # New post
│   └── post/[id].tsx      # Post detail
├── components/            # UI Components
├── config/               # Firebase & Cloudinary config
├── constants/            # Categories, Theme
├── context/              # User Context
├── services/             # Firebase services
└── types/                # TypeScript types
```

## 🎨 Color Palette

| Theme | Primary | Secondary | Hug     |
| ----- | ------- | --------- | ------- |
| Light | #6C5CE7 | #00B894   | #FF7675 |
| Dark  | #A29BFE | #55EFC4   | #FF7675 |

## 📝 Roadmap

- [ ] Push Notifications
- [ ] Report/Flag system
- [ ] Admin panel
- [ ] More categories
- [ ] Bookmarks/Favorites
