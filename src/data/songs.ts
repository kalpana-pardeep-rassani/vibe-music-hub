export type Mood = 'happy' | 'sad' | 'chill' | 'energetic' | 'recommended';

export interface Song {
  title: string;
  artist: string;
  youtubeUrl: string;
  language: string;
}

export const moodSongs: Record<Exclude<Mood, 'recommended'>, Song[]> = {
  happy: [
    { title: "Happy", artist: "Pharrell Williams", youtubeUrl: "https://www.youtube.com/watch?v=ZbZSe6N_BXs", language: "English" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", youtubeUrl: "https://www.youtube.com/watch?v=iPUmE-tne5U", language: "English" },
    { title: "Good as Hell", artist: "Lizzo", youtubeUrl: "https://www.youtube.com/watch?v=SmbmeOgWsqE", language: "English" },
    { title: "Uptown Funk", artist: "Bruno Mars", youtubeUrl: "https://www.youtube.com/watch?v=OPf0YbXqDm0", language: "English" },
    { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", youtubeUrl: "https://www.youtube.com/watch?v=ru0K8uYEZWw", language: "English" },
    { title: "Balam Pichkari", artist: "Vishal-Shekhar", youtubeUrl: "https://www.youtube.com/watch?v=0WtRNGubWGA", language: "Hindi" },
    { title: "London Thumakda", artist: "Labh Janjua", youtubeUrl: "https://www.youtube.com/watch?v=udra3Mfw2oo", language: "Hindi" },
    { title: "Gallan Goodiyaan", artist: "Shankar Mahadevan", youtubeUrl: "https://www.youtube.com/watch?v=jCEdTq3j-0U", language: "Hindi" },
    { title: "Dil Dhadakne Do", artist: "Priyanka Chopra", youtubeUrl: "https://www.youtube.com/watch?v=t0MRGkL2FBQ", language: "Hindi" },
    { title: "Mundian To Bach Ke", artist: "Panjabi MC", youtubeUrl: "https://www.youtube.com/watch?v=DJztXj2GPfk", language: "Punjabi" },
    { title: "Proper Patola", artist: "Diljit Dosanjh", youtubeUrl: "https://www.youtube.com/watch?v=gDnE-5LOSIc", language: "Punjabi" },
    { title: "Pasoori", artist: "Ali Sethi & Shae Gill", youtubeUrl: "https://www.youtube.com/watch?v=5Eqb_-j3FDA", language: "Urdu" },
    { title: "Billo Hai", artist: "Sahara feat Manj Musik", youtubeUrl: "https://www.youtube.com/watch?v=R5EjAjBGbSk", language: "Urdu" },
    { title: "Vivir Mi Vida", artist: "Marc Anthony", youtubeUrl: "https://www.youtube.com/watch?v=YXnjy5YlDwk", language: "Spanish" },
    { title: "Bailando", artist: "Enrique Iglesias", youtubeUrl: "https://www.youtube.com/watch?v=NUsoVlDFqZg", language: "Spanish" },
  ],
  sad: [
    { title: "Someone Like You", artist: "Adele", youtubeUrl: "https://www.youtube.com/watch?v=hLQl3WQQoQ0", language: "English" },
    { title: "Fix You", artist: "Coldplay", youtubeUrl: "https://www.youtube.com/watch?v=k4V3Mo61fJM", language: "English" },
    { title: "Hurt", artist: "Johnny Cash", youtubeUrl: "https://www.youtube.com/watch?v=8AHCfZTRGiI", language: "English" },
    { title: "Mad World", artist: "Gary Jules", youtubeUrl: "https://www.youtube.com/watch?v=4N3N1MlvVc4", language: "English" },
    { title: "Everybody Hurts", artist: "R.E.M.", youtubeUrl: "https://www.youtube.com/watch?v=5rOiW_xY-kc", language: "English" },
    { title: "Tujhe Bhula Diya", artist: "Mohit Chauhan", youtubeUrl: "https://www.youtube.com/watch?v=4dNBOg0727E", language: "Hindi" },
    { title: "Channa Mereya", artist: "Arijit Singh", youtubeUrl: "https://www.youtube.com/watch?v=284Ov7ysmfA", language: "Hindi" },
    { title: "Tum Hi Ho", artist: "Arijit Singh", youtubeUrl: "https://www.youtube.com/watch?v=Umqb9KENgmk", language: "Hindi" },
    { title: "Ikk Kudi", artist: "Shahid Mallya", youtubeUrl: "https://www.youtube.com/watch?v=wILFddYxaXE", language: "Punjabi" },
    { title: "Woh Lamhe", artist: "Atif Aslam", youtubeUrl: "https://www.youtube.com/watch?v=cN5U3MrFah0", language: "Urdu" },
    { title: "Tajdar-e-Haram", artist: "Atif Aslam", youtubeUrl: "https://www.youtube.com/watch?v=a18py61_F_w", language: "Urdu" },
    { title: "Recuérdame", artist: "Carlos Rivera", youtubeUrl: "https://www.youtube.com/watch?v=cLcxpSH_E8Y", language: "Spanish" },
  ],
  chill: [
    { title: "Weightless", artist: "Marconi Union", youtubeUrl: "https://www.youtube.com/watch?v=UfcAVejslrU", language: "English" },
    { title: "Sunset Lover", artist: "Petit Biscuit", youtubeUrl: "https://www.youtube.com/watch?v=wuCK-oiE3rM", language: "English" },
    { title: "Electric Feel", artist: "MGMT", youtubeUrl: "https://www.youtube.com/watch?v=MmZexg8sxyk", language: "English" },
    { title: "Breathe", artist: "Télépopmusik", youtubeUrl: "https://www.youtube.com/watch?v=vyut3ByQIQo", language: "English" },
    { title: "Tadow", artist: "Masego & FKJ", youtubeUrl: "https://www.youtube.com/watch?v=hC8CH0Z3L54", language: "English" },
    { title: "Agar Tum Saath Ho", artist: "Arijit Singh", youtubeUrl: "https://www.youtube.com/watch?v=sK7riqg2mr4", language: "Hindi" },
    { title: "Ilahi", artist: "Arijit Singh", youtubeUrl: "https://www.youtube.com/watch?v=3OP8fPn6MxA", language: "Hindi" },
    { title: "Khaabon Ke Parinday", artist: "Mohit Chauhan", youtubeUrl: "https://www.youtube.com/watch?v=UFFL_vJPMpM", language: "Hindi" },
    { title: "Soch Na Sake", artist: "Arijit Singh", youtubeUrl: "https://www.youtube.com/watch?v=nDMwj7pHSVE", language: "Hindi" },
    { title: "Tera Ban Jaunga", artist: "Akhil Sachdeva", youtubeUrl: "https://www.youtube.com/watch?v=1sMqnibJmx0", language: "Hindi" },
    { title: "Laung Laachi", artist: "Mannat Noor", youtubeUrl: "https://www.youtube.com/watch?v=dBkeCge2FJo", language: "Punjabi" },
    { title: "Dil Diyan Gallan", artist: "Atif Aslam", youtubeUrl: "https://www.youtube.com/watch?v=SAcpESN_Fk4", language: "Urdu" },
    { title: "Sólo Con Verte", artist: "Banda MS", youtubeUrl: "https://www.youtube.com/watch?v=oGDjsceOlMA", language: "Spanish" },
  ],
  energetic: [
    { title: "Lose Yourself", artist: "Eminem", youtubeUrl: "https://www.youtube.com/watch?v=_Yhyp-_hX2s", language: "English" },
    { title: "Eye of the Tiger", artist: "Survivor", youtubeUrl: "https://www.youtube.com/watch?v=btPJPFnesV4", language: "English" },
    { title: "Stronger", artist: "Kanye West", youtubeUrl: "https://www.youtube.com/watch?v=PsO6ZnUZI0g", language: "English" },
    { title: "Thunder", artist: "Imagine Dragons", youtubeUrl: "https://www.youtube.com/watch?v=fKopy74weus", language: "English" },
    { title: "Blinding Lights", artist: "The Weeknd", youtubeUrl: "https://www.youtube.com/watch?v=4NRXx6U8ABQ", language: "English" },
    { title: "Khalibali", artist: "Shivam Pathak", youtubeUrl: "https://www.youtube.com/watch?v=v7K4vGYL9zI", language: "Hindi" },
    { title: "Malhari", artist: "Vishal Dadlani", youtubeUrl: "https://www.youtube.com/watch?v=l_MyUGq7pgs", language: "Hindi" },
    { title: "Kar Gayi Chull", artist: "Badshah", youtubeUrl: "https://www.youtube.com/watch?v=NTHz9ephYTw", language: "Hindi" },
    { title: "Amplifier", artist: "Imran Khan", youtubeUrl: "https://www.youtube.com/watch?v=xHJMfF-4cFs", language: "Punjabi" },
    { title: "Satisfya", artist: "Imran Khan", youtubeUrl: "https://www.youtube.com/watch?v=IrBMEMomVQg", language: "Punjabi" },
    { title: "Na Ja", artist: "Pav Dharia", youtubeUrl: "https://www.youtube.com/watch?v=IccmGuzMnfM", language: "Punjabi" },
    { title: "Abhi Toh Party", artist: "Badshah", youtubeUrl: "https://www.youtube.com/watch?v=x17EWtsb-MQ", language: "Urdu" },
    { title: "Gasolina", artist: "Daddy Yankee", youtubeUrl: "https://www.youtube.com/watch?v=CCF1_jI8Prk", language: "Spanish" },
    { title: "Despacito", artist: "Luis Fonsi", youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk", language: "Spanish" },
  ],
};

export const moodConfig: Record<Exclude<Mood, 'recommended'>, { emoji: string; label: string }> = {
  happy: { emoji: "😊", label: "Happy" },
  sad: { emoji: "😢", label: "Sad" },
  chill: { emoji: "😌", label: "Chill" },
  energetic: { emoji: "⚡", label: "Energetic" },
};

export const allMoodConfigs: Record<Mood, { emoji: string; label: string }> = {
  ...moodConfig,
  recommended: { emoji: "✨", label: "For You" },
};
