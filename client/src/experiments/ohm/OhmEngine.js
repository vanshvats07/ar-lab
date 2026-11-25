/**
 * Circuit Simulation Engine for Ohm's Law Experiment
 * Evaluates real-time voltage, current, resistance, power, and detects common student mistakes.
 */
export class OhmEngine {
  constructor({
    voltage = 3.0, // Volts
    resistance = 10.0, // Ohms
    maxPowerRating = 2.0 // Watts
  } = {}) {
    this.voltage = voltage;
    this.resistance = resistance;
    this.maxPowerRating = maxPowerRating;
    this.isSwitchClosed = false;

    // Component placement & connection state
    // Terminals: battery_pos, battery_neg, resistor_in, resistor_out, ammeter_pos, ammeter_neg, voltmeter_pos, voltmeter_neg, switch_in, switch_out
    this.connections = []; // list of [fromNode, toNode]

    // Default mistake state
    this.mistakes = {
      ammeterInParallel: false,
      voltmeterInSeries: false,
      openCircuit: true,
      shortCircuit: false,
      wrongPolarity: false,
      resistorOverheating: false
    };

    // Live measurements
    this.current = 0.0;
    this.measuredVoltage = 0.0;
    this.power = 0.0;
    this.isOverheated = false;

    // Recorded observation points: [{ voltage, current, resistance }]
    this.readings = [];
  }

  setVoltage(v) {
    this.voltage = Math.max(0.5, Math.min(15.0, Number(v)));
    this.solveCircuit();
  }

  setResistance(r) {
    this.resistance = Math.max(1.0, Math.min(500.0, Number(r)));
    this.solveCircuit();
  }

  toggleSwitch(closed) {
    this.isSwitchClosed = typeof closed === 'boolean' ? closed : !this.isSwitchClosed;
    this.solveCircuit();
    return this.isSwitchClosed;
  }

  // Connect two terminals
  connect(nodeA, nodeB) {
    // Prevent duplicate wires
    const exists = this.connections.some(
      ([a, b]) => (a === nodeA && b === nodeB) || (a === nodeB && b === nodeA)
    );
    if (!exists) {
      this.connections.push([nodeA, nodeB]);
      this.solveCircuit();
    }
  }

  disconnect(nodeA, nodeB) {
    this.connections = this.connections.filter(
      ([a, b]) => !((a === nodeA && b === nodeB) || (a === nodeB && b === nodeA))
    );
    this.solveCircuit();
  }

  clearConnections() {
    this.connections = [];
    this.solveCircuit();
  }

  // Set preset wiring configuration for easy 1-click student or preset setup
  setWiringPreset(presetType) {
    this.connections = [];
    switch (presetType) {
      case 'correct':
        // Battery(+) -> Switch -> Ammeter(+) -> Ammeter(-) -> Resistor(in) -> Resistor(out) -> Battery(-)
        // Voltmeter in parallel across Resistor
        this.connections = [
          ['battery_pos', 'switch_in'],
          ['switch_out', 'ammeter_pos'],
          ['ammeter_neg', 'resistor_in'],
          ['resistor_out', 'battery_neg'],
          ['voltmeter_pos', 'resistor_in'],
          ['voltmeter_neg', 'resistor_out']
        ];
        break;

      case 'ammeter_parallel':
        // Ammeter connected in parallel with resistor (Mistake 1)
        this.connections = [
          ['battery_pos', 'switch_in'],
          ['switch_out', 'resistor_in'],
          ['resistor_out', 'battery_neg'],
          ['ammeter_pos', 'resistor_in'],
          ['ammeter_neg', 'resistor_out'],
          ['voltmeter_pos', 'resistor_in'],
          ['voltmeter_neg', 'resistor_out']
        ];
        break;

      case 'voltmeter_series':
        // Voltmeter connected in series in the main loop (Mistake 2)
        this.connections = [
          ['battery_pos', 'switch_in'],
          ['switch_out', 'voltmeter_pos'],
          ['voltmeter_neg', 'ammeter_pos'],
          ['ammeter_neg', 'resistor_in'],
          ['resistor_out', 'battery_neg']
        ];
        break;

      case 'short_circuit':
        // Battery positive directly connected to negative (Mistake 3)
        this.connections = [
          ['battery_pos', 'switch_in'],
          ['switch_out', 'battery_neg']
        ];
        break;

      case 'reverse_polarity':
        // Meters connected with opposite polarity (Mistake 4)
        this.connections = [
          ['battery_pos', 'switch_in'],
          ['switch_out', 'ammeter_neg'], // wrong polarity
          ['ammeter_pos', 'resistor_in'],
          ['resistor_out', 'battery_neg'],
          ['voltmeter_neg', 'resistor_in'], // wrong polarity
          ['voltmeter_pos', 'resistor_out']
        ];
        break;

      default:
        break;
    }
    this.solveCircuit();
  }

  // Graph traversal to check network connectivity
  isConnected(nodeStart, nodeEnd, visited = new Set(), excludedNodes = new Set()) {
    if (nodeStart === nodeEnd) return true;
    visited.add(nodeStart);

    for (const [a, b] of this.connections) {
      const neighbor = a === nodeStart ? b : b === nodeStart ? a : null;
      if (neighbor && !visited.has(neighbor) && !excludedNodes.has(neighbor)) {
        if (neighbor === nodeEnd) return true;
        if (this.isConnected(neighbor, nodeEnd, visited, excludedNodes)) {
          return true;
        }
      }
    }
    return false;
  }

