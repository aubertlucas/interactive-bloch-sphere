import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, ThemeProvider, useMediaQuery } from '@mui/material';
import BlochSphereVisualization from './components/BlochSphereVisualization';
import ControlPanel from './components/ControlPanel';
import { QuantumStateProvider } from './context/QuantumStateContext';
import theme from './theme';
import TutorialModal from './components/TutorialModal';

function App() {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  // Fermer automatiquement le drawer sur mobile
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  return (
    <QuantumStateProvider>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}>
        <ControlPanel 
          isMobile={isMobile} 
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          onTutorialOpen={() => setTutorialOpen(true)} 
        />
        <Box sx={{ 
          flexGrow: 1, 
          position: 'relative',
          overflow: 'hidden',
          height: isMobile ? 'calc(100vh - 60px)' : '100vh' // Réduire la hauteur sur mobile pour tenir compte du bouton du menu
        }}>
          <BlochSphereVisualization />
        </Box>
        <TutorialModal 
          open={tutorialOpen} 
          onClose={() => setTutorialOpen(false)} 
        />
      </Box>
    </QuantumStateProvider>
  );
}

export default App;
