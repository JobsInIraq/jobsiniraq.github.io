// Format salary numbers with commas
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.salary').forEach(function(element) {
      var salary = element.getAttribute('data-salary');
      var formattedSalary = new Intl.NumberFormat().format(salary);
      element.innerHTML = formattedSalary; // Update the salary value in the table
    });
  });