  solveCircuit() {
    // Reset mistakes
    this.mistakes = {
      ammeterInParallel: false,
      voltmeterInSeries: false,
      openCircuit: false,
      shortCircuit: false,
      wrongPolarity: false,
      resistorOverheating: false
    };

    // 1. Check switch status
    if (!this.isSwitchClosed) {
      this.current = 0.0;
      this.measuredVoltage = 0.0;
      this.power = 0.0;
      this.mistakes.openCircuit = true;
      return this.getState();
    }

    // 2. Check for Direct Short Circuit (battery_pos connected to battery_neg with negligible resistance)
    const directShort = this.isConnected('battery_pos', 'battery_neg', new Set(), new Set(['resistor_in', 'resistor_out', 'voltmeter_pos', 'voltmeter_neg']));
    if (directShort) {
      this.mistakes.shortCircuit = true;
      this.current = 25.0; // excessive current limit
      this.measuredVoltage = 0.1;
      this.power = 0.0;
      return this.getState();
    }

    // 3. Check Voltmeter in Series
    // If voltmeter terminals are the only bridge in the series loop
    const reachesThroughVM = this.isConnected('battery_pos', 'voltmeter_pos') && this.isConnected('voltmeter_neg', 'battery_neg');
    const pathWithoutVM = this.isConnected('battery_pos', 'battery_neg', new Set(), new Set(['voltmeter_pos', 'voltmeter_neg']));
    if (reachesThroughVM && !pathWithoutVM) {
      this.mistakes.voltmeterInSeries = true;
      // High resistance voltmeter (~10M ohm) drops almost all voltage, current is micro-amperes
      this.measuredVoltage = this.voltage;
      this.current = 0.0001; // nearly 0 A
      this.power = 0.0;
      return this.getState();
    }

    // 4. Check Ammeter in Parallel
    // If ammeter is wired across the resistor terminals directly
    const ammeterAcrossResistor = (
      (this.isConnected('ammeter_pos', 'resistor_in') && this.isConnected('ammeter_neg', 'resistor_out')) ||
      (this.isConnected('ammeter_pos', 'resistor_out') && this.isConnected('ammeter_neg', 'resistor_in'))
    ) && (this.isConnected('battery_pos', 'resistor_in') || this.isConnected('battery_pos', 'ammeter_pos'));

    if (ammeterAcrossResistor && !this.mistakes.shortCircuit) {
      // Ammeter resistance is ~0.01 ohm, so current shoots up, bypassing resistor
      this.mistakes.ammeterInParallel = true;
      this.current = this.voltage / 0.1; // dangerous current
      this.measuredVoltage = 0.02; // near zero across ammeter
      this.power = 0.0;
      return this.getState();
    }

    // 5. Check Wrong Polarity
    const ammeterReverse = this.isConnected('battery_neg', 'ammeter_pos') || this.isConnected('battery_pos', 'ammeter_neg');
    const voltmeterReverse = this.isConnected('battery_neg', 'voltmeter_pos') || this.isConnected('battery_pos', 'voltmeter_neg');
    if (ammeterReverse || voltmeterReverse) {
      this.mistakes.wrongPolarity = true;
    }

    // 6. Normal Closed Circuit Check
    const closedLoop = this.isConnected('battery_pos', 'battery_neg');
    if (!closedLoop) {
      this.mistakes.openCircuit = true;
      this.current = 0.0;
      this.measuredVoltage = 0.0;
      this.power = 0.0;
      return this.getState();
    }

    // Standard Ohm's Law Calculation: I = V / R
    this.current = Number((this.voltage / this.resistance).toFixed(3));
    this.measuredVoltage = Number(this.voltage.toFixed(2));
    this.power = Number((this.current * this.measuredVoltage).toFixed(2));

    // 7. Check Resistor Overheating
    if (this.power > this.maxPowerRating) {
      this.mistakes.resistorOverheating = true;
      this.isOverheated = true;
    } else {
      this.isOverheated = false;
    }

    return this.getState();
  }

  recordReading() {
    if (this.mistakes.openCircuit || this.mistakes.shortCircuit || this.mistakes.ammeterInParallel) {
      return { success: false, reason: 'Circuit is not properly connected or in error state.' };
    }

    const reading = {
      id: Date.now(),
      voltage: this.measuredVoltage,
      current: this.current,
      theoreticalResistance: this.resistance,
      calculatedResistance: Number((this.measuredVoltage / (this.current || 0.001)).toFixed(2)),
      timestamp: new Date().toLocaleTimeString()
    };

    this.readings.push(reading);
    return { success: true, reading, totalReadings: this.readings.length };
  }

  getState() {
    return {
      voltage: this.voltage,
      resistance: this.resistance,
      current: this.current,
      measuredVoltage: this.measuredVoltage,
      power: this.power,
      isSwitchClosed: this.isSwitchClosed,
      isOverheated: this.isOverheated,
      connections: [...this.connections],
      readings: [...this.readings],
      mistakes: { ...this.mistakes }
    };
  }
}
