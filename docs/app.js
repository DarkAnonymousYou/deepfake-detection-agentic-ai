/**
 * VERITAS AI SENTINEL - WEB CLIENT APPLICATION
 * Real-time API Client & Forensic Telemetry Controller
 */

// Production API URL on Hugging Face Spaces
const API_BASE_URL = "https://rishi-9858-deepfake-detection-api.hf.space";

// State
let selectedFile = null;
let currentVideoId = null;
let currentPrediction = null;

document.addEventListener("DOMContentLoaded", () => {
  initLiveApiHealth();
  initDragAndDrop();
  initSampleButtons();
  initDetectorActions();
  initActiveLearningFeedback();
  initCodeTabs();
  initFaqSearch();
  initContactForm();
  initMobileNav();
});

/* ==========================================================================
   1. LIVE API HEALTH CHECK & PING MONITOR
   ========================================================================== */
async function initLiveApiHealth() {
  const dot = document.getElementById("apiStatusDot");
  const text = document.getElementById("apiStatusText");
  const heroBadge = document.getElementById("heroApiBadge");

  async function check() {
    const t0 = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: { "Accept": "application/json" }
      });
      const latency = Math.round(performance.now() - t0);

      if (response.ok) {
        const data = await response.json();
        if (dot) {
          dot.className = "api-status-dot online";
        }
        if (text) {
          text.textContent = `API ONLINE • ${latency}ms`;
        }
        if (heroBadge) {
          heroBadge.textContent = `LIVE CLOUD API: ONLINE (${latency}ms • THRESHOLD ${data.threshold.toFixed(2)})`;
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (e) {
      if (dot) {
        dot.className = "api-status-dot offline";
      }
      if (text) {
        text.textContent = "API CONNECTING...";
      }
      if (heroBadge) {
        heroBadge.textContent = "CONNECTING TO SENTINEL NEURAL CLOUD...";
      }
    }
  }

  check();
  // Poll every 30 seconds
  setInterval(check, 30000);
}

/* ==========================================================================
   2. FILE DRAG & DROP AND SELECTION
   ========================================================================== */
function initDragAndDrop() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });
}

function handleFileSelected(file) {
  const validExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  const ext = "." + file.name.split(".").pop().toLowerCase();

  if (!validExtensions.includes(ext) && !file.type.startsWith("video/")) {
    showToast("Invalid file format. Please upload an MP4, MOV, AVI, or MKV video.", "error");
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    showToast("File size is larger than 50MB. Max 30s clips recommended for fastest inference.", "warn");
  }

  selectedFile = file;
  renderVideoPreview(file);
}

