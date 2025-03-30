import { complex } from 'mathjs';

// Pauli-X gate (bit flip)
const pauliX = (alpha, beta) => {
  return {
    alpha: beta,
    beta: alpha
  };
};

// Pauli-Y gate
const pauliY = (alpha, beta) => {
  return {
    alpha: complex(0, -1).mul(beta),
    beta: complex(0, 1).mul(alpha)
  };
};

// Pauli-Z gate (phase flip)
const pauliZ = (alpha, beta) => {
  return {
    alpha: alpha,
    beta: complex(-1, 0).mul(beta)
  };
};

// Hadamard gate
const hadamard = (alpha, beta) => {
  const factor = complex(1 / Math.sqrt(2), 0);
  return {
    alpha: factor.mul(complex(alpha).add(beta)),
    beta: factor.mul(complex(alpha).sub(beta))
  };
};

// S gate (phase gate)
const sGate = (alpha, beta) => {
  return {
    alpha: alpha,
    beta: complex(0, 1).mul(beta)
  };
};

// T gate
const tGate = (alpha, beta) => {
  return {
    alpha: alpha,
    beta: complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)).mul(beta)
  };
};

// Rotation around X-axis
const rotateX = (alpha, beta, angle) => {
  const cos = Math.cos(angle / 2);
  const sin = Math.sin(angle / 2);
  
  return {
    alpha: complex(cos, 0).mul(alpha).add(complex(0, -sin).mul(beta)),
    beta: complex(0, -sin).mul(alpha).add(complex(cos, 0).mul(beta))
  };
};

// Rotation around Y-axis
const rotateY = (alpha, beta, angle) => {
  const cos = Math.cos(angle / 2);
  const sin = Math.sin(angle / 2);
  
  return {
    alpha: complex(cos, 0).mul(alpha).sub(complex(sin, 0).mul(beta)),
    beta: complex(sin, 0).mul(alpha).add(complex(cos, 0).mul(beta))
  };
};

// Rotation around Z-axis
const rotateZ = (alpha, beta, angle) => {
  const phase = complex(Math.cos(angle / 2), Math.sin(angle / 2));
  const phaseConj = complex(Math.cos(angle / 2), -Math.sin(angle / 2));
  
  return {
    alpha: phase.mul(alpha),
    beta: phaseConj.mul(beta)
  };
};

// Apply a gate to a quantum state
export const applyGate = (gateName, alpha, beta, params = {}) => {
  switch (gateName) {
    case 'X':
      return pauliX(alpha, beta);
    case 'Y':
      return pauliY(alpha, beta);
    case 'Z':
      return pauliZ(alpha, beta);
    case 'H':
      return hadamard(alpha, beta);
    case 'S':
      return sGate(alpha, beta);
    case 'T':
      return tGate(alpha, beta);
    case 'Rx':
      return rotateX(alpha, beta, params.angle || Math.PI / 4);
    case 'Ry':
      return rotateY(alpha, beta, params.angle || Math.PI / 4);
    case 'Rz':
      return rotateZ(alpha, beta, params.angle || Math.PI / 4);
    default:
      console.error(`Unknown gate: ${gateName}`);
      return null;
  }
};

// Convert between different representations of quantum states
export const stateConversions = {
  // Convert from Bloch vector to amplitude coefficients
  blochToAmplitudes: (x, y, z) => {
    // Calculate theta and phi from Bloch vector
    const r = Math.sqrt(x*x + y*y + z*z);
    const theta = Math.acos(z / r);
    let phi = Math.atan2(y, x);
    if (phi < 0) phi += 2 * Math.PI;
    
    // Calculate amplitudes from theta and phi
    return {
      alpha: complex(Math.cos(theta / 2), 0),
      beta: complex(
        Math.sin(theta / 2) * Math.cos(phi),
        Math.sin(theta / 2) * Math.sin(phi)
      )
    };
  },
  
  // Convert from amplitude coefficients to Bloch vector
  amplitudesToBloch: (alpha, beta) => {
    const x = 2 * (alpha.re * beta.re + alpha.im * beta.im);
    const y = 2 * (alpha.re * beta.im - alpha.im * beta.re);
    const z = Math.pow(Math.abs(alpha), 2) - Math.pow(Math.abs(beta), 2);
    
    return { x, y, z };
  },
  
  // Convert from spherical coordinates to amplitude coefficients
  sphericalToAmplitudes: (theta, phi) => {
    return {
      alpha: complex(Math.cos(theta / 2), 0),
      beta: complex(
        Math.sin(theta / 2) * Math.cos(phi),
        Math.sin(theta / 2) * Math.sin(phi)
      )
    };
  },
  
  // Convert from amplitude coefficients to spherical coordinates
  amplitudesToSpherical: (alpha, beta) => {
    const alphaAbs = Math.sqrt(alpha.re*alpha.re + alpha.im*alpha.im);
    const betaAbs = Math.sqrt(beta.re*beta.re + beta.im*beta.im);
    
    const theta = 2 * Math.acos(alphaAbs);
    
    let phi = 0;
    if (betaAbs > 0.00001) {
      phi = Math.atan2(beta.im, beta.re);
      if (phi < 0) phi += 2 * Math.PI;
    }
    
    return { theta, phi };
  }
};
