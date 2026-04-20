// Auto-generated catalog of Make-a-Thon 7.0 problem statements.
// Source: organizers' master list.

export type Track = "Hardware" | "Software" | "Industry Problem Statement";

export type ProblemStatement = {
  id: string;
  name: string;
  track: Track;
  category: string; // sub-category / company
  company?: string; // only for Industry track
};

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  // ===== HARDWARE =====
  // HW-01 IoT & Embedded Systems
  { id: "HW0101", name: "Smartphone-Linked Off-Grid Mesh Communication System for Reserve Forests", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0102", name: "Intelligent Water Distribution Monitoring System", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0103", name: "Condition-based Monitoring and Maintenance System", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0104", name: "Autonomous Edge-Tracked \"Smart Crate\"", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0105", name: "Intelligent Wearable-Based Anti-Collision System for Industrial Safety in LOS and NLOS Environments", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0106", name: "Self-Calibrating Sensor System", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0107", name: "Fault Detection in Analog Circuits", track: "Hardware", category: "IoT & Embedded Systems" },
  { id: "HW0108", name: "Adaptive Crowd Behavior Intelligence Node for Public Spaces", track: "Hardware", category: "IoT & Embedded Systems" },
  // HW-02 Healthcare & Wearable Technology
  { id: "HW0201", name: "Fatigue Detection for Drivers", track: "Hardware", category: "Healthcare & Wearable Technology" },
  { id: "HW0202", name: "Multi-Parameter Fatigue & Cognitive Load Monitoring Wearable", track: "Hardware", category: "Healthcare & Wearable Technology" },
  { id: "HW0203", name: "AI-Based Real-Time Dynamic Range Control for Safe Audio Consumption", track: "Hardware", category: "Healthcare & Wearable Technology" },
  // HW-03 Agriculture & Food Technology
  { id: "HW0301", name: "Smart Tamarind Storage System for Retaining Natural Color and Quality", track: "Hardware", category: "Agriculture & Food Technology" },
  { id: "HW0302", name: "Multi-Animal Health State Inference & Disease Propagation System", track: "Hardware", category: "Agriculture & Food Technology" },
  { id: "HW0303", name: "Dynamic Pest Activity Detection", track: "Hardware", category: "Agriculture & Food Technology" },
  { id: "HW0304", name: "Predictive Phytonutrient Diagnostic and Precision Recovery System", track: "Hardware", category: "Agriculture & Food Technology" },
  // HW-04 Disaster Management
  { id: "HW0401", name: "Disaster Response Drone for Remote Areas", track: "Hardware", category: "Disaster Management" },
  { id: "HW0402", name: "Autonomous Flood-Submergence Marker and Rescue-Guidance Buoy for Urban Drains and Nullahs", track: "Hardware", category: "Disaster Management" },
  { id: "HW0403", name: "Rapid-Deploy Wildfire \"Smoke-Sniffer\" Network", track: "Hardware", category: "Disaster Management" },
  // HW-05 Robotics & Industrial Automation
  { id: "HW0501", name: "Autonomous Inspection Robot for Hazardous Environments", track: "Hardware", category: "Robotics & Industrial Automation" },
  // HW-06 Energy & Sustainable Solutions
  { id: "HW0601", name: "Sustainable Utilization of 100% of Ash from Coal-Based Thermal Power Plants", track: "Hardware", category: "Energy & Sustainable Solutions" },
  { id: "HW0602", name: "Autonomous Infrastructure Monitoring for High-Voltage Environments", track: "Hardware", category: "Energy & Sustainable Solutions" },
  { id: "HW0603", name: "IoT-Enabled Self-Powered Industrial Equipment Health Monitoring System Using Waste Heat Energy Harvesting", track: "Hardware", category: "Energy & Sustainable Solutions" },
  { id: "HW0604", name: "AI-Powered Autonomous Water Bot for Ocean Pollution Detection and Cleanup", track: "Hardware", category: "Energy & Sustainable Solutions" },

  // ===== SOFTWARE =====
  // SW-01 AI & ML
  { id: "SW0101", name: "Personalized Learning for Dyslexic Students", track: "Software", category: "Artificial Intelligence & Machine Learning" },
  { id: "SW0102", name: "AI \"Lawyer\" for Small Vendors", track: "Software", category: "Artificial Intelligence & Machine Learning" },
  { id: "SW0103", name: "Cognitive-Aware Affective Intelligence Platform for Structured Emotional Modeling and Predictive Mental Well-being Analytics", track: "Software", category: "Artificial Intelligence & Machine Learning" },
  { id: "SW0104", name: "Deep Learning for Cyclone Intensity", track: "Software", category: "Artificial Intelligence & Machine Learning" },
  // SW-02 Smart Cities
  { id: "SW0201", name: "Community-Verified Utility Outage Map", track: "Software", category: "Smart Cities & Infrastructure" },
  { id: "SW0202", name: "Digital Twin of Cities for Disaster Preparedness and Planning", track: "Software", category: "Smart Cities & Infrastructure" },
  { id: "SW0203", name: "Data-Driven Digital Twin Platform for Smart Warehouse Management", track: "Software", category: "Smart Cities & Infrastructure" },
  // SW-03 Governance, Education
  { id: "SW0301", name: "Blockchain Credential Verification for Education", track: "Software", category: "Governance, Education & Rural Innovation" },
  { id: "SW0302", name: "Local-Language Grievance Auto-Routing for Municipalities", track: "Software", category: "Governance, Education & Rural Innovation" },
  { id: "SW0303", name: "Real-Time Multilingual Classroom Translation for Inclusive Education", track: "Software", category: "Governance, Education & Rural Innovation" },
  { id: "SW0304", name: "Voice-Based E-Governance for Rural India", track: "Software", category: "Governance, Education & Rural Innovation" },
  { id: "SW0305", name: "Unified Rural Digital Service Platform", track: "Software", category: "Governance, Education & Rural Innovation" },
  // SW-04 Blockchain & Cyber-Security
  { id: "SW0401", name: "Agent-less Windows System Vulnerability and Network Scanner", track: "Software", category: "Blockchain & Cyber-Security" },
  { id: "SW0402", name: "UPI/Wallet Scam Early-Warning Coach for First-Time Users", track: "Software", category: "Blockchain & Cyber-Security" },
  { id: "SW0403", name: "Decentralized Proof of Origin for Crafts", track: "Software", category: "Blockchain & Cyber-Security" },
  { id: "SW0404", name: "Decentralized Immutable Protocol for Rural Land Title Governance", track: "Software", category: "Blockchain & Cyber-Security" },
  // SW-05 AR/VR
  { id: "SW0501", name: "AR-Based 3D Crime Scene Reconstruction and Training Platform for Law Enforcement", track: "Software", category: "Augmented Reality / Virtual Reality" },
  { id: "SW0502", name: "Virtual Apprenticeship Metaverse", track: "Software", category: "Augmented Reality / Virtual Reality" },
  { id: "SW0503", name: "AR-Guided Industrial Repair", track: "Software", category: "Augmented Reality / Virtual Reality" },
  { id: "SW0504", name: "Context-Aware AR-Based Real-Time Circuit Behavior & Fault Visualization System", track: "Software", category: "Augmented Reality / Virtual Reality" },
  // SW-06 FinTech
  { id: "SW0601", name: "Micro-Insurance for Climate-Resilient Farmers", track: "Software", category: "FinTech & Digital Economy" },
  { id: "SW0602", name: "Unified Digital Platform for Insurance Portfolio Management and Smart Policy Discovery", track: "Software", category: "FinTech & Digital Economy" },
  { id: "SW0603", name: "AI-Powered Fraud Detection System to Protect Rural and Low-Literacy Banking Users from Social Engineering Attacks", track: "Software", category: "FinTech & Digital Economy" },
  { id: "SW0604", name: "AI-Driven Intelligent Product Recommendation and Price Optimization Platform", track: "Software", category: "FinTech & Digital Economy" },
  { id: "SW0605", name: "AI-Powered Autonomous Job Search & Application Optimization System", track: "Software", category: "FinTech & Digital Economy" },

  // ===== INDUSTRY =====
  // IS-01 Ford Motor Company
  { id: "IS0101", name: "AI-Based Interview Preparation Assistant", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0102", name: "Smart Expense Analyzer for Students", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0103", name: "Subscription Tracker", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0104", name: "Mental Health Chat Support Bot", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0105", name: "Medicine Reminder + Interaction Checker", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0106", name: "Energy Consumption Dashboard", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0107", name: "Skill Gap Analyzer for Students", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0108", name: "Live Phishing URL Detector", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0109", name: "Smart Parking Availability System", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0110", name: "AI-Based Smart Notes Summarizer", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  { id: "IS0111", name: "Real-Time Quiz & Leaderboard System", track: "Industry Problem Statement", category: "Ford Motor Company", company: "Ford Motor Company" },
  // IS-02 Walmart
  { id: "IS0201", name: "AI-Based Garment Return Reduction System", track: "Industry Problem Statement", category: "Walmart", company: "Walmart" },
  { id: "IS0202", name: "AI Agent for Government E-Seva Services", track: "Industry Problem Statement", category: "Walmart", company: "Walmart" },
  { id: "IS0203", name: "AI Agent for Event Management in India", track: "Industry Problem Statement", category: "Walmart", company: "Walmart" },
  { id: "IS0204", name: "Automatic Library Book Arranging Robot using Computer Vision", track: "Industry Problem Statement", category: "Walmart", company: "Walmart" },
  { id: "IS0205", name: "Solution for Cart Abandonment in E-Commerce Websites", track: "Industry Problem Statement", category: "Walmart", company: "Walmart" },
  // IS-03 SOLVITAE
  { id: "IS0301", name: "Design of a Plug-and-Play Smart Vehicle Monitoring and Tracking System", track: "Industry Problem Statement", category: "SOLVITAE", company: "SOLVITAE" },
  { id: "IS0302", name: "Design and Development of a Plug-and-Play Overspeed Alert System for Diesel Forklifts", track: "Industry Problem Statement", category: "SOLVITAE", company: "SOLVITAE" },
  // IS-04 Delphi TVS
  { id: "IS0401", name: "Emotion-Aware Smart Factory System for Enhancing Worker Safety and Productivity", track: "Industry Problem Statement", category: "Delphi TVS", company: "Delphi TVS" },
  { id: "IS0402", name: "Autonomous Night-Shift Factory Monitoring and Control System", track: "Industry Problem Statement", category: "Delphi TVS", company: "Delphi TVS" },
  { id: "IS0403", name: "Renewable Energy-Aware Intelligent Production Scheduling System Safety and Productivity", track: "Industry Problem Statement", category: "Delphi TVS", company: "Delphi TVS" },
  // IS-05 Space Machines Company
  { id: "IS0501", name: "Last Signal Standing: Aerial Distress Detection & Micro-Relay System for Network-Down Disaster Zones", track: "Industry Problem Statement", category: "Space Machines Company", company: "Space Machines Company" },
  // IS-06 ApexFlow Technologies
  { id: "IS0601", name: "The Air Gapped Optical Data Bridge", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  { id: "IS0602", name: "Hardware-Level Anti-Deepfake Audio Nodes", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  { id: "IS0603", name: "Passive Crowd Crush Detection via Packet Sniffing", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  { id: "IS0604", name: "DNS Tunneling and Data Exfiltration Detector", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  { id: "IS0605", name: "Zero-Trust CI/CD Pipeline Auditor", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  { id: "IS0606", name: "Intelligent Phishing & Scam Spotter", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  { id: "IS0607", name: "Smart Receipt & Budget Categorizer", track: "Industry Problem Statement", category: "ApexFlow Technologies", company: "ApexFlow Technologies" },
  // IS-07 ThynkLoop
  { id: "IS0701", name: "Digitalization of Mechanical Medical Devices for Remote Monitoring and Safer Healthcare", track: "Industry Problem Statement", category: "ThynkLoop", company: "ThynkLoop" },
  // IS-08 Marketview360
  { id: "IS0801", name: "Proactive Signal Detection - Early Warnings and Event-Driven Risk Identification in Equity Markets", track: "Industry Problem Statement", category: "Marketview360", company: "Marketview360" },
  { id: "IS0802", name: "Domain-Specific Small Language Models for Retail Investment Intelligence", track: "Industry Problem Statement", category: "Marketview360", company: "Marketview360" },
  // IS-09 Upcheck Technologies
  { id: "IS0901", name: "Dependable Data Systems for Low-Connectivity Field Environments", track: "Industry Problem Statement", category: "Upcheck Technologies", company: "Upcheck Technologies Private Limited" },
  { id: "IS0902", name: "Energy-Efficient Sensor Network Design for Extended Field Deployments", track: "Industry Problem Statement", category: "Upcheck Technologies", company: "Upcheck Technologies Private Limited" },
  // IS-10 Softrate
  { id: "IS1001", name: "Micro-SaaS CRM for Client Onboarding & Proposal Automation", track: "Industry Problem Statement", category: "Softrate", company: "Softrate" },
  { id: "IS1002", name: "E-commerce SaaS Platform for Multi-Product Management & POS Integration", track: "Industry Problem Statement", category: "Softrate", company: "Softrate" },
];

export function getStatementsByTrack(track: Track): ProblemStatement[] {
  return PROBLEM_STATEMENTS.filter((p) => p.track === track);
}
