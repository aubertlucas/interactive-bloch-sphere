# Visualisation de la Sphère de Bloch

Une visualisation 3D interactive et moderne de la sphère de Bloch pour l'éducation en informatique quantique, utilisant React et Three.js.

## Caractéristiques

- Sphère de Bloch 3D interactive avec contrôles d'orbite, zoom et déplacement
- Affichage en temps réel du vecteur d'état avec notation mathématique
- Visualisation des portes quantiques et de leurs effets
- Outils pédagogiques et tutoriels pour l'apprentissage des concepts d'informatique quantique
- Design responsive pour divers appareils

## Démarrage

1. Clonez le dépôt
2. Installez les dépendances : `npm install`
3. Démarrez le serveur de développement : `npm start` ou utilisez le fichier batch fourni
4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Technologies Utilisées

- React.js pour le framework UI
- Three.js pour le rendu 3D
- Math.js pour les opérations sur les nombres complexes
- Material UI pour les composants d'interface
- React Three Fiber & Drei pour l'intégration de Three.js avec React

## Utilisation

L'application permet aux utilisateurs de :
- Manipuler les états quantiques sur la sphère de Bloch
- Appliquer des portes quantiques et voir leurs effets
- Apprendre les concepts d'informatique quantique grâce à des tutoriels interactifs
- Personnaliser l'apparence et le niveau de détail de la visualisation

## Documentation Technique

La visualisation fonctionne en convertissant les coordonnées sphériques (θ, φ) et les amplitudes complexes (α, β) en un vecteur dans l'espace 3D. Les portes quantiques modifient ces valeurs selon les principes de la mécanique quantique, permettant une représentation visuelle intuitive des transformations d'états quantiques.

## À Propos de l'Auteur

Cet outil a été développé par Lucas AUBERT, ancien étudiant en Master 2 Systèmes Embarqués, grâce aux notes et conseils de M. Dubois. Il vise à fournir une ressource pédagogique interactive pour faciliter la compréhension des concepts fondamentaux de l'informatique quantique.