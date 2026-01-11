<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14b3SVGN_I3MLKmyU5-rbV0nIoY4zDjuV

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`





🚀 PlaceReady

Connecting Juniors and Seniors for Smarter Placement Preparation

Bridging the gap between juniors and seniors.
A structured campus platform for placement guidance, Q&A, mentorship, and real learning — without WhatsApp chaos.

⸻

🧠 What is PlaceReady?

PlaceReady is a campus-focused platform where:
	•	Juniors ask real doubts
	•	Seniors guide with experience
	•	Guidance is structured, not noisy
	•	Domains, years, and roles are respected

No likes. No spam. No fake experts.
Just learning and growth.

⸻

🎯 Core Idea
	•	Everyone can ask questions
	•	Only valid seniors can answer
	•	Answering depends on:
	•	Academic Year
	•	Domain (DSA, Web, Internships, Placements, etc.)

Rules:
	•	Same-year answering not allowed
	•	Cross-domain answering not allowed
	•	Seniors must be from higher year
	•	Multiple seniors can answer one question

⸻

👥 User Types

👨‍🎓 Juniors
	•	Signup with year and domain
	•	Check placement eligibility
	•	Explore company insights
	•	Ask domain-specific questions
	•	Get notified when seniors reply
	•	Chat with seniors after approval

🧑‍🏫 Seniors
	•	Answer only lower-year students
	•	Answer only in their domain
	•	Get notified when juniors ask
	•	Share interview learnings
	•	Accept chat requests

⸻

✨ Key Features

🏠 Home Interface
	•	Eligibility Check
	•	Company Insights
	•	Ask Seniors
	•	Guidance Section

📊 Eligibility Check
	•	Enter CGPA, branch, skills
	•	Shows:
	•	Eligible companies
	•	Skill gaps

🏢 Company Insights
	•	Real data from placed seniors:
	•	Criteria
	•	Skills
	•	Rounds
	•	Mistakes
	•	Clickable senior profiles

❓ Ask Seniors (Q&A)
	•	Juniors ask with domain tag
	•	Only matching seniors get notified
	•	Multiple seniors can answer
	•	Senior profile is clickable

🔔 Notifications
	•	Seniors notified on new questions
	•	Juniors notified on replies

💬 Messaging
	•	Junior sends request
	•	Senior accepts
	•	Chat supports:
	•	Text
	•	Images
	•	Emojis

📚 Guidance Section
	•	Seniors share:
	•	Interview stories
	•	Preparation plans
	•	Failures & lessons
	•	No likes, no comments — only reading

⸻

🧠 Smart Logic
	•	Role auto-detected by year
	•	2nd year → senior for 1st
	•	3rd year → senior for 1st & 2nd
	•	4th year → senior for all below
	•	Domain-based routing of questions

⸻

🧪 QA Checklist
	•	✅ Mobile Responsive
	•	✅ Junior + Senior Dashboards
	•	✅ Domain Routing
	•	✅ Notifications Working
	•	✅ Messaging with Images & Emojis
	•	✅ Profile Click Navigation
	•	✅ Multi-Answer Support
	•	✅ Reload Persistence

⸻

🛠 Tech Stack

Frontend
	•	React + Vite
	•	Modern UI / Glassmorphism
	•	Responsive Design

Backend
	•	Firebase Authentication
	•	Firestore Database
	•	Firebase Storage
	•	Firebase Cloud Messaging

Hosting
	•	Vercel
	•	GitHub

⸻

🌍 Deployment

Supported on:
	•	Vercel
	•	Netlify
	•	Railway
	•	Render
	•	Docker
	•	AWS
	•	GCP
🧩 Project Architecture
placeready/
│
├── backend/
│   ├── firebase/
│   └── config/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
└── README.md

⚙ Installation & Setup

1. Clone Repo
git clone <your-repo-link>
cd placeready
 2. Install Frontend
    cd frontend
npm install
npm run dev

3. Firebase Setup
	•	Create Firebase project
	•	Enable:
	•	Auth
	•	Firestore
	•	Storage
	•	FCM
	•	Add config to your app

⸻

🤝 Contributing

Pull requests are welcome ❤️

Steps:
Fork
Create feature branch
Commit
Push
Submit PR
📬 Contact

Developer-team: 
-Rohit Narwariya
Email: rohitnarwariya21@gmail.com
GitHub: https://github.com/rohitnarwariya

-Ankit kumar
Email:ankitkumar822006@gmail.com
GitHub: https://github.com/Ordinary-Boy20

-Debjani paul
Email: 
GitHub: 


⸻

❤️ Made with Love for Students

Smarter Campus • Better Guidance • Real Impact

PlaceReady — Learn Better. Prepare Smarter. Grow Together.
