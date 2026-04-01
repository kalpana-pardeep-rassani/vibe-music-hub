export type Mood = 'happy' | 'sad' | 'chill' | 'energetic';

export interface Song {
  title: string;
  artist: string;
  youtubeUrl: string;
}

export const moodSongs: Record<Mood, Song[]> = {
  happy: [
    { title: "Happy", artist: "Pharrell Williams", youtubeUrl: "https://www.youtube.com/watch?v=ZbZSe6N_BXs" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", youtubeUrl: "https://www.youtube.com/watch?v=iPUmE-tne5U" },
    { title: "Good as Hell", artist: "Lizzo", youtubeUrl: "https://www.youtube.com/watch?v=SmbmeOgWsqE" },
    { title: "Uptown Funk", artist: "Bruno Mars", youtubeUrl: "https://www.youtube.com/watch?v=OPf0YbXqDm0" },
    { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", youtubeUrl: "https://www.youtube.com/watch?v=ru0K8uYEZWw" },
  ],
  sad: [
    { title: "Someone Like You", artist: "Adele", youtubeUrl: "https://www.youtube.com/watch?v=hLQl3WQQoQ0" },
    { title: "Fix You", artist: "Coldplay", youtubeUrl: "https://www.youtube.com/watch?v=k4V3Mo61fJM" },
    { title: "Hurt", artist: "Johnny Cash", youtubeUrl: "https://www.youtube.com/watch?v=8AHCfZTRGiI" },
    { title: "Mad World", artist: "Gary Jules", youtubeUrl: "https://www.youtube.com/watch?v=4N3N1MlvVc4" },
    { title: "Everybody Hurts", artist: "R.E.M.", youtubeUrl: "https://www.youtube.com/watch?v=5rOiW_xY-kc" },
  ],
  chill: [
    { title: "Weightless", artist: "Marconi Union", youtubeUrl: "https://www.youtube.com/watch?v=UfcAVejslrU" },
    { title: "Sunset Lover", artist: "Petit Biscuit", youtubeUrl: "https://www.youtube.com/watch?v=wuCK-oiE3rM" },
    { title: "Electric Feel", artist: "MGMT", youtubeUrl: "https://www.youtube.com/watch?v=MmZexg8sxyk" },
    { title: "Breathe", artist: "Télépopmusik", youtubeUrl: "https://www.youtube.com/watch?v=vyut3ByQIQo" },
    { title: "Tadow", artist: "Masego & FKJ", youtubeUrl: "https://www.youtube.com/watch?v=hC8CH0Z3L54" },
  ],
  energetic: [
    { title: "Lose Yourself", artist: "Eminem", youtubeUrl: "https://www.youtube.com/watch?v=_Yhyp-_hX2s" },
    { title: "Eye of the Tiger", artist: "Survivor", youtubeUrl: "https://www.youtube.com/watch?v=btPJPFnesV4" },
    { title: "Stronger", artist: "Kanye West", youtubeUrl: "https://www.youtube.com/watch?v=PsO6ZnUZI0g" },
    { title: "Thunder", artist: "Imagine Dragons", youtubeUrl: "https://www.youtube.com/watch?v=fKopy74weus" },
    { title: "Blinding Lights", artist: "The Weeknd", youtubeUrl: "https://www.youtube.com/watch?v=4NRXx6U8ABQ" },
  ],
};

export const moodConfig: Record<Mood, { emoji: string; label: string }> = {
  happy: { emoji: "😊", label: "Happy" },
  sad: { emoji: "😢", label: "Sad" },
  chill: { emoji: "😌", label: "Chill" },
  energetic: { emoji: "⚡", label: "Energetic" },
};
