# Energy Radar — Project Radar

**Live Demo:** https://candid-ai-hackathon.vercel.app/

## What we were trying to solve

Energy project information is spread across many places.

A project might appear in an ERCOT report, a permit record, a regulatory filing, or a company announcement.

The problem is:

**There is no single place that brings this story together.**

So we built **Energy Radar** — a prototype that brings project data together and turns it into something people can quickly understand and follow.

---

## What we built

The main flow is:

**ERCOT public GIS report**
↓
**Find and download the latest report**
↓
**Parse the Excel data**
↓
**Clean and standardize project records**
↓
**Geocode project locations with Google Maps**
↓
**Send project data to GPT-4o**
↓
**Estimate project stage, score, momentum, and key information**
↓
**Validate the AI output with Zod**
↓
**Store / serve project data through Supabase**
↓
**Display it in the Energy Radar dashboard**

So instead of giving someone a huge spreadsheet, we give them:

> **Which projects matter, where they are, what stage they are in, and what is happening with them.**

---

## Tech Stack

**Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* Three.js
* SWR

**Backend / Data**

* Next.js API routes
* Supabase
* ERCOT GIS data
* XLSX parsing
* Cheerio for finding the latest ERCOT report

**AI**

* OpenAI GPT-4o
* Zod for structured output validation

**Location**

* Google Maps Geocoding API

**Deployment**

* Vercel

---

## 1. Getting the project data

We connected to the public **ERCOT Generator Interconnection Status (GIS) report**.

The system:

**Finds the latest report**
→ downloads the Excel file
→ reads the project rows
→ removes headers and non-project rows
→ cleans the fields
→ converts Excel dates into normal dates
→ creates structured project records.

The prototype parsed **1,817 rows** from the Large Generation section during testing.

---

## 2. Turning raw data into project intelligence

ERCOT gives us raw project information.

We use **GPT-4o** to turn that into a standard project profile.

The AI looks at:

* Project name
* Location
* Technology
* Capacity
* Interconnection progress
* Study progress
* Agreement status
* Construction information
* ERCOT milestones

It then produces information such as:

**Project**
→ **Location**
→ **Technology**
→ **Capacity**
→ **Development stage**
→ **Opportunity score**
→ **Momentum**
→ **Confidence**
→ **Signals**
→ **Why now?**

---

## 3. Stage and opportunity assessment

We wanted the system to answer:

> **"Where is this project in its development?"**

The AI uses the ERCOT milestones to estimate the project stage.

The broader lifecycle is:

**Early activity**
→ **FEL-1**
→ **FEL-2 / Pre-FEED**
→ **FEED**
→ **Interconnection**
→ **FID**
→ **Construction**
→ **COD**

The prototype also gives each project an:

**Opportunity score** → How interesting the project looks right now.

**Momentum** → Accelerating / Watch / Stalled.

**Confidence** → How confident we are in the generated project profile.

---

## 4. Location intelligence

ERCOT gives us information such as county and point of interconnection.

We use **Google Maps Geocoding** to turn this into:

**Project location**
→ City
→ State
→ Latitude
→ Longitude

This allows us to place projects geographically on the map.

---

## 5. Energy Radar dashboard

The frontend is built with **Next.js, React, TypeScript, Tailwind CSS, and Three.js**.

The main experience is:

**Texas energy landscape**
↓
**Projects shown geographically**
↓
**Select a project**
↓
**Project intelligence panel opens**

Users can:

* Explore the map
* Zoom and move around
* Hover over projects
* Select projects
* Search projects
* View project details

The goal was to make it feel more like an intelligence tool than a spreadsheet.

---

## 6. Project intelligence panel

When a project is selected, we bring the information together:

**Project + location**
↓
**Opportunity score + confidence**
↓
**Momentum + capacity + technology**
↓
**Why now?**
↓
**Current stage**
↓
**Signals / evidence**
↓
**What changed?**

The idea is:

> **You should not have to open five different websites to understand one project.**

---

## 7. Projects and Signals

We also created separate views for:

### Projects

A searchable list showing:

* Category
* Location
* Score
* Momentum
* Stage

### Signals

A feed designed to show project activity, such as:

**ERCOT → Interconnection**
**TCEQ → Permit**
**Public filing → Construction**

This can eventually become the live feed that tells users:

> **"Something changed. Go look at this project."**

---

## 8. Data validation and storage

We use **Zod** to validate the AI output before using it.

The flow is:

**GPT-4o response**
→ **Parse JSON**
→ **Check against Zod schema**
→ **If invalid, send the error back to GPT-4o**
→ **Retry**
→ **Return validated project data**

Project data is designed to be stored and served through **Supabase**.

The frontend uses **SWR** to fetch project data and refresh it every 30 seconds.

---

## 9. What was real vs. prototype

We had about **4–5 hours**, so we focused on proving the core idea.

### Working prototype

* ERCOT GIS report ingestion
* Excel parsing
* ERCOT data cleaning
* Google Maps geocoding
* GPT-4o project extraction
* AI-based stage / score / momentum
* Zod validation
* Supabase integration
* Project API
* 3D project map
* Project search
* Project intelligence view
* Projects and Signals views
* Vercel deployment

### Still simplified

The full Project Radar vision would combine:

**ERCOT**

* **PUCT**
* **FERC**
* **TCEQ**
* **Railroad Commission**
* **County / municipal records**
* **OEM / EPC announcements**
* **Finance news**
* **Earnings calls**

For this hackathon version, **ERCOT is the main live source we connected to**.

Some signal and evidence information is currently mocked to demonstrate the final product experience.

True cross-source **entity resolution** is also a next step. The prototype establishes the pipeline needed to build that out.

---

## The bigger idea

The final system would work like this:

**Many public sources**
↓
**Find new project signals**
↓
**Recognize that different records belong to the same project**
↓
**Build one project record**
↓
**Understand its development stage**
↓
**Track what changed**
↓
**Attach evidence + confidence**
↓
**Show the entire project story in one place**

That is the idea behind **Energy Radar**:

> **Instead of making people search for energy projects, make the projects come to them.**
