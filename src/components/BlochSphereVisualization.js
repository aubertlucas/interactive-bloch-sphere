import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuantumState } from '../context/QuantumStateContext';

// Component for rendering the Bloch sphere
const BlochSphere = () => {
  const { state, setStateFromSpherical } = useQuantumState();
  const { 
    theta, phi, blochVector, 
    showAxes, showGrid, showEquator, showMeridians, 
    showLabels, showAngleArcs, showVectorComponents, showWireframe,
    sphereOpacity
  } = state;
  
  const sphereRef = useRef();
  const stateVectorRef = useRef();
  const thetaLabelRef = useRef();
  const phiLabelRef = useRef();
  
  // Update the angle labels on each frame
  useFrame(() => {
    if (thetaLabelRef.current && phiLabelRef.current) {
      // Position theta label at the arc
      const thetaLabelPos = new THREE.Vector3(
        Math.sin(theta/2) * 0.4, 
        Math.cos(theta/2) * 0.4, 
        0
      );
      
      // Position phi label at the arc
      const phiLabelPos = new THREE.Vector3(
        Math.sin(phi) * Math.sin(theta) * 0.6, 
        0,
        Math.cos(phi) * Math.sin(theta) * 0.6
      );
      
      thetaLabelRef.current.position.copy(thetaLabelPos);
      phiLabelRef.current.position.copy(phiLabelPos);
      
      // Make the labels always face the camera
      thetaLabelRef.current.lookAt(thetaLabelRef.current.parent.parent.position);
      phiLabelRef.current.lookAt(phiLabelRef.current.parent.parent.position);
    }
  });
  
  // Function to handle clicks on the sphere surface
  const handleSphereClick = (e) => {
    // Prevent event propagation
    e.stopPropagation();
    
    // Get the point of intersection in sphere local coordinates
    const intersectionPoint = e.point.clone();
    
    // Convert to spherical coordinates
    const r = intersectionPoint.length();
    // Important: y est notre axe z dans la convention de la sphère de Bloch
    const theta = Math.acos(intersectionPoint.y / r);
    let phi = Math.atan2(intersectionPoint.z, intersectionPoint.x);
    if (phi < 0) phi += 2 * Math.PI;
    
    // Update the quantum state
    setStateFromSpherical(theta, phi);
  };
  
  // Memoize the grid lines to prevent recreating them on every render
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    
    return (
      <>
        {/* Latitude circles */}
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = (i + 1) * (Math.PI / 10);
          return (
            <mesh key={`lat-${i}`} position={[0, Math.cos(angle), 0]} rotation={[Math.PI/2, 0, 0]}>
              <ringGeometry args={[Math.sin(angle) - 0.002, Math.sin(angle) + 0.002, 64]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.5} />
            </mesh>
          );
        })}
        
        {/* Longitude semicircles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * (Math.PI / 6);
          return (
            <mesh key={`lon-${i}`} rotation={[0, angle, 0]}>
              <torusGeometry args={[1, 0.002, 16, 50, Math.PI]} />
              <meshBasicMaterial color="#444444" transparent opacity={0.5} />
            </mesh>
          );
        })}
      </>
    );
  }, [showGrid]);
  
  return (
    <>
      {/* Bloch Sphere */}
      <mesh ref={sphereRef} onClick={handleSphereClick}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshPhongMaterial 
          color="#4080ff" 
          transparent={true} 
          opacity={sphereOpacity}
          wireframe={true}
        />
      </mesh>
      
      {/* Equator */}
      {showEquator && (
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[1, 0.005, 16, 100]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      
      {/* Prime meridians */}
      {showMeridians && (
        <>
          {/* X-Z plane (φ = 0 ou π) */}
          <mesh>
            <torusGeometry args={[1, 0.005, 16, 100]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Y-Z plane (φ = π/2 ou 3π/2) */}
          <mesh rotation={[0, Math.PI/2, 0]}>
            <torusGeometry args={[1, 0.005, 16, 100]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </>
      )}
      
      {/* Coordinate system axes */}
      {showAxes && (
        <>
          {/* X axis (φ = 0, θ = π/2) */}
          <group>
            <arrowHelper 
              args={[
                new THREE.Vector3(1, 0, 0), 
                new THREE.Vector3(0, 0, 0), 
                1.08, 
                0xff0000, 
                0.1, 
                0.05
              ]} 
            />
            <Billboard position={[1.3, 0, 0]}>
              <Text fontSize={0.08} color="red">
                X
              </Text>
            </Billboard>
          </group>
          
          {/* Y axis (φ = π/2, θ = π/2) */}
          <group>
            <arrowHelper 
              args={[
                new THREE.Vector3(0, 0, 1), 
                new THREE.Vector3(0, 0, 0), 
                1.08, 
                0x00ff00, 
                0.1, 
                0.05
              ]} 
            />
            <Billboard position={[0, 0, 1.3]}>
              <Text fontSize={0.08} color="green">
                Y
              </Text>
            </Billboard>
          </group>
          
          {/* Z axis (θ = 0 ou π) */}
          <group>
            <arrowHelper 
              args={[
                new THREE.Vector3(0, 1, 0), 
                new THREE.Vector3(0, 0, 0), 
                1.08, 
                0x0000ff, 
                0.1, 
                0.05
              ]} 
            />
            <Billboard position={[0, 1.3, 0]}>
              <Text fontSize={0.08} color="blue">
                Z
              </Text>
            </Billboard>
          </group>
        </>
      )}
      
      {/* Basis state labels */}
      {showLabels && (
        <>
          <Billboard position={[0, 1.15, 0]} follow={true}>
            <Text fontSize={0.075} color="white">
              |0⟩
            </Text>
          </Billboard>
          
          <Billboard position={[0, -1.15, 0]} follow={true}>
            <Text fontSize={0.075} color="white">
              |1⟩
            </Text>
          </Billboard>
          
          <Billboard position={[1.15, 0, 0]} follow={true}>
            <Text fontSize={0.075} color="white">
              |+⟩
            </Text>
          </Billboard>
          
          <Billboard position={[-1.15, 0, 0]} follow={true}>
            <Text fontSize={0.075} color="white">
              |-⟩
            </Text>
          </Billboard>
          
          <Billboard position={[0, 0, 1.15]} follow={true}>
            <Text fontSize={0.075} color="white">
              |+i⟩
            </Text>
          </Billboard>
          
          <Billboard position={[0, 0, -1.15]} follow={true}>
            <Text fontSize={0.075} color="white">
              |-i⟩
            </Text>
          </Billboard>
          
          {/* États sur l'équateur avec leurs formules comme sur l'image */}
          <Billboard position={[1.4, 0, 0]} follow={true}>
            <Text fontSize={0.08} color="white">
              <mesh>
                <group position={[0, 0.04, 0]}>
                  <Text fontSize={0.06} color="white" anchorX="center">
                    |0⟩ + |1⟩
                  </Text>
                </group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.2, 0.004, 0.001]} />
                  <meshBasicMaterial color="white" />
                </mesh>
                <group position={[0, -0.05, 0]}>
                  <Text fontSize={0.055} color="white" anchorX="center">
                    √2
                  </Text>
                </group>
              </mesh>
            </Text>
          </Billboard>
          
          <Billboard position={[-1.4, 0, 0]} follow={true}>
            <Text fontSize={0.08} color="white">
              <mesh>
                <group position={[0, 0.04, 0]}>
                  <Text fontSize={0.06} color="white" anchorX="center">
                    |0⟩ - |1⟩
                  </Text>
                </group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.2, 0.004, 0.001]} />
                  <meshBasicMaterial color="white" />
                </mesh>
                <group position={[0, -0.05, 0]}>
                  <Text fontSize={0.055} color="white" anchorX="center">
                    √2
                  </Text>
                </group>
              </mesh>
            </Text>
          </Billboard>
          
          <Billboard position={[0, 0, 1.4]} follow={true}>
            <Text fontSize={0.08} color="white">
              <mesh>
                <group position={[0, 0.04, 0]}>
                  <Text fontSize={0.06} color="white" anchorX="center">
                    |0⟩ + i|1⟩
                  </Text>
                </group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.2, 0.004, 0.001]} />
                  <meshBasicMaterial color="white" />
                </mesh>
                <group position={[0, -0.05, 0]}>
                  <Text fontSize={0.055} color="white" anchorX="center">
                    √2
                  </Text>
                </group>
              </mesh>
            </Text>
          </Billboard>
          
          <Billboard position={[0, 0, -1.4]} follow={true}>
            <Text fontSize={0.08} color="white">
              <mesh>
                <group position={[0, 0.04, 0]}>
                  <Text fontSize={0.06} color="white" anchorX="center">
                    |0⟩ - i|1⟩
                  </Text>
                </group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.2, 0.004, 0.001]} />
                  <meshBasicMaterial color="white" />
                </mesh>
                <group position={[0, -0.05, 0]}>
                  <Text fontSize={0.055} color="white" anchorX="center">
                    √2
                  </Text>
                </group>
              </mesh>
            </Text>
          </Billboard>
        </>
      )}
      
      {/* Angle arcs and dynamic labels */}
      {showAngleArcs && (
        <>
          {/* Axe complet de |ψ⟩ traversant la sphère */}
          <line>
            <bufferGeometry>
              <bufferAttribute 
                attachObject={['attributes', 'position']}
                count={2}
                array={new Float32Array([
                  -blochVector.x * 2, -blochVector.z * 2, -blochVector.y * 2,
                  blochVector.x * 2, blochVector.z * 2, blochVector.y * 2
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff0000" />
          </line>
          
          {/* Ligne réelle avec flèche de l'origine jusqu'à Psi */}
          <group renderOrder={30}>
            <arrowHelper 
              args={[
                new THREE.Vector3(blochVector.x, blochVector.z, blochVector.y).normalize(), 
                new THREE.Vector3(0, 0, 0), 
                1, 
                "#ff0000", 
                0.08,  // taille de la tête de flèche
                0.04   // largeur de la tête de flèche
              ]} 
            />
          </group>
          
          {/* Point Alpha - uniquement sur l'axe Z */}
          {(() => {
            // Alpha se déplace uniquement sur l'axe Z, sa position est proportionnelle à |α|²
            // |α|² est la probabilité d'être dans l'état |0⟩
            const alphaValue = state.alpha;
            const alphaProbability = alphaValue.re * alphaValue.re + alphaValue.im * alphaValue.im;
            
            // Position le long de l'axe Z, entre -1 et 1
            // Pour que Alpha soit aligné avec la sphère rouge de Psi sur l'axe Z
            const alphaZ = blochVector.z;
            
            return (
              <>
                {/* Point Alpha */}
                <mesh position={[0, alphaZ, 0]} renderOrder={20}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color="#00ff00" depthTest={false} />
                </mesh>
                
                {/* Label Alpha */}
                <Billboard position={[-0.15, alphaZ, 0]} follow={true} renderOrder={21}>
                  <mesh renderOrder={20}>
                    <planeGeometry args={[0.15, 0.15]} />
                    <meshBasicMaterial color="black" transparent opacity={0.7} depthTest={false} />
                  </mesh>
                  <Text 
                    position={[0, 0, 0.001]}
                    fontSize={0.08} 
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={21}
                    depthTest={false}
                  >
                    α
                  </Text>
                </Billboard>
                
                {/* Ligne horizontale verte de l'axe Z à la ligne PSI */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute 
                      attachObject={['attributes', 'position']}
                      count={2}
                      array={new Float32Array([
                        0, alphaZ, 0,
                        blochVector.x * alphaZ, alphaZ, blochVector.y * alphaZ
                      ])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#00ff00" />
                </line>
                
                {/* Ligne imaginaire verte: Origine -> Alpha -> Psi */}
                {(() => {
                  // Créer des petites sphères pour représenter la ligne imaginaire
                  const segments = 8; // Nombre de segments
                  const spheres = [];
                  
                  // Ligne 1: Origine -> Alpha
                  for (let i = 1; i < segments; i++) {
                    const t = i / segments;
                    const x = 0;
                    const y = alphaZ * t;
                    const z = 0;
                    
                    spheres.push(
                      <mesh key={`alpha-segment-1-${i}`} position={[x, y, z]} renderOrder={20}>
                        <sphereGeometry args={[0.015, 8, 8]} />
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} depthTest={false} />
                      </mesh>
                    );
                  }
                  
                  // Ligne 2: Alpha -> Psi
                  for (let i = 1; i < segments; i++) {
                    const t = i / segments;
                    const x = 0 + (blochVector.x - 0) * t;
                    const y = alphaZ + (blochVector.z - alphaZ) * t;
                    const z = 0 + (blochVector.y - 0) * t;
                    
                    spheres.push(
                      <mesh key={`alpha-segment-2-${i}`} position={[x, y, z]} renderOrder={20}>
                        <sphereGeometry args={[0.015, 8, 8]} />
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} depthTest={false} />
                      </mesh>
                    );
                  }
                  
                  return spheres;
                })()}
              </>
            );
          })()}
          
          {/* Point Beta - projection verticale sur le plan XY de l'intersection de |ψ⟩ avec la sphère */}
          {(() => {
            // Normalisation du vecteur d'état pour trouver l'intersection avec la sphère
            const stateVector = new THREE.Vector3(blochVector.x, blochVector.z, blochVector.y);
            const normalizedVector = stateVector.clone().normalize();
            
            // Position de Beta: projection verticale du point d'intersection sur le plan XY
            const betaX = normalizedVector.x;
            const betaY = 0;  // Toujours sur le plan XY
            const betaZ = normalizedVector.z;
            
            return (
              <>
                {/* Point Beta */}
                <mesh position={[betaX, betaY, betaZ]} renderOrder={20}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color="#FFFF00" depthTest={false} />
                </mesh>
                
                {/* Label Beta */}
                <Billboard position={[betaX * 1.2, betaY, betaZ * 1.2]} follow={true} renderOrder={21}>
                  <mesh renderOrder={20}>
                    <planeGeometry args={[0.15, 0.15]} />
                    <meshBasicMaterial color="black" transparent opacity={0.7} depthTest={false} />
                  </mesh>
                  <Text 
                    position={[0, 0, 0.001]}
                    fontSize={0.08} 
                    color="#FFFF00"
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={21}
                    depthTest={false}
                  >
                    β
                  </Text>
                </Billboard>
                
                {/* Ligne verticale jaune du point |ψ⟩ vers Beta */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute 
                      attachObject={['attributes', 'position']}
                      count={2}
                      array={new Float32Array([
                        normalizedVector.x, normalizedVector.y, normalizedVector.z,
                        betaX, betaY, betaZ
                      ])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#FFFF00" />
                </line>
                
                {/* Ligne imaginaire jaune: Origine -> Beta -> Psi */}
                {(() => {
                  // Créer des petites sphères pour représenter la ligne imaginaire
                  const segments = 8; // Nombre de segments
                  const spheres = [];
                  
                  // Ligne 1: Origine -> Beta
                  for (let i = 1; i < segments; i++) {
                    const t = i / segments;
                    const x = betaX * t;
                    const y = betaY * t;
                    const z = betaZ * t;
                    
                    spheres.push(
                      <mesh key={`beta-segment-1-${i}`} position={[x, y, z]} renderOrder={20}>
                        <sphereGeometry args={[0.015, 8, 8]} />
                        <meshBasicMaterial color="#FFFF00" transparent opacity={0.8} depthTest={false} />
                      </mesh>
                    );
                  }
                  
                  // Ligne 2: Beta -> Psi
                  for (let i = 1; i < segments; i++) {
                    const t = i / segments;
                    const x = betaX + (normalizedVector.x - betaX) * t;
                    const y = betaY + (normalizedVector.y - betaY) * t;
                    const z = betaZ + (normalizedVector.z - betaZ) * t;
                    
                    spheres.push(
                      <mesh key={`beta-segment-2-${i}`} position={[x, y, z]} renderOrder={20}>
                        <sphereGeometry args={[0.015, 8, 8]} />
                        <meshBasicMaterial color="#FFFF00" transparent opacity={0.8} depthTest={false} />
                      </mesh>
                    );
                  }
                  
                  return spheres;
                })()}
              </>
            );
          })()}
          
          {/* Point |ψ⟩ sur la surface de la sphère */}
          <mesh position={[blochVector.x, blochVector.z, blochVector.y]} renderOrder={20}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ff0000" depthTest={false} />
          </mesh>
          
          {/* Label pour |ψ⟩ */}
          <Billboard 
            position={[blochVector.x * 1.3, blochVector.z * 1.3, blochVector.y * 1.3]} 
            follow={true}
            renderOrder={21}
          >
            <mesh renderOrder={20}>
              <planeGeometry args={[0.15, 0.15]} />
              <meshBasicMaterial color="black" transparent opacity={0.7} depthTest={false} />
            </mesh>
            <Text 
              position={[0, 0, 0.001]}
              fontSize={0.08} 
              color="#ff0000"
              anchorX="center"
              anchorY="middle"
              renderOrder={21}
              depthTest={false}
            >
              |ψ⟩
            </Text>
          </Billboard>
          
          {/* Projection ligne verte sur le plan XY */}
          <line>
            <bufferGeometry>
              <bufferAttribute 
                attachObject={['attributes', 'position']}
                count={2}
                array={new Float32Array([
                  0, 0, 0,
                  blochVector.x, 0, blochVector.y
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ff00" />
          </line>

          {/* Theta arc - série de petites sphères jaunes */}
          <group renderOrder={50}>
            {(() => {
              // Créer une série de petites sphères pour représenter l'arc theta
              const spheres = [];
              const radius = 0.2;  // Rayon de l'arc réduit
              const segments = 15;  // Nombre de segments réduit
              
              // Rotation pour s'aligner avec le plan du vecteur d'état
              const rotationMatrix = new THREE.Matrix4().makeRotationY(-phi);
              
              // Générer les sphères de 0 à theta
              for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const angle = theta * t;
                
                // Point sur un cercle dans le plan XZ (avec Y=0)
                const point = new THREE.Vector3(
                  Math.sin(angle) * radius,  // x
                  Math.cos(angle) * radius,  // y (correspond à l'axe Z du monde)
                  0                          // z
                );
                
                // Appliquer la rotation pour aligner avec le vecteur d'état
                point.applyMatrix4(rotationMatrix);
                
                // Ajouter une petite sphère à cette position
                spheres.push(
                  <mesh key={`theta-point-${i}`} position={[point.x, point.y, point.z]} renderOrder={50}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshBasicMaterial color="#FFBB00" depthTest={false} />
                  </mesh>
                );
              }
              
              return spheres;
            })()}
          </group>
          
          {/* Label for theta angle - centré au milieu de l'arc */}
          <group rotation={[0, -phi, 0]}>
            <Billboard position={[Math.sin(theta/2) * 0.28, Math.cos(theta/2) * 0.28, 0]} follow={true} renderOrder={25}>
              <mesh>
                <planeGeometry args={[0.24, 0.14]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.8} depthTest={false} />
              </mesh>
              <Text 
                position={[0, 0, 0.001]}
                fontSize={0.06} 
                color="#ffff00"
                anchorX="center"
                anchorY="middle"
                renderOrder={26}
                depthTest={false}
              >
                θ = {Math.round(theta * 180 / Math.PI)}°
              </Text>
            </Billboard>
          </group>
          
          {/* Arc for phi angle - série de petites sphères */}
          <group renderOrder={50}>
            {(() => {
              // Créer une série de petites sphères pour représenter l'arc phi sur le plan XY
              const spheres = [];
              const radius = 0.25;  // Rayon de l'arc
              const segments = 20;  // Nombre de segments (sphères)
              
              // Générer les sphères de 0 à phi
              for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const angle = phi * t;
                
                // Point sur un cercle dans le plan XY (avec Z=0)
                const x = Math.cos(angle) * radius;
                const y = 0;  // Sur le plan XY
                const z = Math.sin(angle) * radius;
                
                // Ajouter une petite sphère à cette position
                spheres.push(
                  <mesh key={`phi-point-${i}`} position={[x, y, z]} renderOrder={50}>
                    <sphereGeometry args={[0.018, 8, 8]} />
                    <meshBasicMaterial color="#00CCFF" depthTest={false} />
                  </mesh>
                );
              }
              
              return spheres;
            })()}
          </group>
          
          {/* Label pour l'angle phi */}
          <Billboard position={[Math.cos(phi/2) * 0.3, 0, Math.sin(phi/2) * 0.3]} follow={true} renderOrder={25}>
            <mesh>
              <planeGeometry args={[0.24, 0.14]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} depthTest={false} />
            </mesh>
            <Text 
              position={[0, 0, 0.001]}
              fontSize={0.06} 
              color="#00CCFF"
              anchorX="center"
              anchorY="middle"
              renderOrder={26}
              depthTest={false}
            >
              φ = {Math.round(phi * 180 / Math.PI)}°
            </Text>
          </Billboard>
        </>
      )}
      
      {/* Afficher les composantes du vecteur */}
      {showVectorComponents && (
        <>
          {/* Coordonnées cartésiennes et valeurs des amplitudes */}
          <Html position={[-1.5, -1.5, 0]}>
            <div style={{ 
              color: 'white', 
              backgroundColor: 'rgba(0,0,0,0.7)', 
              padding: '10px', 
              borderRadius: '5px',
              width: '200px'
            }}>
              <p style={{ margin: '5px 0' }}><strong>Coordonnées:</strong></p>
              <p style={{ margin: '5px 0' }}>x = {blochVector.x.toFixed(3)}</p>
              <p style={{ margin: '5px 0' }}>y = {blochVector.y.toFixed(3)}</p>
              <p style={{ margin: '5px 0' }}>z = {blochVector.z.toFixed(3)}</p>
              <p style={{ margin: '5px 0' }}><strong>Angles:</strong></p>
              <p style={{ margin: '5px 0' }}>θ = {(theta * 180 / Math.PI).toFixed(1)}°</p>
              <p style={{ margin: '5px 0' }}>φ = {(phi * 180 / Math.PI).toFixed(1)}°</p>
              <p style={{ margin: '5px 0' }}><strong>Amplitudes:</strong></p>
              <p style={{ margin: '5px 0' }}>
                α = {state.alpha.re.toFixed(3)} {state.alpha.im > 0 ? '+' : ''}{state.alpha.im !== 0 ? state.alpha.im.toFixed(3) + 'i' : ''}
              </p>
              <p style={{ margin: '5px 0' }}>
                β = {state.beta.re.toFixed(3)} {state.beta.im > 0 ? '+' : ''}{state.beta.im !== 0 ? state.beta.im.toFixed(3) + 'i' : ''}
              </p>
              <p style={{ margin: '5px 0' }}><strong>Probabilités:</strong></p>
              <p style={{ margin: '5px 0' }}>P(|0⟩) = {(Math.pow(state.alpha.re, 2) + Math.pow(state.alpha.im, 2)).toFixed(3)}</p>
              <p style={{ margin: '5px 0' }}>P(|1⟩) = {(Math.pow(state.beta.re, 2) + Math.pow(state.beta.im, 2)).toFixed(3)}</p>
            </div>
          </Html>
          
          {/* SUPPRESSION DES ANCIENS DOUBLONS EN ROSE/VIOLET */}
        </>
      )}
      
      {/* Grid lines */}
      {gridLines}
    </>
  );
};

// Main component for the 3D visualization
const BlochSphereVisualization = () => {
  const { state, getStateVectorNotation, getMeasurementProbabilities } = useQuantumState();
  
  // Calculate measurement probabilities
  const probs = getMeasurementProbabilities();
  
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [2, 2, 2], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <BlochSphere />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
      
      {/* State vector notation overlay */}
      <div 
        style={{
          position: 'absolute',
          left: 20,
          bottom: 20,
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          maxWidth: '400px',
          pointerEvents: 'none',
        }}
      >
        <div>State: {getStateVectorNotation()}</div>
        <div>Prob(|0⟩): {(probs.prob0 * 100).toFixed(2)}%</div>
        <div>Prob(|1⟩): {(probs.prob1 * 100).toFixed(2)}%</div>
        <div>Angles: θ = {(state.theta * 180 / Math.PI).toFixed(1)}°, φ = {(state.phi * 180 / Math.PI).toFixed(1)}°</div>
        <div>Bloch vector: ({state.blochVector.x.toFixed(2)}, {state.blochVector.y.toFixed(2)}, {state.blochVector.z.toFixed(2)})</div>
        <div style={{ fontFamily: 'math, serif', marginTop: '8px' }}>
          |ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup>sin(θ/2)|1⟩
        </div>
      </div>
    </div>
  );
};

export default BlochSphereVisualization;
