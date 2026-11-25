# AR Physics Lab by HackHounds — 3-Minute Live Hackathon Demo Script

**Total Time:** 3 Minutes (180 Seconds)  
**Presenter Roles:** 1 Presenter (holding mobile phone or mirroring phone screen to projector + laptop dashboard)

---

## ⏱️ Timeline & Stage Directions

### [0:00 - 0:30] Act 1: The Problem & The ₹10k Phone Reality
* **Visual:** Presenter shows budget Android phone (~₹10,000 / $120) or laptop browser.
* **Spoken Pitch:**
  > *"Across 1.5 million schools in India and developing nations, over 80% lack functional physical science laboratories. Traditional VR headsets like Quest 3 cost ₹50,000+ each—impossible for public schools. Meanwhile, 250 million students carry or have access to budget Android smartphones.*  
  > *We built **AR Physics Lab by HackHounds**: an AI-powered, browser-native WebXR virtual laboratory that runs at 60 FPS on budget ₹10,000 phones without app downloads, works offline, and turns any desk into an interactive physics workbench."*

---

### [0:30 - 1:15] Act 2: WebXR AR Placement & Interactive Physics
* **Visual:** Tap **"Enter AR"** (or 3D Orbit view on laptop). Reticle ring appears on the tabletop. Tap to place the laboratory workbench.
* **Action:**
  1. Show the 3D lab workbench with DC power supply, test resistor, knife switch, and analog meters.
  2. Explain: *"No heavy 50MB 3D model downloads. We wrote lightweight procedural geometry (<2MB total) so low-end phones load the lab in under 2 seconds."*
  3. Close the knife switch. Adjust the voltage slider from 1.5V to 6.0V. Notice the analog voltmeter and ammeter needles deflecting smoothly in real time.

---

### [1:15 - 1:50] Act 3: The Socratic AI Tutor in Action (The Differentiator)
* **Visual:** Deliberately trigger a common high-school mistake: click **"✕ Ammeter in Parallel"**.
* **Action:**
  1. The circuit immediately detects a short-circuit bypass. The resistor smokes and current shoots up!
  2. The **AI Socratic Tutor** drawer pulses, highlights the ammeter in bright cyan in the 3D scene, and speaks aloud:
     > *"Notice where your ammeter is connected. Should a current meter share the branch or be placed in line?"*
  3. Toggle **Hindi (हिन्दी)**:
     > *"ध्यान दें कि आपका एमीटर परिपथ में कहाँ जुड़ा है। क्या धारामापी को समानांतर जोड़ना चाहिए या श्रेणी में?"*
  4. Click **"2. Explain"** (Hint Level 2): Tutor explains internal impedance ($R_A \approx 0$).
  5. Click **"✓ Standard Series"** to fix the connection. Current normalizes.

---

### [1:50 - 2:20] Act 4: Data Logging & Instant PDF Lab Report
* **Visual:**
  1. Record 5 V-I readings across different voltages.
  2. Switch to **"V-I Graph"**: Point out the live canvas plotting the linear regression slope $R = \Delta V / \Delta I$.
  3. Click **"Generate Lab Report & PDF"**.
* **Outcome:**
  * Modal pops up with:
    * Official Aim, Apparatus, Procedure
    * Observation table & embedded high-res canvas graph image
    * Experimental resistance vs nominal with % error calculation
    * **5 Viva Voce examination questions** with collapsible answer reveals!
  * Tap **"Download PDF"** -> generates a clean academic PDF in 1 second.

---

### [2:20 - 2:45] Act 5: Experiment B — Simple Pendulum & Small-Angle Violation
* **Visual:** Switch tab to **"⏱️ Simple Pendulum"**.
* **Action:**
  1. Pull release angle to **35°**. The UI instantly alerts in red: *Angle > 15° violates small-angle approximation $\sin\theta \approx \theta$!*
  2. Adjust angle back to **10°** (green zone).
  3. Start the **Digital Stopwatch**. Watch the pendulum swing using real Runge-Kutta numerical integration.
  4. Record 10 oscillations: Calculated $g = 9.80 \text{ m/s}^2$ with $<0.5\%$ error!

---

### [2:45 - 3:00] Act 6: Teacher Analytics Dashboard & Closing
* **Visual:** Click **"Teacher"** button on top header.
* **Action:**
  1. Show Class **PHYS-101** dashboard pre-seeded with real student attempt analytics.
  2. Point out:
     * **Class Average:** 82%
     * **Live Mistake Frequency Bar Chart:** (Ammeter in parallel: 3, Angle > 15°: 3)
     * **Students Needing Help Alert Card:** Identifies Rohan Verma & Kabir Patel needing 1-on-1 remediation.
     * Click **"Export CSV"** to download student grade sheet.
* **Closing Line:**
  > *"AR Physics Lab replaces ₹20 lakh physical lab setups with the device already in the student's pocket. It democratizes hands-on science for every school, everywhere. Thank you!"*