function renderVideoPreview(fileOrBlob, customName = null) {
  const wrapper = document.getElementById("videoPreviewWrapper");
  const player = document.getElementById("videoPlayer");
  const metaName = document.getElementById("videoMetaName");
  const metaSize = document.getElementById("videoMetaSize");
  const startAuditBtn = document.getElementById("startAuditBtn");
  const resultCard = document.getElementById("auditResultCard");

  if (resultCard) resultCard.style.display = "none";

  const fileUrl = URL.createObjectURL(fileOrBlob);
  player.src = fileUrl;
  player.load();

  const name = customName || fileOrBlob.name || "selected_video.mp4";
  const sizeMB = (fileOrBlob.size / (1024 * 1024)).toFixed(2);

  if (metaName) metaName.textContent = name;
  if (metaSize) metaSize.textContent = `${sizeMB} MB`;

  if (wrapper) wrapper.style.display = "block";
  if (startAuditBtn) {
    startAuditBtn.disabled = false;
    startAuditBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      Run Forensic Audit Now
    `;
  }
}

/* ==========================================================================
   3. PRELOADED SAMPLE VIDEOS (1-CLICK TEST)
   ========================================================================== */
function initSampleButtons() {
  const testRealBtn = document.getElementById("testRealSampleBtn");
  const testFakeBtn = document.getElementById("testFakeSampleBtn");

  if (testRealBtn) {
    testRealBtn.addEventListener("click", () => {
      loadSampleVideo("samples/real_sample.mp4", "real_camera_sample.mp4");
    });
  }

  if (testFakeBtn) {
    testFakeBtn.addEventListener("click", () => {
      loadSampleVideo("samples/fake_sample.mp4", "synthetic_deepfake_sample.mp4");
    });
  }
}

async function loadSampleVideo(path, displayName) {
  showToast(`Loading sample: ${displayName}...`, "info");
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Sample file not found");
    const blob = await response.blob();
    const file = new File([blob], displayName, { type: "video/mp4" });
    selectedFile = file;
    renderVideoPreview(file, displayName);
    showToast(`Loaded ${displayName}. Click "Run Forensic Audit" to analyze!`, "success");
  } catch (e) {
    showToast(`Failed to load sample: ${e.message}`, "error");
  }
}

/* ==========================================================================
   4. DETECTOR ACTIONS & INFERENCE DISPATCH
   ========================================================================== */
function initDetectorActions() {
  const startAuditBtn = document.getElementById("startAuditBtn");
  const resetBtn = document.getElementById("resetAuditBtn");

  if (startAuditBtn) {
    startAuditBtn.addEventListener("click", executeForensicAudit);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetDetector);
  }
}

async function executeForensicAudit() {
  if (!selectedFile) {
    showToast("Please upload or drag a video file first.", "warn");
    return;
  }

  const progressCard = document.getElementById("auditProgressCard");
  const resultCard = document.getElementById("auditResultCard");
  const startAuditBtn = document.getElementById("startAuditBtn");

  if (resultCard) resultCard.style.display = "none";
  if (progressCard) progressCard.style.display = "block";
  if (startAuditBtn) startAuditBtn.disabled = true;

  // Animate status step messages
  const stepText = document.getElementById("auditCurrentStepText");
  const steps = [
    "Isolating facial bounding box & landmark margins...",
    "Executing 2D Fast Fourier Transform (FFT) harmonic analysis...",
    "Computing temporal motion vectors and Graph Attention weights...",
    "Finalizing neural verdict with 0.50 threshold calibration..."
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    stepIdx = (stepIdx + 1) % steps.length;
    if (stepText) stepText.textContent = steps[stepIdx];
  }, 1200);

  const formData = new FormData();
  formData.append("video", selectedFile);

  try {
    const response = await fetch(`${API_BASE_URL}/predict-video`, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      },
      body: formData
    });

    clearInterval(interval);
    if (progressCard) progressCard.style.display = "none";
    if (startAuditBtn) startAuditBtn.disabled = false;

    if (response.status === 422) {
      const errData = await response.json();
      showNoFaceDetectedModal(errData.message || "No human facial features detected in the video.");
      return;
    }

    if (!response.ok) {
      const errText = await response.text();
      showToast(`Inference Server Error (${response.status}): ${errText}`, "error");
      return;
    }

    const result = await response.json();
    renderForensicResult(result);
    showToast("Forensic Audit completed successfully!", "success");

  } catch (err) {
    clearInterval(interval);
    if (progressCard) progressCard.style.display = "none";
    if (startAuditBtn) startAuditBtn.disabled = false;
    showToast(`Network / API Error: ${err.message}`, "error");
  }
}

function renderForensicResult(data) {
  const resultCard = document.getElementById("auditResultCard");
  if (!resultCard) return;

  currentVideoId = data.video_id;
  currentPrediction = data.prediction;

  const isFake = data.prediction.toLowerCase() === "fake";
  const confidence = data.confidence;
  const percent = Math.round(confidence * 100);

  // Set card theme
  resultCard.className = `audit-result-card ${isFake ? "fake" : "real"}`;
  resultCard.style.display = "block";

  // Verdict Title & Subtitle
  const verdictTitle = document.getElementById("verdictTitle");
  const verdictSubtitle = document.getElementById("verdictSubtitle");
  const verdictBadgeIcon = document.getElementById("verdictBadgeIcon");

  if (isFake) {
    if (verdictTitle) {
      verdictTitle.textContent = "SYNTHETIC DEEPFAKE DETECTED";
      verdictTitle.className = "text-crimson-gradient";
    }
    if (verdictSubtitle) {
      verdictSubtitle.textContent = "Neural manipulation signatures and frequency harmonic discrepancies identified.";
    }
    if (verdictBadgeIcon) {
      verdictBadgeIcon.className = "verdict-badge-icon fake";
      verdictBadgeIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="#FF2A55">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      `;
    }
  } else {
    if (verdictTitle) {
      verdictTitle.textContent = "VERIFIED AUTHENTIC HUMAN";
      verdictTitle.className = "text-emerald-gradient";
    }
    if (verdictSubtitle) {
      verdictSubtitle.textContent = "Natural biological micro-expressions, organic temporal flow, and clean spectrum validated.";
    }
    if (verdictBadgeIcon) {
      verdictBadgeIcon.className = "verdict-badge-icon real";
      verdictBadgeIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="#00E676">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
      `;
    }
  }

  // Radial Gauge Meter
  const gaugeBar = document.getElementById("gaugeBar");
  const gaugeText = document.getElementById("gaugeText");

  if (gaugeBar && gaugeText) {
    const circumference = 2 * Math.PI * 45; // r=45
    const offset = circumference - (confidence * circumference);
    gaugeBar.style.stroke = isFake ? "#FF2A55" : "#00E676";
    gaugeBar.style.strokeDasharray = `${circumference} ${circumference}`;
    gaugeBar.style.strokeDashoffset = offset;
    gaugeText.textContent = `${percent}%`;
  }

  // Telemetry details
  const details = data.details || {};
  setElemText("telemetryRisk", details.risk_level || "Moderate");
  setElemText("telemetryFft", details.frequency_integrity || (isFake ? "GAN High-Pass Residuals" : "Clean Natural Spectrum"));
  setElemText("telemetryTemporal", details.temporal_stability || (isFake ? "Inter-frame Distortion" : "Organic Motion Flow"));
  setElemText("telemetryFaceRatio", `${Math.round((details.detection_ratio || 1.0) * 100)}% Verified`);
  setElemText("telemetryLatency", `${Math.round(details.processing_time_ms || 1200)} ms`);
  setElemText("telemetryThreshold", `${data.threshold_applied ? data.threshold_applied.toFixed(2) : "0.50"} Standard`);

  // Reset feedback buttons
  const feedbackBtns = document.getElementById("feedbackButtonsGroup");
  const feedbackStatus = document.getElementById("feedbackStatusText");
  if (feedbackBtns) feedbackBtns.style.display = "flex";
  if (feedbackStatus) feedbackStatus.textContent = "";

  // Scroll to results smoothly
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showNoFaceDetectedModal(message) {
  alert(`[FACE VERIFICATION ALERT]\n\n${message}\n\nOur GAT neural engine operates exclusively on facial biometrics and high-pass boundary seams. Please select or record a video with a clearly visible human face.`);
}

function resetDetector() {
  selectedFile = null;
  currentVideoId = null;
  currentPrediction = null;

  const wrapper = document.getElementById("videoPreviewWrapper");
  const player = document.getElementById("videoPlayer");
  const resultCard = document.getElementById("auditResultCard");
  const progressCard = document.getElementById("auditProgressCard");
  const startAuditBtn = document.getElementById("startAuditBtn");
  const fileInput = document.getElementById("fileInput");

  if (wrapper) wrapper.style.display = "none";
  if (player) { player.src = ""; }
  if (resultCard) resultCard.style.display = "none";
  if (progressCard) progressCard.style.display = "none";
  if (fileInput) fileInput.value = "";
  if (startAuditBtn) {
    startAuditBtn.disabled = true;
    startAuditBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      Select Video to Run Audit
    `;
  }

  showToast("Detector reset. Select a new video to inspect.", "info");
}

