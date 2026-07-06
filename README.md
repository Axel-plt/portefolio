# axel.plot-lab.xyz

Portfolio personnel — athlète, builder, sysadmin.
En ligne : **[axel.plot-lab.xyz](https://axel.plot-lab.xyz)**

## Stack

Site 100 % statique, aucune dépendance de build.

- **HTML / CSS** vanilla
- **JavaScript** vanilla + **GSAP 3** avec ScrollTrigger (via CDN)
- **Three.js** (r128) pour la scène 3D — laptop de glace en primitives, shaders GLSL faits main
- **Typographie** : Space Grotesk (display), Fraunces (body, variable), JetBrains Mono
- **Hébergement** : Vercel + DNS Cloudflare, HTTPS auto

## Structure

```
.
├── index.html
├── vercel.json              # headers de sécurité
├── assets/
│   ├── css/styles.css
│   ├── js/
│   │   ├── scene.js         # Three.js (laptop, neige, shaders)
│   │   └── animations.js    # GSAP + ScrollTrigger, micro-interactions
│   └── img/favicon.svg
└── README.md
```

## Lancer en local

Servir avec un petit serveur statique (les chemins sont absolus) :

```bash
python3 -m http.server 8000
# ou l'extension Live Server de VS Code
```

Puis [http://localhost:8000](http://localhost:8000).

## Déploiement

Vercel est branché sur ce repo — chaque `git push` sur `main` déclenche un déploiement en ~15 secondes.

## Licence

Code sous MIT. Contenu (textes, identité "Axel") réservé.
