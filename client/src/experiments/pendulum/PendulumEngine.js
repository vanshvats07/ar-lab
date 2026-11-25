/**
 * Physics Engine for Simple Pendulum Experiment
 * Solves: d²θ/dt² + (b/m) dθ/dt + (g/L) sin(θ) = 0
 */
export class PendulumEngine {
  constructor({
    length = 0.8, // meters
    mass = 0.05, // kg (50g)
    releaseAngle = 10, // degrees
    damping = 0.015,
    gravity = 9.80665
  } = {}) {
    this.L = length;
    this.m = mass;
    this.initialAngleRad = (releaseAngle * Math.PI) / 180;
    this.theta = this.initialAngleRad;
    this.omega = 0; // angular velocity (rad/s)
    this.b = damping;
    this.g = gravity;

    this.isRunning = false;
    this.lastTime = 0;

    // Oscillation tracking
    this.oscillationCount = 0;
    this.zeroCrossings = 0;
    this.lastSign = Math.sign(this.theta) || 1;
    this.periodEstimates = [];
    this.lastCrossingTime = 0;

    // Mistake detection flags
    this.mistakes = {
      angleTooLarge: false,
      singleOscillationTimed: false,
      massConfusion: false,
      stoppedTooEarly: false
    };

    this.massChangeCount = 0;
    this.lengthHistory = [this.L];
  }

  setLength(newL) {
    this.L = Math.max(0.2, Math.min(1.5, newL));
    this.lengthHistory.push(this.L);
    if (!this.isRunning) {
      this.reset();
    }
  }

  setMass(newMass) {
    const prevMass = this.m;
    this.m = Math.max(0.01, Math.min(0.5, newMass));
    if (Math.abs(prevMass - this.m) > 0.01) {
      this.massChangeCount++;
      // If student repeatedly changes mass looking for period differences
      if (this.massChangeCount >= 2) {
        this.mistakes.massConfusion = true;
      }
    }
  }

  setReleaseAngle(degrees) {
    this.initialAngleRad = (degrees * Math.PI) / 180;
    if (Math.abs(degrees) > 15) {
      this.mistakes.angleTooLarge = true;
    } else {
      this.mistakes.angleTooLarge = false;
    }
    if (!this.isRunning) {
      this.theta = this.initialAngleRad;
      this.omega = 0;
    }
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
  }

  pause() {
    this.isRunning = false;
  }

  reset() {
    this.isRunning = false;
    this.theta = this.initialAngleRad;
    this.omega = 0;
    this.oscillationCount = 0;
    this.zeroCrossings = 0;
    this.lastSign = Math.sign(this.theta) || 1;
    this.periodEstimates = [];
    this.lastCrossingTime = 0;
  }

  // Theoretical exact period using small angle approximation: T = 2π √(L/g)
  getTheoreticalPeriod() {
    return 2 * Math.PI * Math.sqrt(this.L / this.g);
  }

  // Exact period with first-order correction for finite angle:
  // T ≈ T0 * (1 + 1/16 * θ0²)
  getFiniteAnglePeriod() {
    const T0 = this.getTheoreticalPeriod();
    const theta0 = Math.abs(this.initialAngleRad);
    return T0 * (1 + (1 / 16) * Math.pow(theta0, 2));
  }

  update(currentTime) {
    if (!this.isRunning) return { theta: this.theta, omega: this.omega };

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = currentTime;

    // Runge-Kutta 4th Order (RK4) integration for high numerical stability
    const f = (th, om) => {
      // dθ/dt = om
      // dω/dt = -(g/L)*sin(th) - (b/m)*om
      return {
        dTheta: om,
        dOmega: -(this.g / this.L) * Math.sin(th) - (this.b / this.m) * om
      };
    };

    const k1 = f(this.theta, this.omega);
    const k2 = f(this.theta + 0.5 * dt * k1.dTheta, this.omega + 0.5 * dt * k1.dOmega);
    const k3 = f(this.theta + 0.5 * dt * k2.dTheta, this.omega + 0.5 * dt * k2.dOmega);
    const k4 = f(this.theta + dt * k3.dTheta, this.omega + dt * k3.dOmega);

    this.theta += (dt / 6) * (k1.dTheta + 2 * k2.dTheta + 2 * k3.dTheta + k4.dTheta);
    this.omega += (dt / 6) * (k1.dOmega + 2 * k2.dOmega + 2 * k3.dOmega + k4.dOmega);

    // Detect zero-crossings (moving through equilibrium point θ = 0)
    const currentSign = Math.sign(this.theta);
    if (currentSign !== 0 && currentSign !== this.lastSign) {
      this.zeroCrossings++;
      // Each complete oscillation has 2 zero-crossings (left-to-right and right-to-left)
      this.oscillationCount = Math.floor(this.zeroCrossings / 2);
      this.lastSign = currentSign;
    }

    return {
      theta: this.theta,
      omega: this.omega,
      oscillations: this.oscillationCount
    };
  }

  evaluateStopwatchReading(measuredTime10, recordedOscillations = 10) {
    const theoretical10 = this.getTheoreticalPeriod() * 10;
    const timeForOne = measuredTime10 / recordedOscillations;
    const computedG = (4 * Math.PI * Math.PI * this.L) / (timeForOne * timeForOne);
    const percentError = Math.abs((computedG - this.g) / this.g) * 100;

    // Detect mistakes
    if (recordedOscillations === 1) {
      this.mistakes.singleOscillationTimed = true;
    }
    if (recordedOscillations < 5) {
      this.mistakes.stoppedTooEarly = true;
    }

    return {
      measuredTime: measuredTime10,
      recordedOscillations,
      timeForOne,
      theoreticalTime10: theoretical10,
      computedG: Number(computedG.toFixed(2)),
      acceptedG: 9.81,
      percentError: Number(percentError.toFixed(2)),
      mistakes: { ...this.mistakes }
    };
  }
}
