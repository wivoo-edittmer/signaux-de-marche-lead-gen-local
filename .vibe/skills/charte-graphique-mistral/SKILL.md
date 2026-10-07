---
name: charte-graphique-mistral
description: Applique une charte graphique inspirée de l'univers visuel de Mistral AI (dégradé orange-jaune, pixels carrés, fond crème ou noir, typographie sobre et technique). À utiliser dès que l'utilisateur demande de créer ou mettre en forme une présentation, un document, une page web, une maquette, un dashboard, un poster ou tout livrable visuel "style Mistral", "avec la charte", "avec notre charte graphique" ou "dans l'esprit Mistral", même s'il ne détaille pas les couleurs ou les polices.
---

# Charte graphique – style Mistral

Cette charte est une **interprétation inspirée** de l'identité visuelle de Mistral AI, pas la charte officielle. Elle sert à produire des livrables cohérents, chaleureux et techniques. Si l'utilisateur fournit la charte officielle ou des valeurs exactes (HEX, polices), elles priment sur ce document.

## Esprit général

Trois mots guident toutes les décisions : **chaleureux, net, technique**.

- Chaleureux : fonds crème et dégradés orange plutôt que blanc froid et bleu "tech".
- Net : grands aplats, beaucoup d'espace vide, hiérarchie évidente, peu d'ornements.
- Technique : motif de pixels carrés, détails en monospace, angles droits.

Le contraste vient de la couleur et de la taille du texte, pas des ombres ou des effets.

## Palette

| Rôle | Nom | HEX |
|---|---|---|
| Accent principal | Orange Mistral | `#FA520F` |
| Accent secondaire | Orange clair | `#FF8205` |
| Accent tertiaire | Ambre | `#FFAF00` |
| Accent chaud | Jaune | `#FFD800` |
| Fond clair | Crème | `#FFFAEB` |
| Fond clair alt. | Sable | `#FFF0C3` |
| Fond sombre | Noir chaud | `#1A1A1A` |
| Texte sur clair | Noir | `#1A1A1A` |
| Texte sur sombre | Crème | `#FFFAEB` |
| Texte secondaire | Gris chaud | `#6B6459` |
| Filets, bordures | Beige | `#E9E2CB` |

### Dégradé signature

Le dégradé va du jaune vers l'orange puis le rouge-orangé, souvent en bandes ou en paliers de carrés plutôt qu'en transition lisse :

`#FFD800 → #FFAF00 → #FF8205 → #FA520F → #E10500`

### Règles d'usage des couleurs

- Fond par défaut : crème `#FFFAEB`. Le noir chaud sert aux sections de rupture (couverture, citation, conclusion).
- Un seul accent dominant par page ou diapositive (en général `#FA520F`). Le reste du dégradé apparaît dans le motif pixel, pas dans le texte.
- Ne jamais utiliser de bleu, violet ou vert comme couleur d'accent. Pour un graphique à plusieurs séries, décliner le dégradé orange et ajouter du noir et du gris chaud.
- Ne jamais mettre de texte jaune sur fond crème (contraste insuffisant). Le jaune est réservé aux aplats et aux pixels.
- Texte orange `#FA520F` sur crème : réservé aux titres de grande taille (≥ 24 pt) ou aux étiquettes courtes.

## Typographie

| Usage | Police recommandée | Repli |
|---|---|---|
| Titres | Sans-serif géométrique, graisse moyenne à semi-grasse (Inter, Geist, Helvetica Neue) | Arial |
| Texte courant | Même famille, graisse normale | Arial |
| Étiquettes, chiffres, légendes, code | Monospace (Geist Mono, JetBrains Mono, IBM Plex Mono) | Courier New |

Règles :

- Titres en **minuscules ou casse de phrase**, jamais en capitales intégrales (sauf petites étiquettes monospace).
- Titres grands et serrés : taille ≥ 2,5× le texte courant, interlignage ~1,05–1,15.
- Texte courant : interlignage ~1,5, longueur de ligne 60–75 caractères.
- Les petits éléments d'information (numéros de section, dates, tags, sources) passent en monospace, en gris chaud ou en orange.
- Deux familles maximum. Trois graisses maximum.

## Motif signature : les pixels carrés

Le logo Mistral est construit sur une grille de carrés. Reprendre cette idée comme motif décoratif :

- Grille de carrés de taille uniforme, sans arrondi, sans contour.
- Chaque carré prend une couleur du dégradé signature ; l'ensemble forme une bande, un escalier ou un coin dégradé.
- Placement : bandeau en bas ou en haut de page, coin d'une couverture, séparateur de section. Jamais en fond derrière du texte.
- Un seul motif pixel par page ou diapositive. Il doit rester un accent, pas devenir le sujet.
- Ne pas reproduire ni imiter le logo officiel. Utiliser le logo uniquement si l'utilisateur le fournit.

## Mise en page

- Marges généreuses : au moins 8 % de la largeur sur les côtés.
- Grille à 12 colonnes (web) ou 2 à 3 blocs larges (diapositives). Aligner à gauche par défaut.
- Angles **droits** partout : pas de coins arrondis (ou 2–4 px maximum sur éléments d'interface comme les boutons).
- Pas d'ombres portées, pas de flou, pas de dégradés lisses sur les boutons. Un aplat ou un filet fin suffit.
- Séparer les zones par des filets beige `#E9E2CB` de 1 px ou par un changement de fond.
- Une idée par page ou diapositive ; un message principal en grand, le détail en petit dessous.

## Composants

**Boutons** : fond noir `#1A1A1A` texte crème (principal) ; fond orange `#FA520F` texte crème (accent) ; contour 1 px noir sans fond (secondaire). Texte en monospace ou semi-gras, angles droits.

**Cartes** : fond sable `#FFF0C3` ou crème avec filet beige ; titre en haut, chiffre clé en grand, source en monospace gris.

**Graphiques** : fond transparent ou crème, quadrillage beige très léger, séries en orange puis jaune puis noir puis gris chaud, légendes en monospace, pas de 3D.

**Tableaux** : en-têtes en monospace gris chaud, lignes séparées par des filets beige, aucune alternance de couleurs forte.

**Couverture** : fond noir chaud ou crème, titre très grand aligné à gauche, bande de pixels dégradés en bas, date et auteur en monospace.

## Ton rédactionnel

Phrases courtes, directes, sans jargon marketing. Titres affirmatifs ("Le coût a baissé de 40 %") plutôt que descriptifs ("Évolution des coûts"). Chiffres en évidence.

## Application selon le format

- **Web / HTML** : définir les couleurs en variables CSS (`--orange: #FA520F`, etc.), prévoir un thème sombre basé sur `#1A1A1A`, charger les polices via Google Fonts avec repli système.
- **Présentation (.pptx)** : fond crème, titre 40–54 pt, corps 18–22 pt, un bandeau de pixels sur la couverture et les diapositives de section seulement.
- **Document (.docx / PDF)** : fond blanc ou crème en impression, titres en noir avec filet orange court dessous, numéros de page et références en monospace.
- **Visuels / posters** : grand aplat orange ou noir, texte crème, pixels dégradés en bord de composition.

## Vérification avant livraison

1. Un seul accent dominant, pas de couleur hors palette ?
2. Texte lisible (contraste suffisant, aucun texte jaune sur crème) ?
3. Angles droits, pas d'ombres ni d'effets superflus ?
4. Motif pixel présent mais discret, une seule fois par page ?
5. Hiérarchie claire : un titre fort, un message principal, du vide autour ?
6. Éléments techniques (chiffres, étiquettes, sources) en monospace ?
