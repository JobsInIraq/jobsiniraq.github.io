---
layout: home
title: Recruiment Process
permalink: /process/
---

<style>
.timeline {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* vertical center line */
.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ccc;
  left: 50%;
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  width: 45%;
  display: flex;
  align-items: center;
}

/* LEFT SIDE: push text to right edge of left half */
.timeline-item.left {
  justify-content: flex-end; /* push content to the right side of left half */
  text-align: right; /* text aligned right, near the center line */
}

/* RIGHT SIDE: push text to left edge of right half */
.timeline-item.right {
  justify-content: flex-start; /* push content to the left side of right half */
  text-align: left;
}

/* soft underline under each point */
.timeline-item h2 {
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
  margin: 0;
}
</style>

<div class="timeline">
  <div class="timeline-item left">
    <h2>Workforce Planning</h2>
  </div>

  <div class="timeline-item right">
    <h2>Recruitment Strategy</h2>
  </div>

  <div class="timeline-item left">
    <h2>Job Posting &amp; Employer Branding</h2>
  </div>

  <div class="timeline-item right">
    <h2>Candidate Screening</h2>
  </div>

  <div class="timeline-item left">
    <h2>Assessment &amp; Testing</h2>
  </div>

  <div class="timeline-item right">
    <h2>Interviewing</h2>
  </div>

  <div class="timeline-item left">
    <h2>Reference &amp; Background Checks</h2>
  </div>

  <div class="timeline-item right">
    <h2>Job Offer &amp; Negotiation</h2>
  </div>

  <div class="timeline-item left">
    <h2>Onboarding</h2>
  </div>

  <div class="timeline-item right">
    <h2>Probation &amp; Performance Evaluation</h2>
  </div>

  <div class="timeline-item left">
    <h2>Continuous Development &amp; Retention</h2>
  </div>

  <div class="timeline-item right">
    <h2>Offboarding</h2>
  </div>
</div>


