---
layout: home
title: Payscale Information in Iraq
permalink: /payscale/
searchable: true  
---



<p>Below is the list of average salaries in Iraq:</p>
<table>
  <thead>
    <tr>
      <th>Job Title</th>
      <th>Category</th>
      <th>Position</th>
      <th>Salary (IQD)</th>
       <th>Salary (USD)</th>
      <th>Location</th>
      <th>Last Updated</th>
    </tr>
  </thead>
  <tbody>
    {% assign salaries = site.data.db.salaries.jobs | sort: "job.jobDetails.category" %}  <!-- Load the job data from the salaries.json -->

    {% for job in salaries %}
      <tr>
        <td>{{ job.job.jobDetails.jobTitle }}</td>  <!-- Job Title -->
        <td>{{ job.job.jobDetails.category }}</td>  <!-- Job Category -->
        <td>{{ job.job.jobDetails.position }}</td>  <!-- Job Position -->
        <td class="salary" data-salary="{{ job.job.salary.iqd }}">{{ job.job.salary.iqd }}</td>  <!-- Salary in IQD -->
        <td class="salary" data-salary="{{ job.job.salary.usd }}">{{ job.job.salary.usd }}</td>  <!-- Salary in USD -->
        <td>{{ job.job.location.city }}</td>  <!-- Job Location -->
        <td>{{ job.updated_at }}</td> <!-- timestamps -->
      </tr>
    {% endfor %}
  </tbody>
</table>


<!-- Include the JavaScript file -->

<script src="{{ '/assets/js/scripts.js' | relative_url }}"></script>




