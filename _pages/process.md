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

/* vertical line in the middle */
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
  width: 45%; /* slightly less than half to avoid crossing line */
  display: flex;
  align-items: center;
}

.timeline-item.left {
  margin-right: auto;
  text-align: left;
}

.timeline-item.right {
  margin-left: auto;
  text-align: right;
}

/* underline connecting to the center line */
.timeline-item.left h2 {
  position: relative;
  margin: 0;
  padding-bottom: 4px;
}

.timeline-item.left h2::after {
  content: '';
  position: absolute;
  left: 100%; /* start after text */
  top: 50%;
  height: 1px;
  width: calc(50% - 2rem); /* extend to near center line */
  background: #ccc;
}

.timeline-item.right h2 {
  position: relative;
  margin: 0;
  padding-bottom: 4px;
}

.timeline-item.right h2::after {
  content: '';
  position: absolute;
  right: 100%; /* start before text */
  top: 50%;
  height: 1px;
  width: calc(50% - 2rem); /* extend to near center line */
  background: #ccc;
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





