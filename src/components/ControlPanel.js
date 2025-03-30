import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Slider,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Grid,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useQuantumState } from '../context/QuantumStateContext';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';

// Control panel width - responsive for desktop and mobile
const getDrawerWidth = (isMobile) => isMobile ? 320 : 410;

const ControlPanel = ({ onTutorialOpen, isMobile, drawerOpen, setDrawerOpen }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [thetaValue, setThetaValue] = useState(0);
  const [phiValue, setPhiValue] = useState(0);
  const [angleUnit, setAngleUnit] = useState('rad'); // 'rad' pour radians, 'deg' pour degrés
  
  const { 
    state, 
    resetState, 
    setToCommonState, 
    toggleDisplayOption,
    setSphereOpacity,
    setStateFromSpherical,
    setStateFromAmplitudesWithAnimation
  } = useQuantumState();
  
  // Synchroniser les sliders avec l'état
  useEffect(() => {
    setThetaValue(state.theta);
    setPhiValue(state.phi);
  }, [state.theta, state.phi]);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleThetaChange = (event, newValue) => {
    setThetaValue(newValue);
    setStateFromSpherical(newValue, phiValue);
  };
  
  const handlePhiChange = (event, newValue) => {
    setPhiValue(newValue);
    setStateFromSpherical(thetaValue, newValue);
  };
  
  const applyQuantumGate = (gateName) => {
    const { alpha, beta } = state;
    
    // Extraction des composantes réelles et imaginaires
    const alphaRe = alpha.re;
    const alphaIm = alpha.im;
    const betaRe = beta.re;
    const betaIm = beta.im;
    
    // Appliquer la porte et obtenir les nouvelles amplitudes
    let newAlphaRe, newAlphaIm, newBetaRe, newBetaIm;
    
    switch(gateName) {
      case 'X':
        // X gate swaps alpha and beta
        newAlphaRe = betaRe;
        newAlphaIm = betaIm;
        newBetaRe = alphaRe;
        newBetaIm = alphaIm;
        break;
      case 'Y':
        // Y gate: |0⟩ → i|1⟩, |1⟩ → -i|0⟩
        newAlphaRe = -betaIm;
        newAlphaIm = betaRe;
        newBetaRe = alphaIm;
        newBetaIm = -alphaRe;
        break;
      case 'Z':
        // Z gate: |0⟩ → |0⟩, |1⟩ → -|1⟩
        newAlphaRe = alphaRe;
        newAlphaIm = alphaIm;
        newBetaRe = -betaRe;
        newBetaIm = -betaIm;
        break;
      case 'H':
        // H gate: |0⟩ → (|0⟩+|1⟩)/√2, |1⟩ → (|0⟩-|1⟩)/√2
        const factor = 1 / Math.sqrt(2);
        newAlphaRe = factor * (alphaRe + betaRe);
        newAlphaIm = factor * (alphaIm + betaIm);
        newBetaRe = factor * (alphaRe - betaRe);
        newBetaIm = factor * (alphaIm - betaIm);
        break;
      case 'S':
        // S gate: |0⟩ → |0⟩, |1⟩ → i|1⟩
        newAlphaRe = alphaRe;
        newAlphaIm = alphaIm;
        newBetaRe = -betaIm;
        newBetaIm = betaRe;
        break;
      case 'S_dag':
        // S† gate: |0⟩ → |0⟩, |1⟩ → -i|1⟩
        newAlphaRe = alphaRe;
        newAlphaIm = alphaIm;
        newBetaRe = betaIm;
        newBetaIm = -betaRe;
        break;
      case 'T':
        // T gate: |0⟩ → |0⟩, |1⟩ → e^(iπ/4)|1⟩
        const cosT = Math.cos(Math.PI/4);
        const sinT = Math.sin(Math.PI/4);
        newAlphaRe = alphaRe;
        newAlphaIm = alphaIm;
        newBetaRe = betaRe * cosT - betaIm * sinT;
        newBetaIm = betaRe * sinT + betaIm * cosT;
        break;
      case 'T_dag':
        // T† gate: |0⟩ → |0⟩, |1⟩ → e^(-iπ/4)|1⟩
        const cosTdag = Math.cos(Math.PI/4);
        const sinTdag = Math.sin(Math.PI/4);
        newAlphaRe = alphaRe;
        newAlphaIm = alphaIm;
        newBetaRe = betaRe * cosTdag + betaIm * sinTdag;
        newBetaIm = betaIm * cosTdag - betaRe * sinTdag;
        break;
      default:
        console.warn(`Porte ${gateName} non implémentée`);
        return;
    }
    
    // Créer les nouveaux nombres complexes avec les propriétés re et im
    const newAlpha = { re: newAlphaRe, im: newAlphaIm };
    const newBeta = { re: newBetaRe, im: newBetaIm };
    
    // Mettre à jour l'état avec les nouvelles amplitudes en passant le type de porte
    setStateFromAmplitudesWithAnimation(newAlpha, newBeta, gateName);
  };
  
  const handleAngleUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setAngleUnit(newUnit);
    }
  };
  
  // Fonctions de conversion entre radians et degrés
  const radToDeg = (rad) => {
    return rad * (180 / Math.PI);
  };
  
  const degToRad = (deg) => {
    return deg * (Math.PI / 180);
  };
  
  // Pour l'affichage et la manipulation des angles selon l'unité choisie
  const displayAngle = (radValue) => {
    if (angleUnit === 'deg') {
      return radToDeg(radValue).toFixed(2) + '°';
    }
    return radValue.toFixed(2) + ' rad';
  };
  
  const getSliderMax = (angle) => {
    if (angleUnit === 'deg') {
      return angle === 'theta' ? 180 : 360;
    }
    return angle === 'theta' ? Math.PI : 2 * Math.PI;
  };

  return (
    <>
      {/* Drawer toggle button */}
      {!drawerOpen && (
        <IconButton
          color="primary"
          aria-label="open control panel"
          onClick={handleDrawerToggle}
          sx={{
            position: 'absolute',
            left: 16,
            top: 16,
            zIndex: 1100,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {/* Mobile header when drawer is closed */}
      {isMobile && !drawerOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            zIndex: 1050,
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 5 }}>
            Simulateur Quantique
          </Typography>
          <IconButton
            color="inherit"
            onClick={onTutorialOpen}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Main drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor={isMobile ? "bottom" : "left"}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: getDrawerWidth(isMobile),
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: getDrawerWidth(isMobile),
            maxHeight: isMobile ? '80vh' : '100vh',
            backgroundColor: 'background.paper',
            overflow: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Panneau de contrôle</Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                py: 0
              }
            }}
          >
            <Tab 
              icon={<SettingsIcon sx={{ fontSize: 'small' }} />} 
              label={isMobile ? '' : "Contrôles"} 
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              icon={<VisibilityIcon sx={{ fontSize: 'small' }} />} 
              label={isMobile ? '' : "Affichage"} 
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              icon={<SchoolIcon sx={{ fontSize: 'small' }} />} 
              label={isMobile ? '' : "Apprendre"} 
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>
          
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            {/* Controls Tab */}
            {activeTab === 0 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Portes Quantiques
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Portes de Pauli
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => applyQuantumGate('X')}
                      >
                        X
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => applyQuantumGate('Y')}
                      >
                        Y
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => applyQuantumGate('Z')}
                      >
                        Z
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Porte Hadamard
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="secondary"
                        onClick={() => applyQuantumGate('H')}
                      >
                        H
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Portes de Phase
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={3}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="info"
                        onClick={() => applyQuantumGate('S')}
                      >
                        S
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="info"
                        onClick={() => applyQuantumGate('S_dag')}
                      >
                        S†
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="info"
                        onClick={() => applyQuantumGate('T')}
                      >
                        T
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="info"
                        onClick={() => applyQuantumGate('T_dag')}
                      >
                        T†
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Contrôle de Position
                  </Typography>
                  
                  <Typography id="theta-slider" gutterBottom>
                    θ (Angle d'élévation): {displayAngle(state.theta)}
                  </Typography>
                  <Slider
                    value={angleUnit === 'deg' ? radToDeg(state.theta) : state.theta}
                    onChange={(event, newValue) => {
                      if (angleUnit === 'deg') {
                        handleThetaChange(event, degToRad(newValue));
                      } else {
                        handleThetaChange(event, newValue);
                      }
                    }}
                    min={0}
                    max={getSliderMax('theta')}
                    step={angleUnit === 'deg' ? 1 : 0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(2)}
                    aria-labelledby="theta-slider"
                  />
                  
                  <Typography id="phi-slider" gutterBottom>
                    φ (Angle azimutal): {displayAngle(state.phi)}
                  </Typography>
                  <Slider
                    value={angleUnit === 'deg' ? radToDeg(state.phi) : state.phi}
                    onChange={(event, newValue) => {
                      if (angleUnit === 'deg') {
                        handlePhiChange(event, degToRad(newValue));
                      } else {
                        handlePhiChange(event, newValue);
                      }
                    }}
                    min={0}
                    max={getSliderMax('phi')}
                    step={angleUnit === 'deg' ? 1 : 0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(2)}
                    aria-labelledby="phi-slider"
                  />
                  <ToggleButtonGroup
                    exclusive
                    value={angleUnit}
                    onChange={handleAngleUnitChange}
                    sx={{ mt: 1 }}
                  >
                    <ToggleButton value="rad">Radians</ToggleButton>
                    <ToggleButton value="deg">Degrés</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Amplitudes Quantiques
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                    p: 2, 
                    borderRadius: 1, 
                    mb: 1,
                    fontFamily: 'monospace' 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      État: {state.alpha.re.toFixed(4)}
                      {state.alpha.im >= 0 ? '+' : ''}
                      {state.alpha.im.toFixed(4)}i |0⟩ + {state.beta.re.toFixed(4)}
                      {state.beta.im >= 0 ? '+' : ''}
                      {state.beta.im.toFixed(4)}i |1⟩
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          α (réel): {state.alpha.re.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          α (imag): {state.alpha.im.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          β (réel): {state.beta.re.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          β (imag): {state.beta.im.toFixed(4)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    États prédéfinis
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={4}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setToCommonState('zero')}
                        sx={{ mb: 1 }}
                      >
                        |0⟩
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setToCommonState('one')}
                        sx={{ mb: 1 }}
                      >
                        |1⟩
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setToCommonState('plus')}
                        sx={{ mb: 1 }}
                      >
                        |+⟩
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setToCommonState('minus')}
                        sx={{ mb: 1 }}
                      >
                        |-⟩
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setToCommonState('plusi')}
                        sx={{ mb: 1 }}
                      >
                        |+i⟩
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setToCommonState('minusi')}
                        sx={{ mb: 1 }}
                      >
                        |-i⟩
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider />
                
                <Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="error" 
                    startIcon={<RestartAltIcon />}
                    onClick={resetState}
                  >
                    Réinitialiser
                  </Button>
                </Box>
              </Stack>
            )}
            
            {/* Display Tab */}
            {activeTab === 1 && (
              <Stack spacing={2}>
                <Typography variant="h6" gutterBottom>
                  Options d'affichage
                </Typography>
                
                <FormControlLabel
                  control={<Switch checked={state.showAxes} onChange={() => toggleDisplayOption('showAxes')} />}
                  label="Axes"
                />
                
                <FormControlLabel
                  control={<Switch checked={state.showGrid} onChange={() => toggleDisplayOption('showGrid')} />}
                  label="Grille"
                />
                
                <FormControlLabel
                  control={<Switch checked={state.showEquator} onChange={() => toggleDisplayOption('showEquator')} />}
                  label="Équateur"
                />
                
                <FormControlLabel
                  control={<Switch checked={state.showMeridians} onChange={() => toggleDisplayOption('showMeridians')} />}
                  label="Méridiens"
                />
                
                <FormControlLabel
                  control={<Switch checked={state.showLabels} onChange={() => toggleDisplayOption('showLabels')} />}
                  label="Étiquettes"
                />
                
                <FormControlLabel
                  control={<Switch checked={state.showAngleArcs} onChange={() => toggleDisplayOption('showAngleArcs')} />}
                  label="Arcs d'angles"
                />
                
                <FormControlLabel
                  control={<Switch checked={state.showVectorComponents} onChange={() => toggleDisplayOption('showVectorComponents')} />}
                  label="Composantes du vecteur"
                />
                
                <Box>
                  <Typography gutterBottom>
                    Opacité de la sphère: {state.sphereOpacity.toFixed(2)}
                  </Typography>
                  <Slider
                    value={state.sphereOpacity}
                    onChange={(e, val) => setSphereOpacity(val)}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(2)}
                  />
                </Box>
              </Stack>
            )}
            
            {/* Learning Tab */}
            {activeTab === 2 && (
              <Stack spacing={3}>
                <Typography variant="h6" gutterBottom>
                  Ressources d'apprentissage
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Qu'est-ce que la sphère de Bloch?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    La sphère de Bloch est une représentation géométrique de l'état d'un qubit (bit quantique). Tout état pur d'un qubit peut être représenté comme un point sur cette sphère.
                  </Typography>
                  <Typography variant="body2">
                    Les pôles nord et sud de la sphère correspondent aux états de base |0⟩ et |1⟩, respectivement. Tous les autres points représentent des superpositions de ces états fondamentaux.
                  </Typography>
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Coordonnées sphériques
                  </Typography>
                  <Typography variant="body2" paragraph>
                    La position d'un point sur la sphère de Bloch est déterminée par deux angles:
                  </Typography>
                  <Typography variant="body2">
                    • theta: l'angle polaire, mesuré à partir de l'axe Z positif (0 ≤ theta ≤ π)
                  </Typography>
                  <Typography variant="body2">
                    • phi: l'angle azimutal dans le plan XY (0 ≤ phi &lt; 2π)
                  </Typography>
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Portes quantiques
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Les portes quantiques sont des opérations unitaires qui transforment l'état d'un qubit:
                  </Typography>
                  <Typography variant="body2">
                    • Portes de Pauli (X, Y, Z): Équivalentes à des rotations de π radians autour des axes X, Y et Z.
                  </Typography>
                  <Typography variant="body2">
                    • Porte Hadamard (H): Crée des superpositions, transformant |0⟩ en |+⟩ et |1⟩ en |-⟩.
                  </Typography>
                  <Typography variant="body2">
                    • Portes de phase (S, T): Appliquent un changement de phase sans affecter les probabilités de mesure.
                  </Typography>
                </Paper>
                
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={onTutorialOpen}
                >
                  Démarrer le tutoriel
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ControlPanel;
