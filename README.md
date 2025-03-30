# Bloch Sphere Visualization

An interactive and modern 3D visualization of the Bloch sphere for quantum computing education, using React and Three.js.

## Features

- Interactive 3D Bloch sphere with orbit, zoom, and pan controls
- Real-time display of the state vector with mathematical notation
- Visualization of quantum gates and their effects
- Educational tools and tutorials for learning quantum computing concepts
- Responsive design for various devices

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start` or use the provided batch file
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- React.js for the UI framework
- Three.js for 3D rendering
- Math.js for complex number operations
- Material UI for interface components
- React Three Fiber & Drei for Three.js integration with React

## Usage

The application allows users to:
- Manipulate quantum states on the Bloch sphere
- Apply quantum gates and see their effects
- Learn quantum computing concepts through interactive tutorials
- Customize the appearance and level of detail of the visualization

## Technical Documentation

The visualization works by converting spherical coordinates (θ, φ) and complex amplitudes (α, β) into a vector in 3D space. Quantum gates modify these values according to the principles of quantum mechanics, allowing an intuitive visual representation of quantum state transformations.

## About the Author

This tool was developed by Lucas AUBERT, former Master 2 Embedded Systems student, thanks to the notes and advice of Dr. Dubois. It aims to provide an interactive educational resource to facilitate understanding of the fundamental concepts of quantum computing.
