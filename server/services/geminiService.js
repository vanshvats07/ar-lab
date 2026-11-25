import { getRuleBasedFeedback } from './ruleBasedTutor.js';

export async function askGeminiTutor({
  experiment,
  state,
  lastAction = '',
  hintLevel = 1,
  language = 'en'
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // If no API key or in offline test mode, use rule-based tutor immediately
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getRuleBasedFeedback(experiment, state, hintLevel, language);
  }

  const langInstruction =
    language === 'hi'
      ? 'Respond strictly in clear, natural conversational HINDI (Devanagari script).'
      : 'Respond in encouraging, concise ENGLISH.';

  const hintLevelGuide = {
    1: 'HINT LEVEL 1 (NUDGE): Ask a reflective Socratic question or give a subtle observation. DO NOT reveal the solution.',
    2: 'HINT LEVEL 2 (EXPLAIN): Explain the physical principle causing this phenomenon (e.g. small-angle approximation, internal meter impedance).',
    3: 'HINT LEVEL 3 (SHOW THE FIX): Provide direct, clear, actionable steps to fix the setup.'
  }[hintLevel] || 'HINT LEVEL 1: Nudge';

  const systemPrompt = `You are a friendly Socratic Physics Tutor for high school/college students in an interactive virtual lab.
RULES:
1. Keep your reply strictly UNDER 3 SENTENCES.
2. ${hintLevelGuide}
3. ${langInstruction}
4. Always identify which 3D component the student needs to pay attention to from this list:
   For Ohm: "battery", "resistor", "ammeter", "voltmeter", "switch"
   For Pendulum: "bob", "string", "protractor", "stand", "clamp"
5. Output valid JSON only, with keys:
   {
     "message": "...",
     "highlight_component": "component_name",
     "detected_error": "short error identifier or null"
   }`;

  const userContent = `Experiment: ${experiment}
Live State: ${JSON.stringify(state)}
Last Action: ${lastAction}
Requested Hint Level: ${hintLevel}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 250,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API error ${response.status}. Falling back to rule tutor.`);
      return getRuleBasedFeedback(experiment, state, hintLevel, language);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return getRuleBasedFeedback(experiment, state, hintLevel, language);
    }

    const parsed = JSON.parse(rawText);
    return {
      message: parsed.message,
      highlight_component: parsed.highlight_component || (experiment === 'pendulum' ? 'bob' : 'resistor'),
      hint_level: hintLevel,
      detected_error: parsed.detected_error,
      is_fallback: false
    };
  } catch (err) {
    console.warn('Gemini tutor call failed:', err.message);
    return getRuleBasedFeedback(experiment, state, hintLevel, language);
  }
}

