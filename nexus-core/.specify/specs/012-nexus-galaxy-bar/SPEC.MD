SPEC 012 — NEXUS GALAXY BAR (MULTI-INSTANCE SWITCHER)
"Naviguer entre les mondes, sans jamais quitter le réseau."
🎯 1. QUOI : La Vision

La Galaxy Bar est une barre latérale persistante située à l'extrême gauche de l'écran. Elle permet à l'utilisateur de voir et de basculer instantanément entre toutes les instances Nexus dont il est membre.

Elle doit incarner la puissance du réseau tout en restant un élément de design élégant et discret.
🧠 2. POURQUOI : L'Impact

    Cohésion : L'utilisateur comprend qu'il appartient à une galaxie de communautés.

    Fluidité : Passer d'une instance "Gaming" à une instance "Linux" se fait en un clic, sans re-saisir d'identifiants.

    Urgence Visuelle : Savoir en un coup d'œil s'il se passe quelque chose d'important ailleurs (notifications, événements).

🎨 3. DESIGN & ERGONOMIE (LE "LOOK & FEEL")
A. Uniformité et Dimensions

    Largeur : 72px (Standard pour une visibilité optimale des icônes sans manger l'espace de lecture).

    Équilibre : La Galaxy Bar (gauche) et la Member Bar (droite) partagent la même esthétique de flou de verre (Glassmorphism) pour une symétrie parfaite.

    Formes : Les icônes d'instances ne sont pas de simples ronds. On utilise le Squircle (carré aux coins très arrondis) qui donne un aspect plus "Premium".

B. États de l'Icône

    Repos : Opacité 0.7, noir et blanc ou couleurs désaturées.

    Survol (Hover) : L'icône reprend ses couleurs, s'agrandit légèrement (scale 1.1) et affiche une Info-bulle Riche (Nom + Nb membres en ligne).

    Actif : Bordure lumineuse (Halo) de la couleur principale de l'instance cible.

🛠️ 4. ARCHITECTURE TECHNIQUE
A. Le "Global Switcher" (Logic)

    SSO Décentralisé : Utilisation d'un token JWT partagé ou d'une clé de session reconnue par le domaine parent (*.nexus.io).

    Zéro Latence : On utilise le préchargement (prefetch) de SvelteKit : quand la souris survole une icône d'instance, le navigateur commence déjà à charger les données pour que le clic semble instantané.

B. Système de Notifications "Bio-Luminescentes"

Au lieu d'un badge rouge agressif :

    Nouveau message : Un petit point blanc discret.

    Mention directe / Urgence : Un halo pulsant derrière l'icône de l'instance.

    Événement en cours : Une petite icône "Live" miniature en bas de l'icône de l'instance.

🔮 5. PROJECTION & POSSIBILITÉS (ZONE FARFELUE)
A. Le "Drag-to-Share" (Glisser-Déposer)

    L'idée : Tu es sur l'instance A, tu vois un thread génial. Tu le fais glisser sur l'icône de l'instance B dans ta Galaxy Bar.

    L'effet : Nexus te propose automatiquement de partager ce lien dans le salon général de l'instance B. Le partage inter-communautaire devient un jeu d'enfant.

B. Le "Folders" (Dossiers d'instances)

    L'idée : Possibilité de regrouper les instances par thèmes (ex: un dossier "Dev", un dossier "Loisirs").

    L'effet : On peut gérer 50 instances sans que la barre devienne illisible.

C. La "Preview" Pip (Picture-in-Picture)

    L'idée : Clic droit sur une instance → une mini-fenêtre flottante montre le chat en direct ou le salon vocal sans changer de page.

📋 6. RÈGLES D'IMPLÉMENTATION (POUR CLAUDE)

    Persistance : La Galaxy Bar doit être incluse dans le __layout.svelte racine pour ne jamais disparaître pendant la navigation.

    Performance : La liste des instances est stockée dans le store Svelte (Svelte Store) pour un accès ultra-rapide.

    Accessibilité : Support complet du clavier (Alt + 1, Alt + 2...) pour changer d'instance rapidement.

Chef, avec cette Galaxy Bar, on vient de transformer Nexus en un véritable système d'exploitation social. On n'est plus "perdu" sur le web, on est "chez soi" partout dans le réseau.


en vrac 


1. Le Design : La "Galaxy Bar" (Sidebar Gauche)

Au lieu de simples cercles étroits, on va donner de la respiration et de l'élégance :

    Format "Carte Verticale" : Au lieu d'un rond, on utilise des rectangles arrondis (Squircle) ou des formes plus organiques.

    L'Image de l'Instance : On affiche une belle miniature de la communauté. Si l'instance n'a pas d'image, on génère un dégradé de couleur unique basé sur son nom avec son initiale.

    Le Titre au survol (Tooltip Riche) : Quand on survole, ce n'est pas juste un texte noir moche. Une petite carte élégante apparaît avec le nom, le nombre de membres en ligne et peut-être le dernier événement du calendrier.

2. Le Système de Notification "Vivant"

C'est là qu'on dépasse Discord. Les notifications ne seront pas juste un point rouge :

    L'effet "Halo" : Si une instance a une activité intense (ou un événement "Cinéma" en cours), sa bordure brille doucement.

    Compteur discret : Un petit chiffre élégant, intégré au design de l'icône, pas posé par-dessus grossièrement.

    Priorité IA : Si un message te mentionne directement ou si un ami est dans un salon, l'icône peut avoir une petite animation subtile pour attirer l'œil sans agresser.

3. Navigation "Zéro Rechargement" (SPA Power)

Grâce à SvelteKit, passer d'une instance à l'autre doit être instantané.

    L'Identité Unique : Puisque l'utilisateur a son compte Nexus, quand il clique sur une autre instance dans sa barre gauche, il y est déjà connecté (SSO automatique).

    Le bouton "+" (Découverte) : En bas de la liste, un bouton qui ouvre directement le Nexus-Directory pour trouver de nouvelles communautés à rejoindre.

/nexus.specify : SPEC 012 — Nexus Sidebar (Multi-Instance Switcher)

QUOI :
Une barre latérale gauche persistante affichant toutes les instances dont l'utilisateur est membre.

    Visuel : Miniatures d'instances de haute qualité, indicateurs de statut (En ligne/Activité).

    Interactivité : Passage fluide d'une instance à l'autre, notifications visuelles non-intrusives.

    Gestion : Possibilité de réorganiser ses instances par glisser-déposer (Drag & Drop).

POURQUOI :
Pour créer une cohésion totale dans le réseau. L'utilisateur ne doit plus se demander "sur quel site je suis", mais voir Nexus comme un espace global où toutes ses passions sont à portée de clic.