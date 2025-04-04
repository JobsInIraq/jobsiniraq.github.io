const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Input dataset
const dataset = [
  { jobTitle: "Software Engineer", category: "IT", position: "Full-Time", salaryIQD: 1200000, salaryUSD: 800, city: "Baghdad" },
  { jobTitle: "Network Administrator", category: "IT", position: "Full-Time", salaryIQD: 1000000, salaryUSD: 680, city: "Erbil" },
  { jobTitle: "HR Manager", category: "Human Resources", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Basra" },
  { jobTitle: "Civil Engineer", category: "Engineering", position: "Full-Time", salaryIQD: 1200000, salaryUSD: 800, city: "Baghdad" },
  { jobTitle: "Project Manager", category: "Management", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Sulaymaniyah" },
  { jobTitle: "Accountant", category: "Finance", position: "Full-Time", salaryIQD: 900000, salaryUSD: 610, city: "Erbil" },
  { jobTitle: "Marketing Manager", category: "Marketing", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Basra" },
  { jobTitle: "Electrical Engineer", category: "Engineering", position: "Full-Time", salaryIQD: 1300000, salaryUSD: 880, city: "Kirkuk" },
  { jobTitle: "Sales Executive", category: "Sales", position: "Full-Time", salaryIQD: 700000, salaryUSD: 470, city: "Baghdad" },
  { jobTitle: "Business Analyst", category: "Business", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Baghdad" },
  { jobTitle: "Customer Support Representative", category: "Customer Service", position: "Full-Time", salaryIQD: 600000, salaryUSD: 410, city: "Erbil" },
  { jobTitle: "QA Tester", category: "IT", position: "Full-Time", salaryIQD: 1000000, salaryUSD: 680, city: "Sulaymaniyah" },
  { jobTitle: "Graphic Designer", category: "Design", position: "Full-Time", salaryIQD: 900000, salaryUSD: 610, city: "Baghdad" },
  { jobTitle: "Software Developer", category: "IT", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Erbil" },
  { jobTitle: "Database Administrator", category: "IT", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Baghdad" },
  { jobTitle: "Sales Manager", category: "Sales", position: "Full-Time", salaryIQD: 1700000, salaryUSD: 1150, city: "Basra" },
  { jobTitle: "Content Writer", category: "Marketing", position: "Full-Time", salaryIQD: 700000, salaryUSD: 470, city: "Erbil" },
  { jobTitle: "Event Manager", category: "Events", position: "Full-Time", salaryIQD: 1200000, salaryUSD: 800, city: "Baghdad" },
  { jobTitle: "Legal Advisor", category: "Legal", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Basra" },
  { jobTitle: "Construction Project Manager", category: "Engineering", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Kirkuk" },
  { jobTitle: "Procurement Manager", category: "Procurement", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Erbil" },
  { jobTitle: "Supply Chain Manager", category: "Logistics", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Baghdad" },
  { jobTitle: "Marketing Specialist", category: "Marketing", position: "Full-Time", salaryIQD: 1200000, salaryUSD: 800, city: "Basra" },
  { jobTitle: "Research Scientist", category: "Research", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Erbil" },
  { jobTitle: "Tax Consultant", category: "Finance", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Baghdad" },
  { jobTitle: "Graphic Designer", category: "Design", position: "Part-Time", salaryIQD: 400000, salaryUSD: 270, city: "Erbil" },
  { jobTitle: "Web Developer", category: "IT", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Baghdad" },
  { jobTitle: "Human Resources Assistant", category: "HR", position: "Full-Time", salaryIQD: 750000, salaryUSD: 510, city: "Kirkuk" },
  { jobTitle: "Digital Marketing Manager", category: "Marketing", position: "Full-Time", salaryIQD: 1700000, salaryUSD: 1150, city: "Sulaymaniyah" },
  { jobTitle: "Java Developer", category: "IT", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Baghdad" },
  { jobTitle: "Chief Executive Officer (CEO)", category: "Management", position: "Full-Time", salaryIQD: 5000000, salaryUSD: 3400, city: "Erbil" },
  { jobTitle: "Financial Analyst", category: "Finance", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Basra" },
  { jobTitle: "Health and Safety Officer", category: "Health & Safety", position: "Full-Time", salaryIQD: 1000000, salaryUSD: 680, city: "Erbil" },
  { jobTitle: "Network Engineer", category: "IT", position: "Full-Time", salaryIQD: 1700000, salaryUSD: 1150, city: "Baghdad" },
  { jobTitle: "Software Engineer", category: "IT", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Erbil" },
  { jobTitle: "HR Manager", category: "HR", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Basra" },
  { jobTitle: "Electrical Engineer", category: "Engineering", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Baghdad" },
  { jobTitle: "Civil Engineer", category: "Engineering", position: "Full-Time", salaryIQD: 1600000, salaryUSD: 1080, city: "Erbil" },
  { jobTitle: "Public Relations Manager", category: "Marketing", position: "Full-Time", salaryIQD: 2200000, salaryUSD: 1490, city: "Baghdad" },
  { jobTitle: "System Administrator", category: "IT", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Sulaymaniyah" },
  { jobTitle: "Mobile App Developer", category: "IT", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Baghdad" },
  { jobTitle: "Product Manager", category: "Management", position: "Full-Time", salaryIQD: 3000000, salaryUSD: 2030, city: "Erbil" },
  { jobTitle: "Marketing Manager", category: "Marketing", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Basra" },
  { jobTitle: "Operations Manager", category: "Operations", position: "Full-Time", salaryIQD: 2200000, salaryUSD: 1490, city: "Kirkuk" },
  { jobTitle: "Quality Assurance Manager", category: "IT", position: "Full-Time", salaryIQD: 2200000, salaryUSD: 1490, city: "Baghdad" },
  { jobTitle: "IT Support Technician", category: "IT", position: "Full-Time", salaryIQD: 1000000, salaryUSD: 680, city: "Erbil" },
  { jobTitle: "Finance Manager", category: "Finance", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Basra" },
  { jobTitle: "Legal Counsel", category: "Legal", position: "Full-Time", salaryIQD: 3000000, salaryUSD: 2030, city: "Baghdad" },
  { jobTitle: "Graphic Design Manager", category: "Design", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Erbil" },
  { jobTitle: "Operations Coordinator", category: "Operations", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Sulaymaniyah" },
  { jobTitle: "Data Analyst", category: "IT", position: "Full-Time", salaryIQD: 1700000, salaryUSD: 1150, city: "Baghdad" },
  { jobTitle: "Architect", category: "Architecture", position: "Full-Time", salaryIQD: 2000000, salaryUSD: 1350, city: "Erbil" },
  { jobTitle: "Marketing Director", category: "Marketing", position: "Full-Time", salaryIQD: 3500000, salaryUSD: 2370, city: "Basra" },
  { jobTitle: "Research and Development Manager", category: "Research", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Kirkuk" },
  { jobTitle: "Construction Supervisor", category: "Construction", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Baghdad" },
  { jobTitle: "Financial Controller", category: "Finance", position: "Full-Time", salaryIQD: 3000000, salaryUSD: 2030, city: "Erbil" },
  { jobTitle: "Social Media Manager", category: "Marketing", position: "Full-Time", salaryIQD: 1300000, salaryUSD: 880, city: "Sulaymaniyah" },
  { jobTitle: "Procurement Officer", category: "Procurement", position: "Full-Time", salaryIQD: 1700000, salaryUSD: 1150, city: "Baghdad" },
  { jobTitle: "IT Project Manager", category: "IT", position: "Full-Time", salaryIQD: 2200000, salaryUSD: 1490, city: "Erbil" },
  { jobTitle: "Data Scientist", category: "IT", position: "Full-Time", salaryIQD: 3000000, salaryUSD: 2030, city: "Basra" },
  { jobTitle: "Media Planner", category: "Marketing", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Kirkuk" },
  { jobTitle: "UX/UI Designer", category: "Design", position: "Full-Time", salaryIQD: 1600000, salaryUSD: 1080, city: "Erbil" },
  { jobTitle: "Front-End Developer", category: "IT", position: "Full-Time", salaryIQD: 1800000, salaryUSD: 1200, city: "Baghdad" },
  { jobTitle: "Financial Planner", category: "Finance", position: "Full-Time", salaryIQD: 2200000, salaryUSD: 1490, city: "Basra" },
  { jobTitle: "Customer Service Manager", category: "Customer Service", position: "Full-Time", salaryIQD: 1500000, salaryUSD: 1020, city: "Erbil" },
  { jobTitle: "Senior Software Developer", category: "IT", position: "Full-Time", salaryIQD: 2500000, salaryUSD: 1700, city: "Baghdad" },
  { jobTitle: "Business Development Manager", category: "Business", position: "Full-Time", salaryIQD: 2800000, salaryUSD: 1890, city: "Erbil" }
];

// Template for the job structure
const jobTemplate = {
  jobID: null,
  job: {
    jobDetails: {
      jobTitle: "",
      category: "",
      position: ""
    },
    tags: [],
    salary: {
      iqd: 0,
      usd: 0
    },
    isRemote: false,
    location: {
      country: "Iraq",
      city: ""
    },
    sources: {
      socialMedia: {
        linkedin: "",
        facebook: "",
        instagram: "",
        telegram: "",
        tiktok: ""
      },
      jobPortal: {
        site: "",
        link: ""
      },
      website: ""
    }
  }
};

// Generate jobs JSON
const jobs = dataset.map((data) => {
  const job = JSON.parse(JSON.stringify(jobTemplate)); // Deep copy of the template
  job.jobID = uuidv4(); // Generate a unique UUID
  job.job.jobDetails.jobTitle = data.jobTitle || "";
  job.job.jobDetails.category = data.category || "";
  job.job.jobDetails.position = data.position || "";
  job.job.salary.iqd = data.salaryIQD || 0;
  job.job.salary.usd = data.salaryUSD || 0;
  job.job.location.city = data.city || "";
  return job;
});

// Output JSON structure
const output = { jobs };

// Write to the existing JSON file
const outputPath = "c:\\Projects\\soc\\job\\_data\\db\\salaries0.json";
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`Jobs JSON updated successfully at ${outputPath}`);