export async function generateLabReportAI({
  experiment,
  readings,
  mistakes = [],
  hintsUsed = 0,
  timeTaken = 0,
  calculatedResult = {}
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const defaultReport = generateDefaultReport(experiment, readings, mistakes, calculatedResult);

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return defaultReport;
  }

  const prompt = `You are a physics lab professor grading and summarizing an experiment for a student lab report.
Experiment: ${experiment}
Observation Readings: ${JSON.stringify(readings)}
Mistakes Made: ${JSON.stringify(mistakes)}
Hints Used: ${hintsUsed}
Time Taken: ${timeTaken} seconds
Calculated Result: ${JSON.stringify(calculatedResult)}

Generate a comprehensive academic lab report in JSON format with exactly these keys:
{
  "aim": "string",
  "apparatus": ["string"],
  "procedure": ["string"],
  "observationTable": [{"voltage": ..., "current": ..., "resistance": ...}] or [{"trial": ..., "length": ..., "time10": ..., "period": ...}],
  "calculatedResult": "string with final values and % error",
  "percentError": number,
  "conclusion": "string summarizing Ohm's Law or simple pendulum law",
  "vivaQuestions": [
    {"question": "string", "answer": "string"}
  ] // exactly 5 questions with detailed answers
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      return defaultReport;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  } catch (err) {
    console.warn('Gemini report call failed:', err.message);
    return defaultReport;
  }
}

function generateDefaultReport(experiment, readings, mistakes, calculatedResult) {
  if (experiment === 'pendulum') {
    const measuredG = calculatedResult.computedG || 9.78;
    const error = calculatedResult.percentError || 0.3;
    return {
      aim: "To determine the acceleration due to gravity (g) using a simple pendulum and plot L vs T² graph.",
      apparatus: [
        "Rigid lab stand with clamp",
        "Inextensible light string",
        "Metallic spherical bob with hook",
        "Digital stopwatch (precision 0.01s)",
        "Protractor angle indicator"
      ],
      procedure: [
        "Measure the length of string L from suspension pivot to center of bob.",
        "Displace the bob by a small angle (θ < 15°) within small-angle approximation.",
        "Release without imparting initial push and allow 2 complete oscillations to stabilize.",
        "Record the time taken for 10 complete oscillations using the digital stopwatch.",
        "Calculate the time period T = T₁₀ / 10 and compute g = 4π²L / T²."
      ],
      observationTable: readings.length > 0 ? readings : [
        { trial: 1, length: "0.80 m", time10: "17.96 s", period: "1.796 s", computedG: "9.79 m/s²" },
        { trial: 2, length: "0.70 m", time10: "16.80 s", period: "1.680 s", computedG: "9.80 m/s²" },
        { trial: 3, length: "0.60 m", time10: "15.54 s", period: "1.554 s", computedG: "9.81 m/s²" }
      ],
      calculatedResult: `Experimental acceleration due to gravity g = ${measuredG} m/s² (Standard value = 9.81 m/s², Percentage Error = ${error}%).`,
      percentError: error,
      conclusion: "The acceleration due to gravity was successfully determined. The square of the time period T² is directly proportional to string length L, and the period is independent of bob mass.",
      vivaQuestions: [
        {
          question: "Why must the angular displacement be kept small (θ < 15°)?",
          answer: "The formula T = 2π√(L/g) is derived using the approximation sin(θ) ≈ θ (in radians). For angles greater than 15°, higher-order terms become significant and error increases."
        },
        {
          question: "Why do we measure the time for 10 oscillations instead of a single oscillation?",
          answer: "Human reaction time uncertainty (~0.2 - 0.3s) would introduce a large percentage error in a single oscillation (~15%). Measuring 10 oscillations spreads this error over 10 cycles, reducing uncertainty to ~1.5%."
        },
        {
          question: "Does the time period depend on the mass or material of the bob?",
          answer: "No. In the equation of motion, both gravitational force (restoring force) and inertial mass scale identically with mass m, cancelling each other out."
        },
        {
          question: "What would happen to the time period if the experiment were performed on the Moon?",
          answer: "Since lunar gravity is ~1/6th of Earth's gravity (g_moon ≈ 1.62 m/s²), the time period would increase by a factor of √6 ≈ 2.45 times."
        },
        {
          question: "What is the physical meaning of the slope in an L vs T² graph?",
          answer: "Since T² = (4π²/g) * L, plotting L on the y-axis against T² on the x-axis yields a straight line with slope g / (4π²). Thus g = 4π² * slope."
        }
      ]
    };
  }

  // Ohm's Law default report
  const resistance = calculatedResult.resistance || 10.0;
  return {
    aim: "To verify Ohm's Law and determine the resistance of a given resistor by plotting a V-I graph.",
    apparatus: [
      "DC regulated power supply (0 - 12V)",
      "Ceramic test resistor (unknown resistance R)",
      "DC Milliammeter / Ammeter (0 - 3A)",
      "DC Voltmeter (0 - 15V)",
      "One-way knife switch key",
      "Connecting copper wires"
    ],
    procedure: [
      "Connect the battery, key, ammeter, and test resistor in series.",
      "Connect the voltmeter in parallel across the terminals of the test resistor.",
      "Ensure proper polarity: positive terminals connected toward positive supply pole.",
      "Close the switch key and adjust voltage in graduated steps.",
      "Record simultaneous readings of voltmeter (V) and ammeter (I) for at least 5 data points.",
      "Plot V on the y-axis vs I on the x-axis; determine slope = resistance R."
    ],
    observationTable: readings.length > 0 ? readings : [
      { trial: 1, voltage: "1.5 V", current: "0.15 A", calculatedResistance: "10.0 Ω" },
      { trial: 2, voltage: "3.0 V", current: "0.30 A", calculatedResistance: "10.0 Ω" },
      { trial: 3, voltage: "4.5 V", current: "0.45 A", calculatedResistance: "10.0 Ω" },
      { trial: 4, voltage: "6.0 V", current: "0.60 A", calculatedResistance: "10.0 Ω" },
      { trial: 5, voltage: "7.5 V", current: "0.75 A", calculatedResistance: "10.0 Ω" }
    ],
    calculatedResult: `Experimental Resistance R = ${resistance} Ω. V/I ratio is constant within experimental uncertainty.`,
    percentError: 0.5,
    conclusion: "The graph between potential difference V and current I is a linear straight line passing through the origin, confirming Ohm's Law (V = I * R).",
    vivaQuestions: [
      {
        question: "State Ohm's Law and its primary physical limitation.",
        answer: "Ohm's Law states that current through a conductor between two points is directly proportional to voltage across it, provided temperature and other physical conditions remain constant."
      },
      {
        question: "Why is an ammeter always connected in series and a voltmeter in parallel?",
        answer: "An ammeter has near-zero internal resistance so it doesn't impede current flow in the loop. A voltmeter has very high internal resistance so it draws negligible current from the branch."
      },
      {
        question: "What happens if an ammeter is accidentally connected in parallel across the battery?",
        answer: "Because of its near-zero resistance, it causes a short circuit, drawing dangerously high current that can damage the meter or battery."
      },
      {
        question: "What causes non-ohmic behavior in conductors at high currents?",
        answer: "High current causes Joule heating (P = I²R). As temperature rises, lattice vibrations increase electron scattering, increasing resistance and curving the V-I graph."
      },
      {
        question: "How can the resistance be computed from a V vs I graph?",
        answer: "The slope of the V (voltage) versus I (current) straight line equals ΔV / ΔI, which directly gives the resistance R in Ohms."
      }
    ]
  };
}
