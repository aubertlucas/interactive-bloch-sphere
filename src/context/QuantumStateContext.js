import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { complex, round } from 'mathjs';

// Initial quantum state |0⟩
const initialState = {
  // Spherical coordinates (θ, φ)
  theta: 0, // [0, π]
  phi: 0,   // [0, 2π]
  
  // Amplitude coefficients α|0⟩ + β|1⟩
  alpha: complex(1, 0),
  beta: complex(0, 0),
  
  // Bloch vector coordinates (x, y, z)
  blochVector: { x: 0, y: 0, z: 1 },
  
  // Gate history
  gateHistory: [],
  
  // Display options
  showAxes: true,
  showGrid: true,
  showEquator: true,
  showMeridians: true,
  showLabels: true,
  showAngleArcs: true,
  showVectorComponents: false,
  showWireframe: true, // Wireframe activé par défaut
  sphereOpacity: 0.25,
};

export const QuantumStateContext = createContext();

export const QuantumStateProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Update the Bloch vector and amplitudes when theta and phi change
  const updateDerivedValues = useCallback(() => {
    const { theta, phi } = state;
    
    // Calculate Bloch vector coordinates
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    
    // Calculate amplitude coefficients
    const alphaReal = Math.cos(theta / 2);
    const alphaImag = 0;
    const betaReal = Math.sin(theta / 2) * Math.cos(phi);
    const betaImag = Math.sin(theta / 2) * Math.sin(phi);
    
    // Update the state
    setState(prev => ({
      ...prev,
      blochVector: { x, y, z },
      alpha: complex(alphaReal, alphaImag),
      beta: complex(betaReal, betaImag)
    }));
  }, [state.theta, state.phi]);
  
  // Update derived values whenever theta or phi changes
  useEffect(() => {
    updateDerivedValues();
  }, [state.theta, state.phi, updateDerivedValues]);
  
  // Set state using spherical coordinates
  const setStateFromSpherical = useCallback((newTheta, newPhi) => {
    setState(prev => ({
      ...prev,
      theta: newTheta,
      phi: newPhi,
    }));
  }, [setState]); // Correction du hook useCallback
  
  // Set state directly from amplitudes
  const setStateFromAmplitudes = useCallback((newAlpha, newBeta) => {
    // Normalize the amplitudes
    const normFactor = Math.sqrt(
      Math.pow(newAlpha.re, 2) + Math.pow(newAlpha.im, 2) +
      Math.pow(newBeta.re, 2) + Math.pow(newBeta.im, 2)
    );
    
    const normalizedAlpha = {
      re: newAlpha.re / normFactor,
      im: newAlpha.im / normFactor
    };
    
    const normalizedBeta = {
      re: newBeta.re / normFactor,
      im: newBeta.im / normFactor
    };
    
    // Convert amplitudes to Bloch sphere coordinates
    // |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
    const r0 = Math.sqrt(Math.pow(normalizedAlpha.re, 2) + Math.pow(normalizedAlpha.im, 2));
    const r1 = Math.sqrt(Math.pow(normalizedBeta.re, 2) + Math.pow(normalizedBeta.im, 2));
    
    let theta = 2 * Math.acos(r0);
    let phi = 0;
    
    // Avoid division by zero
    if (r1 > 0.0001) {
      // Calculate phi from beta phase
      phi = Math.atan2(normalizedBeta.im, normalizedBeta.re);
      if (phi < 0) phi += 2 * Math.PI; // Convert to [0, 2π]
    }
    
    // Update state with both amplitude and spherical representations
    setState(prev => ({
      ...prev,
      theta: theta,
      phi: phi,
      alpha: complex(normalizedAlpha.re, normalizedAlpha.im),
      beta: complex(normalizedBeta.re, normalizedBeta.im)
    }));
  }, [setState]);
  
  // Fonction pour effectuer une animation lors de l'application d'une porte
  const setStateFromAmplitudesWithAnimation = useCallback((newAlpha, newBeta, gateName) => {
    // Cette fonction exécute la même logique que setStateFromAmplitudes
    // mais permet de capturer le nom de la porte pour le journal d'historique
    
    // Normaliser les amplitudes
    const normFactor = Math.sqrt(
      Math.pow(newAlpha.re, 2) + Math.pow(newAlpha.im, 2) +
      Math.pow(newBeta.re, 2) + Math.pow(newBeta.im, 2)
    );
    
    const normalizedAlpha = {
      re: newAlpha.re / normFactor,
      im: newAlpha.im / normFactor
    };
    
    const normalizedBeta = {
      re: newBeta.re / normFactor,
      im: newBeta.im / normFactor
    };
    
    // Convertir les amplitudes en coordonnées de la sphère de Bloch
    const r0 = Math.sqrt(Math.pow(normalizedAlpha.re, 2) + Math.pow(normalizedAlpha.im, 2));
    const r1 = Math.sqrt(Math.pow(normalizedBeta.re, 2) + Math.pow(normalizedBeta.im, 2));
    
    let theta = 2 * Math.acos(r0);
    let phi = 0;
    
    if (r1 > 0.0001) {
      phi = Math.atan2(normalizedBeta.im, normalizedBeta.re);
      if (phi < 0) phi += 2 * Math.PI;
    }
    
    // Mettre à jour l'état avec l'animation
    setState(prev => ({
      ...prev,
      theta: theta,
      phi: phi,
      alpha: complex(normalizedAlpha.re, normalizedAlpha.im),
      beta: complex(normalizedBeta.re, normalizedBeta.im),
      // Ajouter la porte à l'historique si un nom est fourni
      gateHistory: gateName ? [...prev.gateHistory, gateName] : prev.gateHistory
    }));
  }, [setState]);
  
  // Reset state to the initial |0⟩ state
  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);
  
  // Set to common states
  const setToCommonState = useCallback((stateName) => {
    switch (stateName) {
      case '|0⟩':
      case 'zero':
        setStateFromSpherical(0, 0);
        break;
      case '|1⟩':
      case 'one':
        setStateFromSpherical(Math.PI, 0);
        break;
      case '|+⟩':
      case 'plus':
        setStateFromSpherical(Math.PI/2, 0);
        break;
      case '|-⟩':
      case 'minus':
        setStateFromSpherical(Math.PI/2, Math.PI);
        break;
      case '|+i⟩':
      case 'plusi':
        setStateFromSpherical(Math.PI/2, Math.PI/2);
        break;
      case '|-i⟩':
      case 'minusi':
        setStateFromSpherical(Math.PI/2, 3*Math.PI/2);
        break;
      default:
        console.warn(`État inconnu: ${stateName}`);
        break;
    }
  }, [setStateFromSpherical]);
  
  // Toggle display options
  const toggleDisplayOption = useCallback((optionName) => {
    setState(prev => ({
      ...prev,
      [optionName]: !prev[optionName]
    }));
  }, [setState]);
  
  // Set sphere opacity
  const setSphereOpacity = useCallback((opacity) => {
    setState(prev => ({
      ...prev,
      sphereOpacity: opacity
    }));
  }, [setState]);
  
  // Calculate measurement probabilities
  const getMeasurementProbabilities = useCallback(() => {
    const { alpha, beta } = state;
    const prob0 = Math.pow(Math.abs(alpha.re), 2) + Math.pow(Math.abs(alpha.im), 2);
    const prob1 = Math.pow(Math.abs(beta.re), 2) + Math.pow(Math.abs(beta.im), 2);
    
    return { 
      prob0: round(prob0, 4), 
      prob1: round(prob1, 4) 
    };
  }, [state]);
  
  // Format complex number for display
  const formatComplex = useCallback((num) => {
    const re = round(num.re, 4);
    const im = round(num.im, 4);
    
    if (Math.abs(im) < 0.0001) return `${re}`;
    if (Math.abs(re) < 0.0001) return `${im}i`;
    
    return `${re}${im >= 0 ? '+' : ''}${im}i`;
  }, []);
  
  // Format state vector for display
  const getStateVectorNotation = useCallback(() => {
    const { alpha, beta } = state;
    const alphaStr = formatComplex(alpha);
    const betaStr = formatComplex(beta);
    
    return `${alphaStr}|0⟩ + ${betaStr}|1⟩`;
  }, [state.alpha, state.beta, formatComplex]);
  
  const value = {
    state,
    setStateFromSpherical,
    setStateFromAmplitudes,
    setStateFromAmplitudesWithAnimation,
    resetState,
    setToCommonState,
    toggleDisplayOption,
    setSphereOpacity,
    getMeasurementProbabilities,
    getStateVectorNotation
  };

  return (
    <QuantumStateContext.Provider value={value}>
      {children}
    </QuantumStateContext.Provider>
  );
};

// Custom hook for using the quantum state
export const useQuantumState = () => {
  const context = useContext(QuantumStateContext);
  if (!context) {
    throw new Error('useQuantumState must be used within a QuantumStateProvider');
  }
  return context;
};