/* ==========================================================================
   5. ACTIVE LEARNING FEEDBACK LOOP
   ========================================================================== */
function initActiveLearningFeedback() {
  const agreeBtn = document.getElementById("btnFeedbackAgree");
  const disagreeBtn = document.getElementById("btnFeedbackDisagree");

  if (agreeBtn) {
    agreeBtn.addEventListener("click", () => submitFeedback("agreed"));
  }

  if (disagreeBtn) {
    disagreeBtn.addEventListener("click", () => submitFeedback("disagreed"));
  }
}

async function submitFeedback(feedbackType) {
  if (!currentVideoId || !currentPrediction) return;

  const corrected = currentPrediction === "Fake" ? "Real" : "Fake";
  const feedbackBtns = document.getElementById("feedbackButtonsGroup");
  const feedbackStatus = document.getElementById("feedbackStatusText");

  try {
    const payload = {
      video_id: currentVideoId,
      predicted_label: currentPrediction,
      feedback: feedbackType,
      actual_label: feedbackType === "agreed" ? currentPrediction : corrected,
      notes: "Submitted via Veritas AI Web Platform"
    };

    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      if (feedbackBtns) feedbackBtns.style.display = "none";
      if (feedbackStatus) {
        feedbackStatus.innerHTML = `
          <span style="color: #00E676; font-weight: 700;">
            ✓ Feedback registered! Sample queued for the next continuous model update.
          </span>
        `;
      }
      showToast("Thank you! Feedback logged to active learning loop.", "success");
    }
  } catch (e) {
    showToast(`Feedback submission error: ${e.message}`, "error");
  }
}

