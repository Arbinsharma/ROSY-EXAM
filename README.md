# Rosy Student Hub

A student-first, mobile-friendly exam and study dashboard for Rosy Buds students.

## What is new
- Working hamburger menu with click-anywhere-to-close behavior.
- Animated greeting screen for Arbin / Prashant.
- English / Nepali interface toggle.
- Daily Challenge loop with XP and streaks.
- Class-aware quizzes for classes 1–10 plus UKG/LKG/Nursery.
- Class-aware subject and practice-unit selection.
- Grade 9 verified chapter data from the project source; other classes use clearly labelled Rosy practice units rather than pretending they are official CDC chapter names.
- Exam routine and countdowns from the supplied routine data.
- Per-exam Notify Me controls and a Test Notification button.
- Teacher Finder using the supplied teacher directory, including Call and WhatsApp actions where a number is supplied.
- Exam Prep with studied-chapter selection and 50/75 marks target.
- Official CDC study-resource links where available in the supplied data.
- Google Translate shortcut.
- 25-minute Focus Mode.
- Strong About Me page and creator watermark/footer using the supplied profile image.
- Dark/light theme, animation controls, live clock and local preferences.
- No admin panel and no backend.

## Notifications
Browser notifications require notification permission and normally work when the site is served from HTTPS or localhost. The Test Notification button confirms whether the browser allows a notification. Exam alerts are local browser notifications; this version does not provide server-side push notifications while the site is completely closed.

## Data notes
- Exam and teacher data comes from the project data supplied for Rosy.
- Government textbook links are directed to official CDC resources stored in the project data. If an official page changes or becomes unavailable, the app does not silently substitute a third-party copy.
- XP, streaks, quiz results, settings, studied units and notification choices are stored in the browser's localStorage.

## Run
For best results, serve the folder from a local web server rather than opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
# ROSY-EXAM
