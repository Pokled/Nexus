export const fortunes: string[] = [
  "Le réseau, ce sont les gens.",
  "Né le 18 février 2026 à 23h37.",
  "Internet n'a pas été inventé pour nous surveiller.",
  "Ton serveur. Tes données. Ta liberté.",
  "phpBB avait raison depuis le début.",
  "Pas de KYC. Pas de surveillance. Pas de compromis.",
  "Fork us if we betray you.",
  "Ventrilo, TeamSpeak, phpBB — on n'a pas oublié.",
  "L'âme de 2000, le corps de 2026.",
  "Croche et tiens.",
]

export const getRandomFortune = (): string => {
  return fortunes[Math.floor(Math.random() * fortunes.length)]
}