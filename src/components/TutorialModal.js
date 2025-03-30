import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MobileStepper,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Popover,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useQuantumState } from '../context/QuantumStateContext';

// Contenu des étapes du tutoriel en français
const tutorialSteps = [
  {
    title: 'Bienvenue à la Visualisation de la Sphère de Bloch',
    content: `Ce tutoriel interactif vous guidera à travers les bases de l'informatique quantique à l'aide de la représentation de la sphère de Bloch. Vous apprendrez les qubits, les états quantiques et les opérations quantiques.`,
    action: null
  },
  {
    title: 'La Sphère de Bloch',
    content: `La sphère de Bloch est une représentation géométrique de l'état d'un qubit. Tout état quantique pur peut être représenté comme un point sur la surface de cette sphère unitaire. Le pôle nord représente |0⟩ et le pôle sud représente |1⟩.`,
    action: { type: 'reset' }
  },
  {
    title: 'Représentation d\'État Quantique',
    content: `Un état de qubit s'écrit |ψ⟩ = α|0⟩ + β|1⟩, où α et β sont des nombres complexes respectant |α|² + |β|² = 1. Cette condition de normalisation garantit que les probabilités de mesurer soit |0⟩ soit |1⟩ somment à 1.`,
    action: null
  },
  {
    title: 'États de Superposition',
    content: `Quand un qubit est en superposition, il existe comme une combinaison des états |0⟩ et |1⟩ simultanément. L\'état |+⟩ = (|0⟩ + |1⟩)/√2 est une superposition égale représentée sur l\'axe x positif de la sphère de Bloch.`,
    action: { type: 'setState', state: '|+⟩' }
  },
  {
    title: 'La Porte Hadamard',
    content: `La porte Hadamard (H) transforme les états de base en superpositions. Elle envoie |0⟩ vers |+⟩ et |1⟩ vers |-⟩. Cela équivaut à une rotation de 180° autour de l\'axe situé à mi-chemin entre x et z.`,
    action: { type: 'setAndApply', state: '|0⟩', gate: 'H' }
  },
  {
    title: 'La Porte Pauli-X',
    content: `La porte Pauli-X (aussi connue comme porte NOT) inverse l\'état d\'un qubit, transformant |0⟩ en |1⟩ et vice-versa. Sur la sphère de Bloch, cela correspond à une rotation de 180° autour de l\'axe x.`,
    action: { type: 'setAndApply', state: '|0⟩', gate: 'X' }
  },
  {
    title: 'La Porte Pauli-Z',
    content: `La porte Pauli-Z applique un changement de phase à la composante |1⟩ de l\'état. Elle laisse |0⟩ inchangé mais transforme |1⟩ en -|1⟩. Sur la sphère de Bloch, cela correspond à une rotation de 180° autour de l\'axe z.`,
    action: { type: 'setAndApply', state: '|+⟩', gate: 'Z' }
  },
  {
    title: 'Portes de Phase',
    content: `Les portes S et T sont des portes de phase qui font tourner l\'état autour de l\'axe z. La porte S tourne de 90° (π/2), tandis que la porte T tourne de 45° (π/4). Ces portes sont importantes pour les algorithmes quantiques et la correction d\'erreurs.`,
    action: { type: 'setAndApply', state: '|+⟩', gate: 'S' }
  },
  {
    title: 'Rotations Arbitraires',
    content: `Les portes de rotation Rx, Ry et Rz permettent des rotations arbitraires autour des axes respectifs. Ces rotations peuvent placer le qubit à n\'importe quel point sur la sphère de Bloch, représentant n\'importe quel état quantique pur possible.`,
    action: { type: 'setState', state: '|+⟩' }
  },
  {
    title: 'Mesure',
    content: `Lorsqu\'un qubit est mesuré dans la base de calcul, il s\'effondre soit vers |0⟩ soit vers |1⟩. La probabilité de mesurer |0⟩ est |α|² et la probabilité de mesurer |1⟩ est |β|². Plus l\'état est proche d\'un pôle, plus la probabilité de mesurer l\'état de base correspondant est élevée.`,
    action: null
  },
  {
    title: 'Félicitations !',
    content: `Vous avez terminé le tutoriel de base sur l\'informatique quantique avec la visualisation de la sphère de Bloch. N\'hésitez pas à explorer davantage l\'application, à expérimenter avec différents états et portes, et à approfondir votre compréhension des concepts d\'informatique quantique.`,
    action: null
  }
];

const TutorialModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = tutorialSteps.length;
  const { resetState, setToCommonState, setStateFromAmplitudesWithAnimation, state } = useQuantumState();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [autoExecuteActions, setAutoExecuteActions] = useState(false);
  
  // Applique la porte quantique en utilisant setStateFromAmplitudesWithAnimation
  const applyGate = (gateName) => {
    // Définition des portes quantiques standards et leurs effets
    switch (gateName) {
      case 'H': // Porte Hadamard
        if (state.theta === 0) { // Si état |0⟩
          setStateFromAmplitudesWithAnimation(
            { re: 1/Math.sqrt(2), im: 0 }, 
            { re: 1/Math.sqrt(2), im: 0 }, 
            'H'
          );
        } else if (Math.abs(state.theta - Math.PI) < 0.01) { // Si état |1⟩
          setStateFromAmplitudesWithAnimation(
            { re: 1/Math.sqrt(2), im: 0 }, 
            { re: -1/Math.sqrt(2), im: 0 }, 
            'H'
          );
        }
        break;
      
      case 'X': // Porte Pauli-X (NOT)
        if (state.theta === 0) { // Si état |0⟩
          setStateFromAmplitudesWithAnimation(
            { re: 0, im: 0 }, 
            { re: 1, im: 0 }, 
            'X'
          );
        } else if (Math.abs(state.theta - Math.PI) < 0.01) { // Si état |1⟩
          setStateFromAmplitudesWithAnimation(
            { re: 1, im: 0 }, 
            { re: 0, im: 0 }, 
            'X'
          );
        }
        break;
      
      case 'Z': // Porte Pauli-Z
        // Pour |+⟩ (θ=π/2, φ=0)
        if (Math.abs(state.theta - Math.PI/2) < 0.01 && Math.abs(state.phi) < 0.01) {
          setStateFromAmplitudesWithAnimation(
            { re: 1/Math.sqrt(2), im: 0 }, 
            { re: -1/Math.sqrt(2), im: 0 }, 
            'Z'
          );
        }
        break;
      
      case 'S': // Porte Phase (S)
        // Pour |+⟩ (θ=π/2, φ=0)
        if (Math.abs(state.theta - Math.PI/2) < 0.01 && Math.abs(state.phi) < 0.01) {
          setStateFromAmplitudesWithAnimation(
            { re: 1/Math.sqrt(2), im: 0 }, 
            { re: 0, im: 1/Math.sqrt(2) }, 
            'S'
          );
        }
        break;
        
      default:
        console.warn(`Porte non implémentée: ${gateName}`);
    }
  };

  const handleNext = () => {
    // Passer à l'étape suivante
    const nextStepIndex = activeStep + 1;
    setActiveStep(nextStepIndex);
    
    // Appliquer l'action si autoExecuteActions est activé
    if (autoExecuteActions && nextStepIndex < maxSteps) {
      const nextStep = tutorialSteps[nextStepIndex];
      if (nextStep && nextStep.action) {
        applyStepAction(nextStep.action);
      }
    }
  };
  
  const handleBack = () => {
    // Revenir à l'étape précédente
    const prevStepIndex = activeStep - 1;
    setActiveStep(prevStepIndex);
    
    // Appliquer l'action si autoExecuteActions est activé
    if (autoExecuteActions && prevStepIndex >= 0) {
      const prevStep = tutorialSteps[prevStepIndex];
      if (prevStep && prevStep.action) {
        applyStepAction(prevStep.action);
      }
    }
  };
  
  const applyStepAction = (action) => {
    if (!action) return;
    
    switch (action.type) {
      case 'reset':
        resetState();
        break;
      case 'setState':
        setToCommonState(action.state);
        break;
      case 'applyGate':
        applyGate(action.gate);
        break;
      case 'setAndApply':
        setToCommonState(action.state);
        setTimeout(() => applyGate(action.gate), 500);
        break;
      default:
        break;
    }
  };
  
  const handleStepAction = () => {
    const currentStep = tutorialSteps[activeStep];
    if (currentStep && currentStep.action) {
      applyStepAction(currentStep.action);
    }
  };
  
  // Appliquer l'action de l'étape initiale à l'ouverture uniquement
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      // Exécuter l'action initiale uniquement si le tutoriel vient d'être ouvert
      const initialStep = tutorialSteps[0];
      if (initialStep && initialStep.action) {
        applyStepAction(initialStep.action);
      }
    }
  }, [open]);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          position: 'absolute',
          right: isMobile ? '50%' : '20px',
          bottom: isMobile ? '20px' : '20px',
          transform: isMobile ? 'translateX(50%)' : 'none',
          margin: 0,
          maxHeight: isMobile ? '40vh' : '50vh',
          maxWidth: isMobile ? '90vw' : '400px',
          overflow: 'hidden',
          borderRadius: '10px',
          boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} component="div">
          {tutorialSteps[activeStep].title}
        </Typography>
        <IconButton
          aria-label="fermer"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2, height: isMobile ? '150px' : '200px', overflow: 'auto' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {tutorialSteps[activeStep].content}
        </Typography>
        
        {tutorialSteps[activeStep].action && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStepAction}
            size="small"
            sx={{ alignSelf: 'center', mt: 1, mb: 1 }}
          >
            Essayer maintenant
          </Button>
        )}
      </DialogContent>
      
      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{ bgcolor: 'background.paper' }}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Suivant
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Précédent
          </Button>
        }
      />
      
      <DialogActions sx={{ p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button onClick={onClose} color="primary" size="small">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TutorialModal;
