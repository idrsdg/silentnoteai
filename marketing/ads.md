# Velnot — Ad Materials

> Target: students, professionals, business people, white-collar workers who attend meetings and want to record/summarize them.
> Core feature: Record meetings → Transcribe → AI summary or action plan
> Language: English only
> App: Windows (macOS waitlist)
> Pricing: $10.99/mo · $89.99/yr · $219 lifetime

---

## 1. Reddit Posts

### r/productivity

**Title:**
I used to spend 20 minutes after every meeting just trying to remember what was decided. So I built a fix.

**Body:**
Real talk: I was terrible at taking meeting notes.

Not because I wasn't paying attention — but because it's physically impossible to listen, think, AND type at the same time. I'd leave every call with half-baked notes, missing action items, and that sinking feeling of "wait, what did we actually agree on?"

So I built **Velnot**.

It runs on Windows, sits in your tray, and does three things:

**1. Records any meeting** — Teams, Zoom, Google Meet, phone calls, doesn't matter. One click.
**2. Transcribes everything** — accurate, fast, 14 languages.
**3. Generates an action plan** — not just a summary dump. Actual structured output: decisions made, next steps, who's responsible.

The action plan part changed everything for me. My meetings now end with a clear document instead of a blur.

I'm not going to pretend it's magic. But if you're the kind of person who leaves meetings and immediately thinks "I should've written that down" — this is for you.

Free tier available. Try it: **https://velnot.app**

What's your current system for capturing meeting notes? Genuinely curious.

---

### r/SideProject

**Title:**
I quit taking meeting notes. Built an AI app to do it instead. Here's what 6 months of solo building taught me.

**Body:**
Six months ago I had a problem: I was spending more time documenting meetings than actually running them.

Today I shipped the solution: **Velnot** — a Windows desktop app that records your meetings, transcribes them, and spits out an AI-generated action plan.

Here's what I actually learned building this:

**The hard parts nobody talks about:**
- System audio capture on Windows is a nightmare. Different hardware, different drivers, different behaviors. Took weeks to get right.
- "Fast enough" transcription is a moving target. Users expect magic. Getting there required switching models twice.
- People don't pay for "AI summarizer." They pay for "never miss an action item again." Positioning matters more than features.

**The stack:**
- Electron + React + TypeScript
- Node.js/Express backend (Render)
- AssemblyAI Universal-2 for transcription
- OpenAI for summaries/action plans
- SQLite locally, Lemon Squeezy for payments

**Numbers:**
- 14 languages supported
- Pricing: $10.99/mo · $89.99/yr · $219 lifetime

**What's next:** macOS, team plans, speaker diarization

Would love brutal feedback. What would make you actually pay for a meeting recorder?

**https://velnot.app**

---

### r/artificial

**Title:**
Most "AI meeting tools" just dump a wall of text. I built one that actually gives you an action plan. Here's the pipeline.

**Body:**
I got tired of AI meeting summaries that read like someone copy-pasted the transcript with bullet points.

So for **Velnot**, I designed the output around a specific question: *"What do I actually need to DO after this meeting?"*

**The pipeline:**

**Step 1 — Capture**
System audio + mic recording on Windows. One button. Works with any app — no integrations, no permissions, no browser extensions.

**Step 2 — Transcribe**
AssemblyAI Universal-2 model. Handles accents, crosstalk, and multilingual conversations better than anything else I tested. 14 language support baked in.

**Step 3 — Structure**
GPT-4 with a prompt engineered specifically for meeting contexts. The output isn't a summary — it's:
- Key decisions made
- Action items (with owners if detectable)
- Open questions / follow-ups
- Optional: full summary paragraph

The structured format is what users actually want. A "summary" gets skimmed. An action plan gets acted on.

**Technical choices I'd make differently:**
- I'd use streaming responses from the start — polling for completion feels clunky
- Speaker diarization is on the roadmap; it would make owner detection much more accurate

Anyone building in this space? What's your transcription stack?

**Try it:** https://velnot.app

---

### r/Entrepreneur

**Title:**
Your team leaves every meeting having heard different things. Here's the $10/mo fix.

**Body:**
Here's a meeting problem nobody talks about openly:

Three people attend the same call. They walk out with three different versions of what was decided.

