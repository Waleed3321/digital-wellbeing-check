const API_URL = 'http://127.0.0.1:8000/predict';

// ---- Slider live readouts ----

const sliders = [
  { id: 'avg_daily_usage_hours', out: 'out-usage' },
  { id: 'study_hours', out: 'out-study' },
  { id: 'physical_activity_hours', out: 'out-activity' },
  { id: 'sleep_hours_per_night', out: 'out-sleep' },
];

sliders.forEach(({ id, out }) => {
  const input = document.getElementById(id);
  const output = document.getElementById(out);
  const render = () => { output.textContent = `${parseFloat(input.value).toFixed(1)} h`; };
  input.addEventListener('input', render);
  render();
});

// ---- Gauge ----

const gaugeFill = document.getElementById('gauge-fill');
const gaugeNeedle = document.getElementById('gauge-needle');
const gaugeLength = gaugeFill.getTotalLength();
gaugeFill.style.strokeDasharray = `0 ${gaugeLength}`;

const SCALE_MAX = 10;

function bandFor(score) {
  if (score < 2) return 'Struggling';
  if (score < 4) return 'Under strain';
  if (score < 6) return 'Steady';
  if (score < 8) return 'Doing well';
  return 'Thriving';
}

function renderGauge(score) {
  const clamped = Math.max(0, Math.min(SCALE_MAX, score));
  const fraction = clamped / SCALE_MAX;
  gaugeFill.style.strokeDasharray = `${gaugeLength * fraction} ${gaugeLength}`;
  const angle = fraction * 180 - 90;
  gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}

// ---- Form submission ----

const form = document.getElementById('predict-form');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const scoreNumber = document.getElementById('score-number');
const scoreBand = document.getElementById('score-band');
const signals = document.getElementById('signals');

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
  submitBtn.textContent = 'Calculating…';
  scoreBand.textContent = 'Calculating…';

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

    scoreNumber.textContent = score.toFixed(2);
    scoreBand.textContent = bandFor(score);
    renderGauge(score);

    document.getElementById('sig-sleep').textContent = `${payload.sleep_hours_per_night.toFixed(1)} h`;
    document.getElementById('sig-stress').textContent = payload.stress_level;
    document.getElementById('sig-usage').textContent = `${payload.avg_daily_usage_hours.toFixed(1)} h`;
    signals.hidden = false;

  } catch (err) {
    scoreBand.textContent = 'Fill in the form and check your score to see the estimate.';
    if (err instanceof TypeError) {
      formError.textContent = `Couldn't reach the prediction server at 127.0.0.1:8000. Make sure the FastAPI server (main.py) is running.`;
    } else {
      formError.textContent = `The server rejected the request: ${err.message}`;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Check my score';
  }
});
