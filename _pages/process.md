---
layout: home
title: Recruiment Process
permalink: /process/

steps:
  - Workforce Planning
  - Workforce Planning
  - Recruitment Strategy
  - Job Posting & Employer Branding
  - Candidate Screening
  - Assessment & Testing
  - Interviewing
  - Reference & Background Checks
  - Job Offer & Negotiation
  - Onboarding
  - Probation & Performance Evaluation
  - Continuous Development & Retention
  - Offboarding
---

# Hiring Process

{% for step in page.steps %}
  <div style="text-align: {% if forloop.index0 modulo 2 == 0 %}right{% else %}left{% endif %};">
    <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 4px;">{{ step }}</h2>
  </div>
{% endfor %}