One person heard "we'll think about it." Another heard "we're doing it." The third wasn't sure. Two weeks later, nothing happened — and now everyone's confused about whose fault it is.

This is not a people problem. It's a memory problem.

I built **Velnot** because I kept watching this happen — in my own work and in teams I was part of. The fix is embarrassingly simple: just record what actually happened, and let AI turn it into a shared action plan.

**What Velnot does:**
- Records any meeting on Windows (Teams, Zoom, any call)
- Transcribes it accurately
- Outputs a structured action plan: decisions, next steps, owners

Now everyone walks out with the same document. No ambiguity. No "I thought you were handling that."

If your team has more than 5 people and you're not recording your meetings, you're running on vibes.

Free tier to try. Plans start at $10.99/mo.

**https://velnot.app**

---

## 2. Hacker News

### Show HN

**Title:**
Show HN: Velnot – Record any meeting, get an AI action plan (Windows)

**Body:**
I built Velnot because I was attending 4-5 meetings a day and leaving all of them with incomplete notes and forgotten action items.

The existing options frustrated me: Otter.ai requires you to invite a bot to your calls, Fireflies needs calendar integrations, and most tools are web-first or Mac-only. I wanted a dead-simple Windows desktop app — hit record, walk away with a document.

**How it works:**
1. One-click system audio capture (no integrations needed)
2. AssemblyAI Universal-2 for transcription (best accuracy I found across multiple models)
3. GPT-4 structures the output into decisions, action items, and follow-ups — not just a summary wall

**Technical decisions worth discussing:**
- Electron was the right call for fast cross-platform iteration, but system audio APIs on Windows are inconsistent across hardware. Ended up wrapping multiple fallback strategies.
- Local SQLite for session storage — I didn't want user recordings going to my servers unnecessarily.
- AssemblyAI over Whisper: Whisper is great but Universal-2 handles real-world meeting audio (noise, accents, crosstalk) noticeably better in my testing.

**Stack:** Electron + React + TS / Node.js + Express / SQLite / Render / Lemon Squeezy

**14 language support** — both UI and transcription.

**Pricing:** $10.99/mo · $89.99/yr · $219 lifetime

https://velnot.app

Happy to dig into any technical tradeoffs.

---

## 3. Product Hunt

### Tagline options (pick one):
1. "Stop taking notes. Start getting action plans."
2. "Your meeting recorder that actually tells you what to do next."
3. "Record any meeting. Know exactly what happens next."

### Description:
Every meeting ends with decisions, action items, and follow-ups that someone is going to forget.

**Velnot fixes that.**

It records any meeting on your Windows desktop — Teams, Zoom, Google Meet, phone calls, any audio — transcribes it with high accuracy, and generates a structured action plan: what was decided, what needs to happen next, and who's responsible.

No bots joining your calls. No calendar integrations. No browser extensions. Just a desktop app that works.

**What makes it different:**
- Action plan output, not just a transcript dump
- Works with *any* meeting software — no integrations required
- One-click recording from the system tray
- 14 languages supported (transcription + full UI)
- Desktop-first: your recordings stay on your machine

**Who it's for:**
Anyone who leaves meetings thinking "I should've written that down" — managers, founders, consultants, students, anyone who's ever sent a "per our conversation" email.

**Pricing:**
- Free tier to try
- Monthly: $10.99/mo
- Yearly: $89.99/yr (save 33%)
- Lifetime: $219 one-time

**Download:** https://velnot.app

### Maker comment:
Hey Product Hunt —

Solo dev here. I built Velnot because I kept leaving meetings with half-baked notes and the feeling that I'd missed something important.

The core insight that drove the design: people don't need another transcript. They need to know *what to do next*. That's why the action plan output was the first thing I built — not the summary.

The hardest engineering problem was reliable system audio capture across different Windows hardware configurations. Took longer than I expected, but it's solid now.

I'm here all day — ask me anything about the build, the decisions I made, or what's coming next. Would genuinely love your feedback on the action plan format.

---

## 4. IndieHackers

**Title:**
I built a meeting recorder that turns calls into action plans. Here's everything I learned doing it solo.

**Body:**
I want to share something I've seen very little writing about: what it actually feels like to build a productivity tool that competes with VC-backed SaaS — as one person, with no budget.

