# Technical Documentation - Bloch Sphere Visualization

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Main Modules](#main-modules)
   - [Quantum State Context](#quantum-state-context)
   - [Bloch Sphere Visualization](#bloch-sphere-visualization)
   - [Control Panel](#control-panel)
   - [Tutorial Modal](#tutorial-modal)
   - [Quantum Operations](#quantum-operations)
4. [Data Flow](#data-flow)
5. [APIs and Interfaces](#apis-and-interfaces)
6. [Maintenance Guide](#maintenance-guide)
7. [Recommendations for Future Development](#recommendations-for-future-development)

## Introduction

This application is an interactive and educational visualization of the Bloch sphere, used to represent and manipulate single-qubit quantum states. Developed by Lucas AUBERT (former Master 2 Embedded Systems student) with the support of Dr. Dubois, it allows users to visually understand the fundamental concepts of quantum computing.

## System Architecture

The application is built with React and uses a component-based architecture with centralized state management. The main technologies used are:

- **React 18.2.0**: Front-end framework for building the user interface
- **Three.js 0.160.0**: Library for 3D rendering
- **React Three Fiber/Drei**: Three.js adaptation for React
- **Material UI 5.13.6**: UI components library
- **Mathjs 11.8.0**: Library for complex mathematical operations

The architecture follows a contextual design pattern (Context Provider Pattern) where the quantum state is managed centrally and accessible to all components.

## Main Modules

### Quantum State Context
**File**: `src/context/QuantumStateContext.js`

This module implements centralized state management for all quantum operations. It uses React's Context API to provide a shared state to all application components.

#### Initial state
```javascript
const initialState = {
  // Spherical coordinates (θ, φ)
  theta: 0, // [0, π]
  phi: 0,   // [0, 2π]
  
  // Amplitude coefficients α|0⟩ + β|1⟩
  alpha: complex(1, 0),
  beta: complex(0, 0),
  
  // Bloch vector coordinates (x, y, z)
  blochVector: { x: 0, y: 0, z: 1 },
  
  // History of applied gates
  gateHistory: [],
  
  // Display options
  showAxes: true,
  showGrid: true,
  // ... other display options
  sphereOpacity: 0.25,
};
```

#### Main functions
- `setStateFromSpherical(theta, phi)`: Sets the state from spherical coordinates
- `setStateFromAmplitudes(alpha, beta)`: Sets the state from complex amplitudes
- `setStateFromAmplitudesWithAnimation(alpha, beta, gateName)`: Sets the state with animation and logging
- `setToCommonState(stateName)`: Configures the state to a predefined value (|0⟩, |1⟩, |+⟩, etc.)
- `getMeasurementProbabilities()`: Calculates measurement probabilities for |0⟩ and |1⟩
- `getStateVectorNotation()`: Generates a textual representation of the quantum state

### Bloch Sphere Visualization
**File**: `src/components/BlochSphereVisualization.js`

This component is responsible for the 3D rendering of the Bloch sphere, using Three.js via React Three Fiber.

#### Key features
- 3D sphere rendering with adjustable transparency
- Drawing of axes, grid, equator, and meridians
- Display of the state vector and its components
- Orbit controls for camera rotation
- Display of angle arcs (θ, φ)
- Annotations of important points (|0⟩, |1⟩, etc.)
- Calculation and display of measurement probabilities

### Control Panel
**File**: `src/components/ControlPanel.js`

User interface allowing manipulation of the quantum state and display configuration.

#### Structure
- Tab system to organize controls
- Controls for applying quantum gates (X, Y, Z, H, S, T)
- Sliders for direct manipulation of θ and φ angles
- Buttons for predefined states
- Display options to customize the visualization
- Educational section on quantum concepts

### Tutorial Modal
**File**: `src/components/TutorialModal.js`

Guided interface for learning quantum concepts through progressive interactive steps.

#### Features
- Step-by-step presentation of basic concepts
- Interactive demonstrations of quantum gates
- Explanation of notations and representations
- Navigation between steps with user interaction

### Quantum Operations
**File**: `src/utils/quantumOperations.js`

Utility library implementing quantum transformations and coordinate conversions.

#### Implemented quantum gates
- Pauli gates (X, Y, Z)
- Hadamard gate (H)
- Phase gates (S, S†, T, T†)
- Rotation gates (Rx, Ry, Rz)

#### Conversion functions
- `blochToAmplitudes(x, y, z)`: Conversion from Bloch vector to amplitudes
- `amplitudesToBloch(alpha, beta)`: Conversion from amplitudes to Bloch vector
- `sphericalToAmplitudes(theta, phi)`: Conversion from spherical coordinates to amplitudes
- `amplitudesToSpherical(alpha, beta)`: Conversion from amplitudes to spherical coordinates

## Data Flow

1. **User Interaction**:
   - The user interacts with the control panel
   - Actions trigger state updates via the context

2. **State Update**:
   - The `QuantumStateContext` calculates new values
   - Derived values are updated (Bloch vector, amplitudes)

3. **Update Propagation**:
   - New states are propagated to subscribed components
   - The visualization is rendered with new values

4. **Rendering**:
   - The `BlochSphereVisualization` component updates the 3D scene
   - Textual information is updated in the interface

## APIs and Interfaces

### Quantum Context API
```javascript
// Context access
const { 
  state,                            // Complete quantum state
  setStateFromSpherical,            // Update by spherical coordinates
  setStateFromAmplitudes,           // Update by amplitudes
  setStateFromAmplitudesWithAnimation, // Update with animation
  resetState,                       // Reset
  setToCommonState,                 // Predefined states
  toggleDisplayOption,              // Display options
  setSphereOpacity,                 // Sphere transparency
  getMeasurementProbabilities,      // Measurement probabilities
  getStateVectorNotation            // Textual notation
} = useQuantumState();
```

### State Structure
```javascript
state = {
  // Primary coordinates
  theta: Number,           // Elevation angle [0, π]
  phi: Number,             // Azimuthal angle [0, 2π]
  
  // Quantum amplitudes
  alpha: Complex,          // Amplitude of |0⟩
  beta: Complex,           // Amplitude of |1⟩
  
  // Cartesian coordinates of the Bloch vector
  blochVector: {
    x: Number,
    y: Number,
    z: Number
  },
  
  // History and display options
  gateHistory: Array,
  showAxes: Boolean,
  // ... other display options
}
```

## Maintenance Guide

### Adding a New Quantum Gate
1. Define the transformation function in `quantumOperations.js`
2. Add the corresponding case in the `applyGate` function
3. Add the user interface in `ControlPanel.js`

### Customizing 3D Display
1. Visual elements are defined in React Three Fiber components
2. Each element (axis, grid, etc.) is togglable via a state option
3. Colors and materials are defined in `BlochSphereVisualization.js`

### Modifying the Tutorial
1. Tutorial steps are defined in `TutorialModal.js`
2. Each step includes a title, content, and optional actions
3. Actions can be linked to quantum context functions

## Recommendations for Future Development

1. **Performance Improvements**:
   - Three.js rendering optimization for mobile devices
   - Caching of frequent calculations

2. **Functional Extensions**:
   - Support for multi-qubit systems
   - Visualization of quantum circuits
   - Simulation of quantum measurements

3. **Interface Improvements**:
   - Fullscreen mode for visualization
   - Export/import of quantum states
   - Advanced customization of colors and themes

---

*This documentation was created for the "Bloch Sphere Visualization" project, developed by Lucas AUBERT under the guidance of Dr. Dubois. Last updated: March 30, 2025.*

# Documentation Technique - Visualisation de la Sphère de Bloch

## Table des Matières

1. [Introduction](#introduction)
2. [Architecture du Système](#architecture-du-système)
3. [Modules Principaux](#modules-principaux)
   - [Contexte de l'État Quantique](#contexte-de-létat-quantique)
   - [Visualisation de la Sphère de Bloch](#visualisation-de-la-sphère-de-bloch)
   - [Panneau de Contrôle](#panneau-de-contrôle)
   - [Modal de Tutoriel](#modal-de-tutoriel)
   - [Opérations Quantiques](#opérations-quantiques)
4. [Flux de Données](#flux-de-données)
5. [API et Interfaces](#api-et-interfaces)
6. [Guide de Maintenance](#guide-de-maintenance)
7. [Recommandations pour le Développement Futur](#recommandations-pour-le-développement-futur)

## Introduction

Cette application est une visualisation interactive et éducative de la sphère de Bloch, utilisée pour représenter et manipuler des états quantiques à un qubit. Développée par Lucas AUBERT (ancien étudiant en Master 2 Systèmes Embarqués) avec le soutien de Dr. Dubois, elle permet aux utilisateurs de comprendre visuellement les concepts fondamentaux de l'informatique quantique.

## Architecture du Système

L'application est construite avec React et utilise une architecture basée sur les composants avec gestion d'état centralisée. Les principales technologies utilisées sont:

- **React 18.2.0**: Framework front-end pour la construction de l'interface utilisateur
- **Three.js 0.160.0**: Bibliothèque pour le rendu 3D
- **React Three Fiber/Drei**: Adaptation de Three.js pour React
- **Material UI 5.13.6**: Bibliothèque de composants UI
- **Mathjs 11.8.0**: Bibliothèque pour les opérations mathématiques complexes

L'architecture suit un modèle de conception contextuel (Context Provider Pattern) où l'état quantique est géré de manière centralisée et accessible à tous les composants.

## Modules Principaux

### Contexte de l'État Quantique
**Fichier**: `src/context/QuantumStateContext.js`

Ce module implémente la gestion d'état centralisée pour toutes les opérations quantiques. Il utilise l'API Context de React pour fournir un état partagé à tous les composants de l'application.

#### État initial
```javascript
const initialState = {
  // Coordonnées sphériques (θ, φ)
  theta: 0, // [0, π]
  phi: 0,   // [0, 2π]
  
  // Coefficients d'amplitude α|0⟩ + β|1⟩
  alpha: complex(1, 0),
  beta: complex(0, 0),
  
  // Coordonnées du vecteur de Bloch (x, y, z)
  blochVector: { x: 0, y: 0, z: 1 },
  
  // Historique des portes appliquées
  gateHistory: [],
  
  // Options d'affichage
  showAxes: true,
  showGrid: true,
  // ... autres options d'affichage
  sphereOpacity: 0.25,
};
```

#### Fonctions principales
- `setStateFromSpherical(theta, phi)`: Définit l'état à partir des coordonnées sphériques
- `setStateFromAmplitudes(alpha, beta)`: Définit l'état à partir des amplitudes complexes
- `setStateFromAmplitudesWithAnimation(alpha, beta, gateName)`: Définit l'état avec animation et logging
- `setToCommonState(stateName)`: Configure l'état à une valeur prédéfinie (|0⟩, |1⟩, |+⟩, etc.)
- `getMeasurementProbabilities()`: Calcule les probabilités de mesure pour |0⟩ et |1⟩
- `getStateVectorNotation()`: Génère une représentation textuelle de l'état quantique

### Visualisation de la Sphère de Bloch
**Fichier**: `src/components/BlochSphereVisualization.js`

Ce composant est responsable du rendu 3D de la sphère de Bloch, utilisant Three.js via React Three Fiber.

#### Caractéristiques clés
- Rendu de la sphère en 3D avec transparence ajustable
- Dessin des axes, grille, équateur et méridiens
- Affichage du vecteur d'état et de ses composantes
- Contrôles d'orbite pour la rotation de la caméra
- Affichage des arcs d'angles (θ, φ)
- Annotations des points importants (|0⟩, |1⟩, etc.)
- Calcul et affichage des probabilités de mesure

### Panneau de Contrôle
**Fichier**: `src/components/ControlPanel.js`

Interface utilisateur permettant la manipulation de l'état quantique et la configuration de l'affichage.

#### Structure
- Système d'onglets pour organiser les contrôles
- Contrôles pour l'application des portes quantiques (X, Y, Z, H, S, T)
- Sliders pour la manipulation directe des angles θ et φ
- Boutons pour les états prédéfinis
- Options d'affichage pour personnaliser la visualisation
- Section éducative sur les concepts quantiques

### Modal de Tutoriel
**Fichier**: `src/components/TutorialModal.js`

Interface guidée pour l'apprentissage des concepts quantiques à travers des étapes progressives interactives.

#### Fonctionnalités
- Présentation par étapes des concepts de base
- Démonstrations interactives des portes quantiques
- Explication des notations et représentations
- Navigation entre les étapes avec interaction utilisateur

### Opérations Quantiques
**Fichier**: `src/utils/quantumOperations.js`

Bibliothèque d'utilitaires implémentant les transformations quantiques et les conversions de coordonnées.

#### Portes quantiques implémentées
- Portes de Pauli (X, Y, Z)
- Porte Hadamard (H)
- Portes de phase (S, S†, T, T†)
- Portes de rotation (Rx, Ry, Rz)

#### Fonctions de conversion
- `blochToAmplitudes(x, y, z)`: Conversion du vecteur de Bloch vers les amplitudes
- `amplitudesToBloch(alpha, beta)`: Conversion des amplitudes vers le vecteur de Bloch
- `sphericalToAmplitudes(theta, phi)`: Conversion des coordonnées sphériques vers les amplitudes
- `amplitudesToSpherical(alpha, beta)`: Conversion des amplitudes vers les coordonnées sphériques

## Flux de Données

1. **Interaction Utilisateur**:
   - L'utilisateur interagit avec le panneau de contrôle
   - Les actions déclenchent des mises à jour d'état via le contexte

2. **Mise à Jour de l'État**:
   - Le `QuantumStateContext` calcule les nouvelles valeurs
   - Les valeurs dérivées sont mises à jour (vecteur de Bloch, amplitudes)

3. **Propagation des Mises à Jour**:
   - Les nouveaux états sont propagés aux composants abonnés
   - La visualisation est rendue avec les nouvelles valeurs

4. **Rendu**:
   - Le composant `BlochSphereVisualization` met à jour la scène 3D
   - Les informations textuelles sont mises à jour dans l'interface

## API et Interfaces

### API du Contexte Quantique
```javascript
// Accès au contexte
const { 
  state,                            // État quantique complet
  setStateFromSpherical,            // Mise à jour par coordonnées sphériques
  setStateFromAmplitudes,           // Mise à jour par amplitudes
  setStateFromAmplitudesWithAnimation, // Mise à jour avec animation
  resetState,                       // Réinitialisation
  setToCommonState,                 // États prédéfinis
  toggleDisplayOption,              // Options d'affichage
  setSphereOpacity,                 // Transparence de la sphère
  getMeasurementProbabilities,      // Probabilités de mesure
  getStateVectorNotation            // Notation textuelle
} = useQuantumState();
```

### Structure de l'État
```javascript
state = {
  // Coordonnées primaires
  theta: Number,           // Angle d'élévation [0, π]
  phi: Number,             // Angle azimutal [0, 2π]
  
  // Amplitudes quantiques
  alpha: Complex,          // Amplitude de |0⟩
  beta: Complex,           // Amplitude de |1⟩
  
  // Coordonnées cartésiennes du vecteur de Bloch
  blochVector: {
    x: Number,
    y: Number,
    z: Number
  },
  
  // Historique et options d'affichage
  gateHistory: Array,
  showAxes: Boolean,
  // ... autres options d'affichage
}
```

## Guide de Maintenance

### Ajout d'une Nouvelle Porte Quantique
1. Définir la fonction de transformation dans `quantumOperations.js`
2. Ajouter le cas correspondant dans la fonction `applyGate`
3. Ajouter l'interface utilisateur dans `ControlPanel.js`

### Personnalisation de l'Affichage 3D
1. Les éléments visuels sont définis dans des composants React Three Fiber
2. Chaque élément (axe, grille, etc.) est togglable via une option d'état
3. Les couleurs et matériaux sont définis dans `BlochSphereVisualization.js`

### Modification du Tutoriel
1. Les étapes du tutoriel sont définies dans `TutorialModal.js`
2. Chaque étape comprend un titre, un contenu, et des actions optionnelles
3. Les actions peuvent être liées aux fonctions du contexte quantique

## Recommandations pour le Développement Futur

1. **Améliorations de Performance**:
   - Optimisation du rendu Three.js pour les appareils mobiles
   - Mise en cache des calculs fréquents

2. **Extensions Fonctionnelles**:
   - Support pour les systèmes à plusieurs qubits
   - Visualisation des circuits quantiques
   - Simulation de mesures quantiques

3. **Améliorations de l'Interface**:
   - Mode plein écran pour la visualisation
   - Export/import des états quantiques
   - Personnalisation avancée des couleurs et thèmes

---

*Cette documentation a été créée pour le projet "Visualisation de la Sphère de Bloch", développé par Lucas AUBERT sous la guidance de Dr. Dubois. Dernière mise à jour: 30 Mars 2025.*