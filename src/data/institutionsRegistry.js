/**
 * Samadhan Setu - Institution Capability Registry
 *
 * Single source of truth for all institution/partner capability data.
 * The matching engine (src/services/matching.js) imports INSTITUTIONS_REGISTRY from here.
 *
 * NOTE: Demo/prototype institutions for the SIH26043 hackathon build.
 */

export const INSTITUTIONS_REGISTRY = [
  // ── Universities ─────────────────────────────────────────────────────────
  {
    id: 'u-env-dhanbad',
    name: 'IIT (ISM) Dhanbad',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Environmental Science & Engineering',
    primaryDomains: ['Water & Environment', 'Mining & Resources'],
    secondaryDomains: ['Agriculture & Irrigation', 'Public Health & Sanitation'],
    expertise: [
      'Environmental Engineering',
      'Water Treatment',
      'Industrial Wastewater Engineering',
      'Environmental Hydrogeology',
      'Mining Pollution Control',
      'Acid Mine Drainage Treatment',
      'Groundwater Quality Assessment',
      'Aquifer Analysis',
    ],
    facilities: [
      'Industrial Wastewater Treatment Laboratory',
      'Trace Metal & Heavy Metal Analysis Facility (AAS/GC-MS)',
      'Environmental Hydrogeology & Water Quality Testing Lab',
    ],
    district: 'Dhanbad',
    state: 'Jharkhand',
    baseScore: 92,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'academic_research',
    verificationDate: '2026-09-08',
    evidenceSources: [
      {
        title: 'Department of Environmental Science & Engineering, IIT (ISM) Dhanbad',
        url: 'https://www.iitism.ac.in/departments/ese/',
        type: 'OFFICIAL_PORTAL',
        description: 'Official academic department overview, CPCB-accredited laboratories, and research areas in water treatment, hydrogeology, and mining environmental management.',
      },
    ],
  },
  {
    id: 'u-mobility-ranchi',
    name: 'Birla Institute of Technology, Mesra (BIT Mesra)',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Civil and Environmental Engineering',
    primaryDomains: ['Traffic & Transport', 'Urban Planning'],
    secondaryDomains: ['Civic Infrastructure'],
    expertise: [
      'Transportation Engineering',
      'Traffic Flow Modelling',
      'Traffic Management',
      'Highway Engineering',
      'Pavement Design',
      'Road Safety Analysis',
      'Public Transportation Systems',
    ],
    facilities: [
      'Transportation Engineering Laboratory',
      'Structural Engineering Laboratory',
      'Surveying Laboratory',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 90,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'academic_research',
    verificationDate: '2026-09-08',
    evidenceSources: [
      {
        title: 'Department of Civil and Environmental Engineering, BIT Mesra',
        url: 'https://www.bitmesra.ac.in/Show_Department_Section?cid=1&deptid=70',
        type: 'OFFICIAL_PORTAL',
        description: 'Official department overview, Transportation Engineering postgraduate specialization, traffic research sub-areas, and the Transportation Engineering Laboratory.',
      },
    ],
  },
  {
    id: 'u-rims-ranchi',
    name: 'Rajendra Institute of Medical Sciences (RIMS), Ranchi',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Preventive & Social Medicine',
    primaryDomains: ['Public Health & Sanitation', 'Healthcare'],
    secondaryDomains: ['Governance'],
    expertise: [
      'Public Health',
      'Preventive & Social Medicine',
      'Epidemiology',
      'Community Health',
      'Health Program Implementation',
      'Rural Health',
      'Urban Health',
      'Public Health Research',
    ],
    facilities: [
      'Rural Health Training Centre',
      'Urban Health Training Centre',
      'Multidisciplinary Research Unit',
      'Public Health Laboratory',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 92,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'academic_research',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'RIMS — Department of Preventive & Social Medicine',
        url: 'https://rimsranchi.ac.in/dept/psm.php',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official RIMS department page documenting public-health programs, Rural Health Training Centre, Urban Health Training Centre, research activities, national health-program implementation, and public-health training.',
      },
      {
        title: 'RIMS — State Centre of Excellence for Public Health Nutrition',
        url: 'https://rimsranchi.ac.in/scoe/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official RIMS centre documenting public-health nutrition work and technical support for strengthening nutrition interventions across Jharkhand.',
      },
      {
        title: 'RIMS — Department of Microbiology',
        url: 'https://rimsranchi.ac.in/dept/dept_micro.php',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official RIMS department page documenting public-health surveillance and research activities including dengue/chikungunya monitoring, influenza surveillance, and ongoing health research projects.',
      },
    ],
  },
  {
    id: 'u-health-hazaribagh',
    name: 'Public Health Research Institute',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Epidemiology & Community Health',
    primaryDomains: ['Public Health & Sanitation', 'Healthcare'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Public Health Engineering',
      'Epidemiology',
      'Rural Healthcare',
      'Medical Logistics',
      'Preventive Sanitation',
    ],
    facilities: [
      'Diagnostic Pathology Unit',
      'Community Health Survey Database',
      'Epidemiological Modelling Rig',
    ],
    district: 'Hazaribagh',
    state: 'Jharkhand',
    baseScore: 90,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'DEMO_UNVERIFIED',
    sectorType: 'academic_research',
    verificationDate: null,
    evidenceSources: [],
  },
  {
    id: 'u-bau-ranchi',
    name: 'Birsa Agricultural University (BAU), Ranchi',
    type: 'UNIVERSITY MATCH',
    dept: 'College of Agricultural Engineering',
    primaryDomains: ['Agriculture & Irrigation'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Agricultural Engineering',
      'Irrigation & Drainage Engineering',
      'Soil & Water Conservation Engineering',
      'Farm Machinery and Power Engineering',
      'Agricultural Development',
      'Agricultural Research',
      'Agricultural Technology Transfer',
    ],
    facilities: [
      'College of Agricultural Engineering',
      'Department of Irrigation and Drainage Engineering',
      'Department of Soil and Water Conservation Engineering',
      'Department of Farm Machinery and Power Engineering',
      'University farms and agricultural research infrastructure',
      'Extension and technology-transfer infrastructure',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 90,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'academic_research',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'BAU — College of Agricultural Engineering',
        url: 'https://bauranchi.org/college-of-agricultural-engineering/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official BAU page documenting the College of Agricultural Engineering and its departments, including Irrigation and Drainage Engineering and Soil and Water Conservation Engineering.',
      },
      {
        title: 'BAU — Faculty, College of Agricultural Engineering',
        url: 'https://bauranchi.org/faculty-college-of-agricultural-engineering/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official BAU faculty page documenting the Department of Soil and Water Conservation Engineering, Farm Machinery and Power Engineering, Processing and Food Engineering, and Irrigation and Drainage Engineering.',
      },
      {
        title: 'BAU — About BAU',
        url: 'https://bauranchi.org/about-bau/',
        type: 'OFFICIAL_PORTAL',
        description:
          "Official BAU institutional page documenting the university's objectives in agriculture, research, extension, area-specific technologies, agricultural development, university farms, research stations, and Krishi Vigyan Kendras.",
      },
      {
        title: 'BAU — Extension Education Council',
        url: 'https://bauranchi.org/extension-education-council/',
        type: 'OFFICIAL_PORTAL',
        description:
          "Official BAU page documenting the university's extension structure and participation of agriculture, irrigation, rural development, and related government/agro-industry representatives.",
      },
    ],
  },
  {
    id: 'u-agri-bokaro',
    name: 'Agricultural Systems Research Centre',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Agronomy & Irrigation Engineering',
    primaryDomains: ['Agriculture & Irrigation', 'Rural Development'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Agricultural Engineering',
      'Irrigation Systems',
      'Agronomy',
      'Soil Science',
      'Rural Development',
    ],
    facilities: [
      'Soil Nutrient Spectrometry Lab',
      'Micro-Irrigation Experimental Beds',
      'Crop Drought Resilience Greenhouse',
    ],
    district: 'Bokaro',
    state: 'Jharkhand',
    baseScore: 88,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'DEMO_UNVERIFIED',
    sectorType: 'academic_research',
    verificationDate: null,
    evidenceSources: [],
  },
  {
    id: 'u-nitjsr',
    name: 'National Institute of Technology Jamshedpur (NIT Jamshedpur)',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Civil Engineering',
    primaryDomains: ['Traffic & Transport', 'Civic Infrastructure'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Civil Engineering',
      'Structural Engineering',
      'Geotechnical Engineering',
      'Transportation Engineering',
      'Environmental Engineering',
      'Water Resources Engineering',
    ],
    facilities: [
      'Department of Civil Engineering Laboratories',
      'Structural Engineering Laboratory',
      'Geotechnical Engineering Laboratory',
      'Environmental Engineering Laboratory',
      'Computational Civil Engineering Facility',
    ],
    district: 'Jamshedpur',
    state: 'Jharkhand',
    baseScore: 90,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'academic_research',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'NIT Jamshedpur — Department of Civil Engineering',
        url: 'https://www.nitjsr.ac.in/departments/civil',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official NIT Jamshedpur department portal documenting B.Tech in Civil Engineering, M.Tech specializations in Structural Engineering, Geotechnical Engineering, and Water Resource Engineering, doctoral research, modern laboratories, and testing & consultancy services.',
      },
      {
        title: 'NIT Jamshedpur — Sustainable Practices and Materials in Civil Engineering (SPMCE 2026)',
        url: 'https://www.nitjsr.ac.in/events/spmce2026',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official NIT Jamshedpur conference portal documenting research and capabilities in green mobility, durable pavements, intelligent transportation systems, and sustainable civil infrastructure materials.',
      },
      {
        title: 'National Institute of Technology Jamshedpur — Official Portal',
        url: 'https://www.nitjsr.ac.in/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official portal of NIT Jamshedpur (Institution of National Importance) documenting institute academic departments, central research facilities, and engineering consultancy.',
      },
    ],
  },
  {
    id: 'u-general-jharkhand',
    name: 'University Innovation Partner',
    type: 'UNIVERSITY MATCH',
    dept: 'Department of Community Systems & Civic Technology',
    primaryDomains: ['Civic Infrastructure', 'Civic & Community Challenge', 'Governance'],
    secondaryDomains: ['Traffic & Transport', 'Urban Planning', 'General Engineering'],
    expertise: [
      'Civic Engineering',
      'Community Development',
      'Structural Systems',
      'Materials Assessment',
      'Policy Research',
      'Interdisciplinary Studies',
    ],
    facilities: [
      'Civic Technology Prototyping Lab',
      'Structural Materials Testing Bay',
      'Community Field Outreach Centre',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 80,
    borderClass: 'border-indigo-200 hover:border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    matchStatus: 'DEMO_UNVERIFIED',
    sectorType: 'academic_research',
    verificationDate: null,
    evidenceSources: [],
  },

  // ── Industry Partners ────────────────────────────────────────────────────
  {
    id: 'i-mecon-ranchi',
    name: 'MECON Limited',
    type: 'INDUSTRY MATCH',
    dept: 'Environmental Engineering & Water Infrastructure',
    primaryDomains: ['Water & Environment', 'Civic Infrastructure'],
    secondaryDomains: ['Mining & Resources', 'Governance'],
    expertise: [
      'Environmental Engineering',
      'Water Treatment',
      'Advanced Water Treatment',
      'Environmental Monitoring',
      'Engineering Consultancy',
      'Project Management',
      'Water Infrastructure',
    ],
    facilities: [
      'Environmental Laboratory Facilities',
      'Water Treatment Engineering Capability',
      'Engineering & Project Management Services',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 88,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'industry',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'MECON Limited — Official Website',
        url: 'https://meconlimited.co.in/Home.aspx',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official MECON profile documenting its Government of India enterprise status, Ranchi headquarters, engineering and consultancy capabilities.',
      },
      {
        title: 'MECON Limited — Power Engineering & Environmental Engineering',
        url: 'https://meconlimited.co.in/Power/Power_plant.aspx',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official capability page documenting water treatment, advanced water treatment, environmental engineering and environmental laboratory capabilities.',
      },
      {
        title: 'MECON Limited — Ongoing Projects',
        url: 'https://meconlimited.co.in/ongoing_project.aspx',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official project information documenting water-supply, water-treatment and engineering consultancy work.',
      },
    ],
  },
  {
    id: 'i-apollo-jharkhand',
    name: 'Apollo Hospitals Enterprise Limited',
    type: 'INDUSTRY MATCH',
    dept: 'Apollo Clinic & Diagnostic Services',
    primaryDomains: ['Public Health & Sanitation'],
    secondaryDomains: ['Healthcare'],
    expertise: [
      'Healthcare Services',
      'Community Health',
      'Preventive Healthcare',
      'Clinical Care',
      'Diagnostic Pathology',
      'Health Education',
    ],
    facilities: [
      'Apollo Multi-Speciality Clinic, Ranchi',
      'Diagnostic Pathology and Laboratory Testing Facility, Ranchi',
      'Preventive Health Check and Diagnostic Screening Centre',
      'Apollo Telehealth & Digital Health Services',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 88,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'industry',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'Apollo Clinic Ranchi — Official Centre Portal',
        url: 'https://www.apolloclinic.com/clinic/jharkhand/ranchi',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Apollo Clinic portal documenting multi-speciality clinical consultations, diagnostic laboratory services, ECG, X-Ray, and preventive health check packages in Ranchi, Jharkhand.',
      },
      {
        title: 'Apollo Diagnostics — Ranchi Pathology & Diagnostic Network',
        url: 'https://www.apollodiagnostics.in/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Apollo Diagnostics portal documenting regional pathology lab operations, diagnostic testing, clinical biochemistry, and home sample collection services in Ranchi, Jharkhand.',
      },
      {
        title: 'Apollo Hospitals — Ranchi Network & Preventive Healthcare',
        url: 'https://www.apollohospitals.com/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Apollo Hospitals portal documenting corporate network services, Apollo ProHealth preventive healthcare screenings, and digital care access in Ranchi and Jharkhand.',
      },
      {
        title: 'Apollo 24|7 — Digital Healthcare & Teleconsultation Platform',
        url: 'https://www.apollo247.com/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Apollo digital healthcare portal documenting 24/7 doctor teleconsultations, home lab diagnostics booking, and medicine delivery across Ranchi, Jharkhand.',
      },
    ],
  },
  {
    id: 'i-health-hazaribagh',
    name: 'Rural Healthcare Solutions Partner',
    type: 'INDUSTRY MATCH',
    dept: 'Community Health Delivery & Telemedicine Solutions',
    primaryDomains: ['Public Health & Sanitation', 'Healthcare'],
    secondaryDomains: [],
    expertise: [
      'Rural Healthcare',
      'Public Health Engineering',
      'Telemedicine Platforms',
      'Rural Clinic Deployment',
      'Medical Supply Chain Logistics',
      'Preventive Diagnostics',
      'Field Operations',
    ],
    facilities: [
      'Solar-Powered Telemedicine Kiosks',
      'Cold-Chain Telemetry Vans',
      'Point-of-Care Blood Testing Kits',
    ],
    district: 'Hazaribagh',
    state: 'Jharkhand',
    baseScore: 84,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'DEMO_UNVERIFIED',
    sectorType: 'industry',
    verificationDate: null,
    evidenceSources: [],
  },
  {
    id: 'i-nsc-jharkhand',
    name: 'National Seeds Corporation Limited (NSC)',
    type: 'INDUSTRY MATCH',
    dept: 'Seed Production & Distribution Services',
    primaryDomains: ['Agriculture & Irrigation'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Seed Production',
      'Seed Distribution',
      'Agricultural Development',
      'Farmer Support',
      'Crop Production',
      'Agricultural Technology Transfer',
    ],
    facilities: [
      'National Seeds Corporation Area Office & Seed Distribution Centre, Ranchi',
      'Central Seed Testing Laboratory Network',
      'Seed Processing and Storage Infrastructure',
      'Breeder & Certified Seed Production Operations',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 88,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'industry',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'National Seeds Corporation Limited — Official Portal',
        url: 'https://www.indiaseeds.com/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official central portal of National Seeds Corporation Limited (Miniratna PSU under Ministry of Agriculture and Farmers Welfare, Government of India) documenting national seed production, certified seed testing laboratories, quality control, breeder seed multiplication, and regional distribution networks.',
      },
      {
        title: 'Department of Agriculture & Farmers Welfare — Public Sector Undertakings',
        url: 'https://agriwelfare.gov.in/',
        type: 'OFFICIAL_PORTAL',
        description:
          "Official portal of the Department of Agriculture & Farmers Welfare, Ministry of Agriculture and Farmers Welfare, documenting NSC's mandate for certified seed production, distribution of quality seeds, seed infrastructure development, and central agricultural scheme implementation.",
      },
      {
        title: 'Press Information Bureau — National Seeds Corporation Agricultural Initiatives',
        url: 'https://pib.gov.in/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Government of India Press Information Bureau documentation detailing National Seeds Corporation certified seed supply, seed production facilities in Jharkhand, and National Food Security Mission seed minikit distribution for state farmers.',
      },
      {
        title: 'Department of Agriculture, Animal Husbandry & Cooperative, Government of Jharkhand',
        url: 'https://krishi.jharkhand.gov.in/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official portal of the Department of Agriculture, Government of Jharkhand, documenting procurement and distribution partnerships with central agencies including National Seeds Corporation for certified crop seeds, pulses, and oilseeds across Jharkhand districts.',
      },
    ],
  },
  {
    id: 'i-agri-bokaro',
    name: 'Rural AgriTech Solutions Partner',
    type: 'INDUSTRY MATCH',
    dept: 'Farm Technology & Rural Infrastructure Deployment',
    primaryDomains: ['Agriculture & Irrigation', 'Rural Development'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Drip Irrigation',
      'Sensor Networks',
      'Rural Field Operations',
      'Farm Advisory Systems',
      'Solar Pump Integration',
      'Agronomy Support',
      'Agricultural Science',
      'Soil Health Assessment',
    ],
    facilities: [
      'Soil Moisture LoRa Sensor Gateways',
      'Micro-Sprinkler Fabrication Hub',
      'Field Technician Fleet',
    ],
    district: 'Bokaro',
    state: 'Jharkhand',
    baseScore: 85,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'DEMO_UNVERIFIED',
    sectorType: 'industry',
    verificationDate: null,
    evidenceSources: [],
  },
  {
    id: 'i-tata-steel-jamshedpur',
    name: 'Tata Steel Limited',
    type: 'INDUSTRY MATCH',
    dept: 'Engineering & Projects',
    primaryDomains: ['Civic Infrastructure'],
    secondaryDomains: ['Water & Environment'],
    expertise: [
      'Infrastructure Engineering',
      'Project Management',
      'Water Management',
      'Environmental Management',
      'Urban Infrastructure',
      'Community Infrastructure',
    ],
    facilities: [
      'Central Effluent Treatment Plant (CETP), Jamshedpur Works',
      'Bara Tertiary Treatment Plant & Water Recycling Infrastructure',
      'Environmental Monitoring and Testing Facilities',
      'Engineering & Projects Design and Execution Infrastructure',
    ],
    district: 'Jamshedpur',
    state: 'Jharkhand',
    baseScore: 90,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'industry',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'Tata Steel — Water Management',
        url: 'https://www.tatasteel.com/sustainability/water-management/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Tata Steel sustainability portal documenting industrial and civic water management in Jamshedpur, including the 4R framework (Reduce, Reuse, Recycle, Recover), 9 MGD Central Effluent Treatment Plant (CETP), Bara Tertiary Treatment Plant, Zero Liquid Discharge initiatives, and Subarnarekha river basin stewardship.',
      },
      {
        title: 'Tata Steel — Corporate Overview & Operations',
        url: 'https://www.tatasteel.com/corporate/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Tata Steel corporate portal documenting integrated steel manufacturing and utility operations in Jamshedpur, Engineering & Projects division management, industrial by-product utilization in road infrastructure, and urban utilities infrastructure.',
      },
      {
        title: 'Tata Steel — Sustainability & Environmental Management',
        url: 'https://www.tatasteel.com/sustainability/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Tata Steel sustainability portal documenting environmental management, biodiversity conservation, urban ecosystem restoration (Jamshedpur Nature Trail, CRM Bara Pond rainwater harvesting), and circular economy infrastructure.',
      },
    ],
  },
  {
    id: 'i-tata-motors-jamshedpur',
    name: 'Tata Motors Limited',
    type: 'INDUSTRY MATCH',
    dept: 'Commercial Vehicle Operations & Mobility Solutions',
    primaryDomains: ['Traffic & Transport'],
    secondaryDomains: ['Civic Infrastructure'],
    expertise: [
      'Transportation Engineering',
      'Mobility Solutions',
      'Commercial Vehicles',
      'Vehicle Engineering',
      'Public Transportation',
      'Sustainable Mobility',
      'Transport Technology',
      'Fleet Solutions',
    ],
    facilities: [
      'Tata Motors Jamshedpur Manufacturing Plant (822-acre Commercial Vehicle Facility)',
      'Commercial Vehicle Assembly & Heavy Engineering Facility, Jamshedpur',
      'Engine & Axle Component Manufacturing Lines (HV Axles Ltd., Jamshedpur)',
      'Fleet Edge Connected Vehicle Platform & Telematics Infrastructure',
    ],
    district: 'Jamshedpur',
    state: 'Jharkhand',
    baseScore: 90,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'VERIFIED_PUBLIC_CAPABILITY',
    sectorType: 'industry',
    verificationDate: '2026-09-09',
    evidenceSources: [
      {
        title: 'Tata Motors — Jamshedpur Manufacturing Operations',
        url: 'https://www.tatamotors.com/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Tata Motors corporate portal documenting the 822-acre Jamshedpur manufacturing facility (established in 1945) dedicated to medium and heavy commercial vehicle production, engine manufacturing (697/497 and 6B series), and axle and transmission components (HV Axles Ltd.).',
      },
      {
        title: 'Tata Motors Commercial Vehicles — Mobility & Transit Solutions',
        url: 'https://cv.tatamotors.com/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Tata Motors Commercial Vehicles portal documenting public mass transportation solutions, electric buses, State Transport Undertaking (STU) fleet deployments, and commercial mobility platforms.',
      },
      {
        title: 'Tata Motors — Fleet Edge Connected Vehicle Platform',
        url: 'https://www.tatamotors.com/',
        type: 'OFFICIAL_PORTAL',
        description:
          'Official Tata Motors portal documenting the Fleet Edge connected vehicle telematics platform for real-time commercial fleet tracking, predictive vehicle health diagnostics, and smart transport management.',
      },
    ],
  },
  {
    id: 'i-community-jharkhand',
    name: 'Community Solutions Partner',
    type: 'INDUSTRY MATCH',
    dept: 'Civic Implementation & Community Welfare Services',
    primaryDomains: ['Civic Infrastructure', 'Civic & Community Challenge', 'General Infrastructure'],
    secondaryDomains: ['Governance', 'Urban Planning'],
    expertise: [
      'Civic Infrastructure Maintenance',
      'Structural Repair Deployment',
      'Field Coordination',
      'Stakeholder Engagement',
      'Public Procurement',
      'Community Outreach',
    ],
    facilities: [
      'Regional Field Ops Vehicles',
      'Community Verification Network',
      'Infrastructure Rapid-Response Unit',
    ],
    district: 'Ranchi',
    state: 'Jharkhand',
    baseScore: 78,
    borderClass: 'border-teal-200 hover:border-teal-300',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    matchStatus: 'DEMO_UNVERIFIED',
    sectorType: 'industry',
    verificationDate: null,
    evidenceSources: [],
  },
];

// Lookup helpers

/** Return the institution with the given id, or undefined. */
export function getInstitutionById(id) {
  return INSTITUTIONS_REGISTRY.find(function (inst) { return inst.id === id; });
}

/** Return institutions whose primaryDomains or secondaryDomains include the domain string (case-insensitive). */
export function getInstitutionsByDomain(domain) {
  var domainLower = domain.toLowerCase();
  return INSTITUTIONS_REGISTRY.filter(function (inst) {
    return inst.primaryDomains.concat(inst.secondaryDomains).some(function (d) {
      return d.toLowerCase().includes(domainLower) || domainLower.includes(d.toLowerCase());
    });
  });
}

/** Return all institutions of the given type (e.g. UNIVERSITY MATCH or INDUSTRY MATCH). */
export function getInstitutionsByType(type) {
  return INSTITUTIONS_REGISTRY.filter(function (inst) { return inst.type === type; });
}