Six months ago I started **Velnot**. It's a Windows desktop app that records meetings, transcribes them, and generates AI action plans. Today it's live and taking paid subscribers.

Here's what was real vs. what I expected:

---

**What I got wrong:**

*"The AI will sell itself."*
Wrong. People don't buy "AI meeting recorder." They buy "I will never miss an action item again." Features don't convert. Outcomes do. It took me 3 months to figure out how to explain this product properly.

*"Transcription is a solved problem."*
Also wrong — for real-world meeting audio. Background noise, accents, multiple speakers, crosstalk — it's messy. I went through two transcription providers before settling on AssemblyAI's Universal-2 model.

*"Windows audio is straightforward."*
Definitely wrong. System audio capture behaves differently across hardware, drivers, and Windows versions. This was my biggest technical headache by far.

---

**What worked:**

- **Keeping scope tiny.** Record → Transcribe → Action plan. I cut everything else.
- **Pricing with conviction.** $10.99/mo is not cheap for a utility app. But the value is real and I priced accordingly.
- **Building in public.** Sharing progress created early users who gave feedback before I had a finished product.

---

**Stack:**
Electron + React + TS · Node.js/Express · AssemblyAI · OpenAI · SQLite · Lemon Squeezy · Render

**Revenue model:**
$10.99/mo · $89.99/yr · $219 lifetime

**14 languages** — because meeting software is global.

**What's next:** macOS, team plans, speaker identification

---

What's the hardest thing you've found about getting people to pay for productivity software? Genuinely curious.

**https://velnot.app**

---

## 5. Twitter/X

**Post 1 — Pain hook:**
You leave every meeting thinking "I should've written that down."

Then you spend 20 minutes trying to remember what was actually decided.

There's a better way.

→ velnot.app

---

**Post 2 — Product:**
Velnot does 3 things:

1. Records your meeting (any app, one click)
2. Transcribes everything accurately
3. Generates an action plan — not a summary wall

Windows desktop app. No bots. No integrations. Just works.

→ velnot.app

---

**Post 3 — Builder story:**
6 months ago I started building a meeting recorder in my spare time.

The hardest part wasn't the AI.
It was Windows audio capture.
And positioning.
And pricing.
And convincing people to pay.

Today it's live.

→ velnot.app  #buildinpublic

---

**Post 4 — Insight:**
"AI meeting summarizer" is the wrong frame.

Nobody wants a summary. They want to know:
- What was decided
- What they need to do
- Who's responsible for what

That's an action plan. That's what Velnot generates.

→ velnot.app

---

**Post 5 — Social proof angle:**
Three people attend the same meeting.

They walk out with three different versions of what was decided.

Two weeks later, nothing happened. Everyone thinks it's someone else's fault.

Recording your meetings fixes this. → velnot.app

---

## 6. Key Messages

| Message | Use when |
|--------|----------|
| "Stop taking notes. Start getting action plans." | Primary tagline |
| "Not a transcript. An action plan." | Differentiator |
| "Works with any meeting software — no integrations" | Objection: "does it work with X?" |
| "One click. Stays on your machine." | Privacy / simplicity angle |
| "14 languages" | International / multilingual teams |
| "Solo-built. No VC. Priced honestly." | #buildinpublic authenticity |
| "Free tier to try" | Conversion hook |

---

## 7. Posting Schedule (after LS goes live)

| Day | Platform | Post |
|-----|----------|------|
| Day 1 (Mon) | r/SideProject | Launch post |
| Day 1 (Mon) | Twitter/X | Post 3 (builder story) |
| Day 2 (Tue) | Hacker News | Show HN |
| Day 3 (Wed) | r/productivity | Pain point post |
| Day 3 (Wed) | Twitter/X | Post 1 (pain hook) |
| Day 4 (Thu) | IndieHackers | Builder story |
| Day 4 (Thu) | Twitter/X | Post 4 (insight) |
| Day 5 (Fri) | Product Hunt | Full launch |
| Day 6 (Sat) | Twitter/X | Post 2 (product) |
| Day 7 (Sun) | r/Entrepreneur | Team angle post |
| Day 7 (Sun) | r/artificial | Technical post |
