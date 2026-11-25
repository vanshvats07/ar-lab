/**
 * Rule-Based Socratic Physics Tutor Fallback
 * Provides 3 hint levels in both English and Hindi for all experiment mistakes.
 */

const PENDULUM_RULES = {
  angleTooLarge: {
    component: 'protractor',
    en: {
      hint1: "Look closely at the release angle on the protractor. Does our simple pendulum formula T = 2π√(L/g) assume a tiny swing or a huge swing?",
      hint2: "The derivation of time period relies on the small-angle approximation where sin(θ) ≈ θ in radians, which only holds true for angles under 15°.",
      hint3: "Pull the bob back to an angle of 10° or less (within the green safe zone) and release it again to keep error under 1%."
    },
    hi: {
      hint1: "चांदे (protractor) पर विस्थापन कोण को ध्यान से देखें। क्या हमारा सरल लोलक का सूत्र T = 2π√(L/g) छोटे कोण के लिए मान्य है या बड़े कोण के लिए?",
      hint2: "सरल लोलक का सिद्धांत 'small-angle approximation' पर आधारित है जहाँ sin(θ) ≈ θ केवल 15 डिग्री से कम कोणों पर ही सही परिणाम देता है।",
      hint3: "बॉब को 10° या उससे कम कोण (हरे सुरक्षित क्षेत्र) पर लाकर छोड़ें ताकि त्रुटि 1% से कम रहे।"
    }
  },
  singleOscillationTimed: {
    component: 'bob',
    en: {
      hint1: "You stopped timing after just one oscillation! How much does human reaction time (about 0.3 seconds) distort a single swing?",
      hint2: "Measuring 10 full oscillations spreads your human timing error across 10 cycles, reducing your measurement uncertainty by a factor of 10.",
      hint3: "Start the stopwatch as the bob passes equilibrium, count 10 complete back-and-forth swings, and then stop the timer."
    },
    hi: {
      hint1: "आपने सिर्फ एक दोलन के बाद स्टॉपवॉच रोक दी! क्या हमारी प्रतिक्रिया समय (reaction time ~0.3s) एक अकेले दोलन को प्रभावित नहीं करेगा?",
      hint2: "10 पूरे दोलन मापने से मानव त्रुटि 10 चक्रों में बंट जाती है, जिससे कुल अनिश्चितता दस गुना घट जाती है।",
      hint3: "बॉब के मध्य स्थिति से गुजरते ही स्टॉपवॉच शुरू करें, 10 पूरे दोलन गिनें और फिर स्टॉपवॉच रोकें।"
    }
  },
  massConfusion: {
    component: 'bob',
    en: {
      hint1: "You adjusted the bob's mass, but did the period of swing actually change? Check Galileo's famous pendulum law.",
      hint2: "In T = 2π√(L/g), restoring force and inertia both scale proportionally with mass, completely cancelling out mass from the period equation.",
      hint3: "Leave the mass constant and instead vary the string length L to observe how the period changes."
    },
    hi: {
      hint1: "आपने बॉब का द्रव्यमान बदला, लेकिन क्या दोलन काल बदला? गैलीलियो के लोलक नियम पर विचार करें।",
      hint2: "सूत्र T = 2π√(L/g) में प्रत्यानयन बल और जड़त्व दोनों द्रव्यमान के समानुपाती होते हैं, इसलिए द्रव्यमान पूरी तरह कट जाता है।",
      hint3: "द्रव्यमान बदलने के बजाय धागे की लंबाई L को बदलें और देखें कि आवर्तकाल कैसे बदलता है।"
    }
  },
  stoppedTooEarly: {
    component: 'bob',
    en: {
      hint1: "The timer was stopped with very few oscillations recorded. Can we accurately calculate g with so few samples?",
      hint2: "Statistical precision in physics labs requires observing a steady periodic cycle for at least 10 oscillations.",
      hint3: "Reset the stopwatch and allow the pendulum to complete the full 10 cycles before stopping."
    },
    hi: {
      hint1: "स्टॉपवॉच बहुत जल्दी रोक दी गई। क्या इतने कम दोलनों से g का सटीक मान ज्ञात हो सकता है?",
      hint2: "भौतिकी प्रयोगशाला में सांख्यिकीय सटीकता के लिए कम से कम 10 पूर्ण दोलन मापना अनिवार्य है।",
      hint3: "स्टॉपवॉच रीसेट करें और पूरे 10 दोलन पूरे होने तक प्रतीक्षा करें।"
    }
  }
};

