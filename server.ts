import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Initialize server-side Gemini client using modern @google/genai SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // ----------------------------------------------------
  // 1. Gemini 3.6 Threat Analysis & Shield Optimizer
  // ----------------------------------------------------
  app.post("/api/gemini/threat-analysis", async (req, res) => {
    try {
      const { rfEnvironment, detectedDevices, noiseLevel, currentShieldPower } = req.body;
      const prompt = `You are the BlurBubble AI Tactical Defense Core powered by Gemini 3.6. Analyze this privacy threat telemetry:
- RF Environment: ${JSON.stringify(rfEnvironment || {})}
- Detected Smart Cameras / Scanners: ${JSON.stringify(detectedDevices || [])}
- Ambient RF Noise: ${noiseLevel || 45} dBm
- Current Shield Power: ${currentShieldPower || 80}%

Evaluate threat vectors and output JSON with:
1. threatLevel ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
2. vulnerabilityScore (number 0 to 100)
3. recommendedShieldPower (number 0 to 100)
4. recommendedPrivacyLevel ('strict_blur' | 'pixelate' | 'emoji' | 'magic_removal' | 'black_bar')
5. recommendedRangeMeters (number 5 to 50)
6. tacticalSummary (a concise 2-sentence tactical summary)
7. keyThreats (array of strings detailing detected threats)
8. suggestedCountermeasures (array of strings with recommended defense steps)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatLevel: { type: Type.STRING },
              vulnerabilityScore: { type: Type.NUMBER },
              recommendedShieldPower: { type: Type.NUMBER },
              recommendedPrivacyLevel: { type: Type.STRING },
              recommendedRangeMeters: { type: Type.NUMBER },
              tacticalSummary: { type: Type.STRING },
              keyThreats: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedCountermeasures: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["threatLevel", "vulnerabilityScore", "recommendedShieldPower", "recommendedPrivacyLevel", "recommendedRangeMeters", "tacticalSummary", "keyThreats", "suggestedCountermeasures"]
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Threat Analysis API error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze threats" });
    }
  });

  // ----------------------------------------------------
  // 2. Gemini 3.6 Vision AI Optical Frame Analysis
  // ----------------------------------------------------
  app.post("/api/gemini/analyze-frame", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing image base64 data" });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      };
      const textPart = {
        text: `Analyze this optical frame captured by BlurBubble Smart Glasses.
Detect all potential privacy violations (exposed human faces, license plates, smart recording badges, security cameras, visible ID cards, computer screens).
Provide a structured JSON output with:
1. privacyViolationsFound (boolean)
2. detectedSubjectsCount (number)
3. riskDescription (short text summary of optical risks)
4. blurRegions (array of objects with: label, confidence, riskLevel ('LOW'|'MEDIUM'|'HIGH'), suggestedFilter ('pixelate'|'strict_blur'|'magic_removal'|'black_bar'))
5. opticalDefenseAdvice (tactical advice for lens filters)`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              privacyViolationsFound: { type: Type.BOOLEAN },
              detectedSubjectsCount: { type: Type.NUMBER },
              riskDescription: { type: Type.STRING },
              blurRegions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    riskLevel: { type: Type.STRING },
                    suggestedFilter: { type: Type.STRING }
                  },
                  required: ["label", "confidence", "riskLevel", "suggestedFilter"]
                }
              },
              opticalDefenseAdvice: { type: Type.STRING }
            },
            required: ["privacyViolationsFound", "detectedSubjectsCount", "riskDescription", "blurRegions", "opticalDefenseAdvice"]
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Frame Analysis API error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze optical frame" });
    }
  });

  // ----------------------------------------------------
  // 3. Gemini 3.6 Acoustic Crawler & Voice Classifier
  // ----------------------------------------------------
  app.post("/api/gemini/analyze-audio", async (req, res) => {
    try {
      const { decibelLevel, frequencyPeaks, sampleContext, platformTarget } = req.body;
      const prompt = `You are BlurBubble Acoustic Defense AI powered by Gemini 3.6. Analyze the following telemetry:
- Ambient Audio Level: ${decibelLevel || 55} dB
- Frequency Peaks (Hz): ${JSON.stringify(frequencyPeaks || [1200, 2400, 4800, 18500])}
- Target Indexing Platform: ${platformTarget || "Public Streaming / Audio DB"}
- Context: ${sampleContext || "Wearable microphone ambient probe"}

Return JSON with:
1. voiceFingerprintDetected (boolean)
2. biometricCaptureRisk ('NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
3. suspectedDeviceType (string like "Parabolic Mic", "Platform Audio Harvester", "Smart Assistant", "Ultrasonic Tracking Beacon")
4. acousticCountermeasure (string describing phase-inversion or acoustic white-noise modulation)
5. auditNotes (string explanation)
6. rfc9402ComplianceStatus ('COMPLIANT' | 'OPT_OUT_IGNORED' | 'VIOLATION_DETECTED')`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              voiceFingerprintDetected: { type: Type.BOOLEAN },
              biometricCaptureRisk: { type: Type.STRING },
              suspectedDeviceType: { type: Type.STRING },
              acousticCountermeasure: { type: Type.STRING },
              auditNotes: { type: Type.STRING },
              rfc9402ComplianceStatus: { type: Type.STRING }
            },
            required: ["voiceFingerprintDetected", "biometricCaptureRisk", "suspectedDeviceType", "acousticCountermeasure", "auditNotes", "rfc9402ComplianceStatus"]
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Audio Analysis API error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze acoustic telemetry" });
    }
  });

  // ----------------------------------------------------
  // 4. Gemini 3.6 Legal Opt-Out & Cease-and-Desist Generator
  // ----------------------------------------------------
  app.post("/api/gemini/compliance-generator", async (req, res) => {
    try {
      const { offenderName, violationType, beaconId, jurisdiction, timestamp } = req.body;
      const prompt = `You are BlurBubble Privacy Legal AI Counsel. Draft a formal Legal Cease-and-Desist Notice & Opt-Out demand letter under RFC-9402, CCPA, BIPA, GDPR, and EU AI Act for:
- Offending System/Entity: ${offenderName || "Unconsented Smart Camera System"}
- Violation Type: ${violationType || "Unauthorized Biometric Facial Scan"}
- Broadcast Beacon Hash: ${beaconId || "BLURBUBBLE-RFC9402-BEACON-ALPHA"}
- Jurisdiction: ${jurisdiction || "USA California CCPA / EU GDPR"}
- Incident Timestamp: ${timestamp || new Date().toISOString()}

Return structured JSON with:
1. letterTitle (string)
2. noticeHeader (string)
3. legalBodyText (formal 3-paragraph legal demand letter)
4. citedRegulations (array of string legal citations)
5. mandatoryRemedies (array of strings of required compliance actions)
6. complianceHash (a cryptographic-styled verification string)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              letterTitle: { type: Type.STRING },
              noticeHeader: { type: Type.STRING },
              legalBodyText: { type: Type.STRING },
              citedRegulations: { type: Type.ARRAY, items: { type: Type.STRING } },
              mandatoryRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
              complianceHash: { type: Type.STRING }
            },
            required: ["letterTitle", "noticeHeader", "legalBodyText", "citedRegulations", "mandatoryRemedies", "complianceHash"]
          }
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Compliance Generator API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate compliance notice" });
    }
  });

  // ----------------------------------------------------
  // 5. Gemini 3.6 AI Tactical Privacy Copilot Chat
  // ----------------------------------------------------
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const { message, systemContext } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: message,
        config: {
          systemInstruction: `You are BlurBubble's AI Tactical Privacy Copilot powered by Gemini 3.6. You are an expert in RFC-9402 privacy broadcast protocols, RF shielding, optical face obfuscation, acoustic anti-recording countermeasures, and digital sovereignty.
Current system state: ${JSON.stringify(systemContext || {})}
Provide concise, authoritative, tactical responses with bullet points, threat mitigations, and exact shield commands.`
        }
      });

      res.json({ reply: response.text || "No response received from Gemini 3.6." });
    } catch (error: any) {
      console.error("Tactical Copilot API error:", error);
      res.status(500).json({ error: error.message || "Failed to query Tactical Copilot" });
    }
  });

  // Vite Middleware handling for dev and prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BlurBubble full-stack server active on port ${PORT}`);
  });
}

startServer();