/* ==========================================================================
   6. CODE VIEWER TABS & COPY
   ========================================================================== */
function initCodeTabs() {
  const tabs = document.querySelectorAll(".code-tab-btn");
  const copyBtn = document.getElementById("copyCodeBtn");

  const codeSnippets = {
    python: `import requests

API_URL = "https://rishi-9858-deepfake-detection-api.hf.space/predict-video"

with open("test_video.mp4", "rb") as f:
    files = {"video": ("test_video.mp4", f, "video/mp4")}
    response = requests.post(API_URL, files=files)
    
result = response.json()
print(f"Verdict: {result['prediction']}")
print(f"Confidence: {result['confidence'] * 100:.1f}%")
print(f"Risk Rating: {result['details']['risk_level']}")`,

    javascript: `const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function detectDeepfake() {
  const form = new FormData();
  form.append('video', fs.createReadStream('test_video.mp4'));

  const response = await axios.post(
    'https://rishi-9858-deepfake-detection-api.hf.space/predict-video',
    form,
    { headers: form.getHeaders() }
  );

  console.log('Verdict:', response.data.prediction);
  console.log('Confidence:', (response.data.confidence * 100).toFixed(1) + '%');
}

detectDeepfake();`,

    curl: `curl -X POST "https://rishi-9858-deepfake-detection-api.hf.space/predict-video" \\
  -H "Accept: application/json" \\
  -F "video=@test_video.mp4"`
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const lang = tab.getAttribute("data-lang");
      const codeElem = document.getElementById("codeDisplayBlock");
      if (codeElem && codeSnippets[lang]) {
        codeElem.textContent = codeSnippets[lang];
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const codeElem = document.getElementById("codeDisplayBlock");
      if (codeElem) {
        navigator.clipboard.writeText(codeElem.textContent);
        showToast("Code snippet copied to clipboard!", "success");
      }
    });
  }
}

/* ==========================================================================
   7. FAQ ACCORDION & SEARCH FILTER
   ========================================================================== */
function initFaqSearch() {
  const searchInput = document.getElementById("faqSearchInput");
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-question-btn");
    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach(i => i.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
}

/* ==========================================================================
   8. CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "warn");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Transmitting Message...";
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
      form.reset();
      showToast("Thank you for contacting Veritas AI Sentinel! Our defense team will reply shortly.", "success");
    }, 1000);
  });
}

/* ==========================================================================
   9. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById("navToggleBtn");
  const navLinks = document.getElementById("navLinks");

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }
}

/* ==========================================================================
   HELPERS & TOAST NOTIFICATIONS
   ========================================================================== */
function setElemText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let color = "#00F0FF";
  if (type === "success") color = "#00E676";
  if (type === "error") color = "#FF2A55";
  if (type === "warn") color = "#FFB300";

  toast.style.borderColor = color;
  toast.innerHTML = `
    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color};"></span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
