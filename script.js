const API_URL = 'http://127.0.0.1:8000/predict';

// =============================================
// 3D FLOATING PARTICLES (Canvas background)
// =============================================
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.z = Math.random() * 1000;        // depth for 3D effect
      this.radius = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.vz = (Math.random() - 0.5) * 0.8;
      this.hue = Math.random() > 0.5 ? 200 : 260;   // cyan or purple
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;
      if (this.z < 1 || this.z > 1000) this.vz *= -1;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      const scale = 1000 / (1000 + this.z);
      const sx = (this.x - W / 2) * scale + W / 2;
      const sy = (this.y - H / 2) * scale + H / 2;
      const sr = this.radius * scale;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.alpha * scale})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Draw connections between close particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();

// =============================================
// MINI CHART DRAWING (2D animated line charts on stat cards)
// =============================================
function drawMiniChart(canvasId, data, color, gradColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W * 2;   // retina
  canvas.height = H * 2;
  ctx.scale(2, 2);

  const max = Math.max(...data) * 1.15;
  const step = W / (data.length - 1);

  // Gradient fill under line
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, gradColor);
  grad.addColorStop(1, 'transparent');

  // Build path
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = i * step;
    const y = H - (val / max) * (H - 8);
    if (i === 0) ctx.moveTo(x, y);
    else {
      // Smooth bezier
      const prevX = (i - 1) * step;
      const prevY = H - (data[i - 1] / max) * (H - 8);
      const cpx = (prevX + x) / 2;
      ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
    }
  });

  // Fill
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = i * step;
    const y = H - (val / max) * (H - 8);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevX = (i - 1) * step;
      const prevY = H - (data[i - 1] / max) * (H - 8);
      const cpx = (prevX + x) / 2;
      ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
    }
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Glow dot on last point
  const lastX = (data.length - 1) * step;
  const lastY = H - (data[data.length - 1] / max) * (H - 8);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
  ctx.fillStyle = gradColor;
  ctx.fill();
}

// Draw initial charts with sample data
function initCharts() {
  drawMiniChart('chart-stress', [4, 6, 5, 7, 6, 8, 7, 6],  '#fb923c', 'rgba(251,146,60,0.15)');
  drawMiniChart('chart-sleep',  [6, 7, 5, 8, 7, 7, 6, 7],  '#818cf8', 'rgba(129,140,248,0.15)');
  drawMiniChart('chart-usage',  [5, 4, 6, 5, 7, 4, 5, 5],  '#38bdf8', 'rgba(56,189,248,0.15)');
}

// Redraw on resize
window.addEventListener('resize', () => {
  clearTimeout(window._chartResize);
  window._chartResize = setTimeout(initCharts, 200);
});

// Draw once DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  setTimeout(initCharts, 100);
}

// =============================================
// 3D TILT ON STAT CARDS (mouse-follow)
// =============================================
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


// =============================================
// SLIDER LIVE READOUTS
// =============================================
const sliders = [
  { id: 'avg_daily_usage_hours', out: 'out-usage', stat: 'stat-usage-val', suffix: 'h' },
  { id: 'study_hours',           out: 'out-study',  stat: null },
  { id: 'physical_activity_hours', out: 'out-activity', stat: null },
  { id: 'sleep_hours_per_night', out: 'out-sleep',  stat: 'stat-sleep-val', suffix: 'h' },
];

sliders.forEach(({ id, out, stat, suffix }) => {
  const input = document.getElementById(id);
  const output = document.getElementById(out);
  const render = () => {
    const v = parseFloat(input.value).toFixed(1);
    output.textContent = `${v}h`;
    if (stat) {
      const el = document.getElementById(stat);
      if (el) el.textContent = `${v}${suffix || ''}`;
    }
  };
  input.addEventListener('input', render);
  render();
});

// Stress select → stat card
const stressSelect = document.getElementById('stress_level');
const stressStatLabel = document.getElementById('stat-stress-label');
const stressStatVal = document.getElementById('stat-stress-val');

function stressToPercent(level) {
  const map = { 'Low': '25%', 'Medium': '50%', 'High': '75%', 'Very High': '95%' };
  return map[level] || '—';
}

function updateStressStat() {
  const v = stressSelect.value;
  if (stressStatLabel) stressStatLabel.textContent = v;
  if (stressStatVal) stressStatVal.textContent = stressToPercent(v);
}
stressSelect.addEventListener('change', updateStressStat);
updateStressStat();

// =============================================
// CIRCULAR GAUGE
// =============================================
const gaugeArc = document.getElementById('gauge-arc');
const gaugeScoreText = document.getElementById('gauge-score-text');
const CIRCUMFERENCE = 2 * Math.PI * 82;  // r=82
gaugeArc.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;

const SCALE_MAX = 10;

function bandFor(score) {
  if (score < 2) return { label: 'Struggling — your wellbeing needs attention', cls: 'struggling' };
  if (score < 4) return { label: 'Under strain — several risk factors detected', cls: 'under-strain' };
  if (score < 6) return { label: 'Steady — room for improvement', cls: 'steady' };
  if (score < 8) return { label: 'Doing well — healthy digital habits', cls: 'doing-well' };
  return { label: 'Thriving — excellent balance!', cls: 'thriving' };
}

function renderGauge(score) {
  const clamped = Math.max(0, Math.min(SCALE_MAX, score));
  const fraction = clamped / SCALE_MAX;
  const arcLen = CIRCUMFERENCE * fraction;
  gaugeArc.style.strokeDasharray = `${arcLen} ${CIRCUMFERENCE}`;
}

// Animated counting
function animateCount(target, duration = 1000) {
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);  // ease-out cubic
    const current = target * eased;
    gaugeScoreText.textContent = current.toFixed(2);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// =============================================