const OHM_RULES = {
  ammeterInParallel: {
    component: 'ammeter',
    en: {
      hint1: "Notice where your ammeter is connected across the circuit. Should a current meter share the branch or be placed in line?",
      hint2: "An ideal ammeter has near-zero internal resistance. Connecting it in parallel across a component bypasses it and causes an excessive current spike.",
      hint3: "Disconnect the ammeter and wire it in SERIES into the main loop so all current flows through it safely."
    },
    hi: {
      hint1: "ध्यान दें कि आपका एमीटर परिपथ में कहाँ जुड़ा है। क्या धारामापी को समानांतर जोड़ना चाहिए या श्रेणी में?",
      hint2: "एक आदर्श एमीटर का आंतरिक प्रतिरोध लगभग शून्य होता है। इसे समानांतर जोड़ने से शॉर्ट सर्किट जैसा भारी करंट बहने लगता है।",
      hint3: "एमीटर को हटाएँ और इसे मुख्य परिपथ में श्रेणीक्रम (SERIES) में जोड़ें ताकि सम्पूर्ण धारा इसमें से सुरक्षित गुजरे।"
    }
  },
  voltmeterInSeries: {
    component: 'voltmeter',
    en: {
      hint1: "Look at the current reading—it dropped to nearly zero! Why would putting a voltmeter in the main path block the flow?",
      hint2: "A voltmeter is built with an extremely high internal resistance (~10 MΩ) so it doesn't draw current when measuring potential difference.",
      hint3: "Remove the voltmeter from the series loop and connect its terminals in PARALLEL across the resistor."
    },
    hi: {
      hint1: "धारा का मान देखें—यह लगभग शून्य हो गया है! मुख्य धारा मार्ग में वोल्टमीटर लगाने से प्रवाह क्यों रुका?",
      hint2: "वोल्टमीटर का आंतरिक प्रतिरोध अत्यंत उच्च (~10 MΩ) होता है ताकि यह विभवांतर नापते समय धारा न खींचे।",
      hint3: "वोल्टमीटर को मुख्य लूप से हटाएँ और प्रतिरोधक के दोनों सिरों के आर-पार समानांतर (PARALLEL) जोड़ें।"
    }
  },
  openCircuit: {
    component: 'switch',
    en: {
      hint1: "Current cannot flow yet. Is there an open switch or an unconnected terminal breaking the loop?",
      hint2: "Electric charge requires an unbroken conducting loop from the positive terminal back to the negative terminal.",
      hint3: "Close the knife switch and ensure all wires are firmly attached to the component terminals."
    },
    hi: {
      hint1: "धारा अभी नहीं बह रही है। क्या कुंजी खुली है या कोई तार छूटा हुआ है?",
      hint2: "विद्युत आवेश को प्रवाहित होने के लिए धनात्मक टर्मिनल से ऋणात्मक टर्मिनल तक एक बंद परिपथ की आवश्यकता होती है।",
      hint3: "कुंजी (switch) को बंद करें और सुनिश्चित करें कि सभी तार टर्मिनलों से जुड़े हैं।"
    }
  },
  shortCircuit: {
    component: 'battery',
    en: {
      hint1: "Warning: danger of high current! Are the battery terminals connected directly together without any resistance?",
      hint2: "Without a resistive load, Ohm's law I = V/R means with R ≈ 0, current approaches infinity, causing sparks and battery damage.",
      hint3: "Immediately route the wire through the resistor before returning it to the negative battery terminal."
    },
    hi: {
      hint1: "सावधान: अत्यधिक धारा का खतरा! क्या बैटरी के दोनों टर्मिनल बिना किसी प्रतिरोध के सीधे जुड़े हैं?",
      hint2: "बिना प्रतिरोध के, ओम के नियम I = V/R के अनुसार R ≈ 0 होने पर धारा अनियंत्रित हो जाती है जिससे स्पार्क पैदा होता है।",
      hint3: "तुरंत तार को प्रतिरोधक (resistor) के माध्यम से जोड़ें और फिर बैटरी के ऋणात्मक सिरे पर लाएँ।"
    }
  },
  wrongPolarity: {
    component: 'ammeter',
    en: {
      hint1: "Check the terminal colors on your meters. Is current entering through the positive (red) terminal as intended?",
      hint2: "DC meters are polarity-sensitive; reverse current pushes the needle against the zero-stop or displays a negative value.",
      hint3: "Swap the red (+) and black (-) wire leads so current enters the red terminal from the positive battery side."
    },
    hi: {
      hint1: "अपने मीटरों के टर्मिनलों का रंग देखें। क्या धारा लाल (+) टर्मिनल से ही प्रवेश कर रही है?",
      hint2: "डीसी मीटर ध्रुवता-संवेदनशील होते हैं; उल्टी धारा सुई को उल्टी दिशा में धकेलती है।",
      hint3: "लाल (+) और काले (-) तारों की स्थिति बदलें ताकि धारा बैटरी के धनात्मक सिरे से लाल टर्मिनल में आए।"
    }
  },
  resistorOverheating: {
    component: 'resistor',
    en: {
      hint1: "The resistor is glowing hot! What happens to the power P = V²/R when you supply too much voltage across a low resistance?",
      hint2: "Joule's heating law dictates that electrical power converts into thermal energy, exceeding the component's wattage rating.",
      hint3: "Lower the power supply voltage or select a higher resistance value to keep power under 2 Watts."
    },
    hi: {
      hint1: "प्रतिरोधक अत्यधिक गर्म होकर चमक रहा है! जब आप कम प्रतिरोध पर अधिक वोल्टेज देते हैं तो शक्ति P = V²/R का क्या होता है?",
      hint2: "जूल के तापीय नियम के अनुसार विद्युत ऊर्जा ऊष्मा में बदलती है, जो घटक की सुरक्षित वाटेज क्षमता से अधिक हो गई है।",
      hint3: "पावर सप्लाई का वोल्टेज कम करें या 2 वॉट से कम शक्ति बनाए रखने के लिए अधिक प्रतिरोध का मान चुनें।"
    }
  }
};