// AI SUMMARY GENERATOR
// =============================================
function generateSummary(payload, score) {
  const parts = [];

  // Sleep analysis
  if (payload.sleep_hours_per_night >= 7) {
    parts.push(`Your sleep of ${payload.sleep_hours_per_night.toFixed(1)}h/night is in the healthy range.`);
  } else if (payload.sleep_hours_per_night >= 5) {
    parts.push(`You're getting ${payload.sleep_hours_per_night.toFixed(1)}h of sleep — try aiming for 7+ hours.`);
  } else {
    parts.push(`Only ${payload.sleep_hours_per_night.toFixed(1)}h of sleep is a significant concern.`);
  }

  // Screen time
  if (payload.avg_daily_usage_hours > 6) {
    parts.push(`${payload.avg_daily_usage_hours.toFixed(1)}h of daily screen time is above recommended levels.`);
  } else if (payload.avg_daily_usage_hours <= 3) {
    parts.push(`Your screen time of ${payload.avg_daily_usage_hours.toFixed(1)}h/day shows good digital discipline.`);
  }

  // Stress
  if (payload.stress_level === 'Very High' || payload.stress_level === 'High') {
    parts.push(`Your ${payload.stress_level.toLowerCase()} stress level is a key area to address.`);
  } else {
    parts.push(`Your stress level is manageable — keep it up.`);
  }

  // Activity
  if (payload.physical_activity_hours >= 1) {
    parts.push(`Regular physical activity is a positive factor in your score.`);
  }

  return parts.join(' ');
}

// =============================================
// FORM SUBMISSION
// =============================================
const form = document.getElementById('predict-form');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const scoreBand = document.getElementById('score-band');
const signals = document.getElementById('signals');
const resultPanel = document.getElementById('result-panel');
const aiSummary = document.getElementById('ai-summary');
const aiText = document.getElementById('ai-text');

function buildPayload() {
  const val = (id) => document.getElementById(id).value;
  return {
    age: parseInt(val('age'), 10),
    gender: val('gender'),
    country: val('country').trim(),
    academic_level: val('academic_level'),
    most_used_platform: val('most_used_platform'),
    purpose_of_use: val('purpose_of_use'),
    avg_daily_usage_hours: parseFloat(val('avg_daily_usage_hours')),
    daily_unlocks: parseInt(val('daily_unlocks'), 10),
    study_hours: parseFloat(val('study_hours')),
    physical_activity_hours: parseFloat(val('physical_activity_hours')),
    sleep_hours_per_night: parseFloat(val('sleep_hours_per_night')),
    stress_level: val('stress_level'),
  };
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';

  if (!form.reportValidity()) return;

  const payload = buildPayload();
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Analysing…';
  submitBtn.classList.add('loading');
  scoreBand.textContent = 'Calculating your score…';
  scoreBand.className = 'score-band';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const detail = body && body.detail ? JSON.stringify(body.detail) : `HTTP ${response.status}`;
      throw new Error(detail);
    }

    const data = await response.json();
    const score = data.predicted_mental_health_score;
    const band = bandFor(score);

    // Animate gauge + counter
    animateCount(score);
    renderGauge(score);

    // Band label
    scoreBand.textContent = band.label;
    scoreBand.className = `score-band ${band.cls}`;

    // Result card animation
    resultPanel.classList.remove('scored');
    void resultPanel.offsetWidth;
    resultPanel.classList.add('scored');

    // AI Summary
    aiText.textContent = generateSummary(payload, score);
    aiSummary.hidden = false;
    aiSummary.classList.remove('show');
    void aiSummary.offsetWidth;
    aiSummary.classList.add('show');

    // Signal pills
    document.getElementById('sig-sleep').textContent = `${payload.sleep_hours_per_night.toFixed(1)} h`;
    document.getElementById('sig-stress').textContent = payload.stress_level;
    document.getElementById('sig-usage').textContent = `${payload.avg_daily_usage_hours.toFixed(1)} h`;
    signals.hidden = false;
    signals.classList.remove('revealed');
    void signals.offsetWidth;
    signals.classList.add('revealed');

    // Update stat cards with results
    document.getElementById('stat-sleep-val').textContent = `${payload.sleep_hours_per_night.toFixed(1)}h`;
    document.getElementById('stat-usage-val').textContent = `${payload.avg_daily_usage_hours.toFixed(1)}h`;
    updateStressStat();

    // Redraw charts with slight variation to simulate "update"
    const base = score / SCALE_MAX;
    drawMiniChart('chart-stress', randomChartData(8, payload.stress_level === 'Very High' ? 9 : payload.stress_level === 'High' ? 7 : 5), '#fb923c', 'rgba(251,146,60,0.15)');
    drawMiniChart('chart-sleep',  randomChartData(8, payload.sleep_hours_per_night), '#818cf8', 'rgba(129,140,248,0.15)');
    drawMiniChart('chart-usage',  randomChartData(8, payload.avg_daily_usage_hours), '#38bdf8', 'rgba(56,189,248,0.15)');

  } catch (err) {
    scoreBand.textContent = 'Fill in the form to see your estimated wellbeing score.';
    scoreBand.className = 'score-band';
    if (err instanceof TypeError) {
      formError.textContent = `Couldn't reach the server at 127.0.0.1:8000. Make sure main.py is running.`;
    } else {
      formError.textContent = `Server error: ${err.message}`;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Analyse My Wellbeing';
    submitBtn.classList.remove('loading');
  }
});

// Generate random chart data centred around a value
function randomChartData(points, center) {
  const data = [];
  for (let i = 0; i < points; i++) {
    data.push(Math.max(0, center + (Math.random() - 0.5) * center * 0.5));
  }
  return data;
}