export function getRuleBasedFeedback(experiment, state, hintLevel = 1, language = 'en') {
  const langKey = language === 'hi' ? 'hi' : 'en';
  const levelKey = hintLevel === 3 ? 'hint3' : hintLevel === 2 ? 'hint2' : 'hint1';

  if (experiment === 'pendulum') {
    const mistakes = state.mistakes || {};
    let matchedKey = null;

    if (mistakes.angleTooLarge) matchedKey = 'angleTooLarge';
    else if (mistakes.singleOscillationTimed) matchedKey = 'singleOscillationTimed';
    else if (mistakes.massConfusion) matchedKey = 'massConfusion';
    else if (mistakes.stoppedTooEarly) matchedKey = 'stoppedTooEarly';

    if (matchedKey && PENDULUM_RULES[matchedKey]) {
      const rule = PENDULUM_RULES[matchedKey];
      return {
        message: rule[langKey][levelKey],
        highlight_component: rule.component,
        hint_level: hintLevel,
        detected_error: matchedKey,
        is_fallback: true
      };
    }

    // Default encouraging encouragement if no mistake
    return {
      message:
        langKey === 'hi'
          ? 'आपका प्रयोग बिल्कुल सही चल रहा है। 10 दोलनों का समय मापें और g का मान परिकलित करें।'
          : 'Your pendulum setup looks great! Release the bob gently and measure the time for 10 oscillations.',
      highlight_component: 'bob',
      hint_level: hintLevel,
      detected_error: null,
      is_fallback: true
    };
  }

  // Ohm's law experiment
  const mistakes = state.mistakes || {};
  let matchedKey = null;

  if (mistakes.shortCircuit) matchedKey = 'shortCircuit';
  else if (mistakes.ammeterInParallel) matchedKey = 'ammeterInParallel';
  else if (mistakes.voltmeterInSeries) matchedKey = 'voltmeterInSeries';
  else if (mistakes.wrongPolarity) matchedKey = 'wrongPolarity';
  else if (mistakes.resistorOverheating) matchedKey = 'resistorOverheating';
  else if (mistakes.openCircuit) matchedKey = 'openCircuit';

  if (matchedKey && OHM_RULES[matchedKey]) {
    const rule = OHM_RULES[matchedKey];
    return {
      message: rule[langKey][levelKey],
      highlight_component: rule.component,
      hint_level: hintLevel,
      detected_error: matchedKey,
      is_fallback: true
    };
  }

  return {
    message:
      langKey === 'hi'
        ? 'परिपथ ठीक से जुड़ा है। अलग-अलग वोल्टेज पर 5 पाठ्यांक दर्ज करें और V-I ग्राफ खींचें।'
        : 'Circuit is correctly connected. Record 5 different V-I readings across various voltages to plot your graph.',
    highlight_component: 'resistor',
    hint_level: hintLevel,
    detected_error: null,
    is_fallback: true
  };
}
