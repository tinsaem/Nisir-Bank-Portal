import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Pull real employee names from the HR table
const { rows: emps } = await client.query(
  `SELECT "employeeId", "fullName" FROM "HrEmployee"
   WHERE "employeeId" IN ('EMP-023','EMP-047','EMP-015','EMP-061','EMP-082','EMP-003','EMP-038')
   ORDER BY "employeeId"`
);

function emp(id) {
  const found = emps.find((e) => e.employeeId === id);
  return { employeeId: id, authorName: found?.fullName ?? id };
}

const discussions = [
  {
    ...emp("EMP-023"),
    category: "phishing",
    title: "I received a suspicious email — was it a test?",
    body: `Hi team,

I got an email earlier today from "ITSupport@nisir-maintenance.et" asking me to verify my account credentials through a portal link. The email mentioned urgent system maintenance and said my access would be suspended within 24 hours if I didn't act.

I didn't click anything — I came here first. Has anyone else received something like this? Is it a real IT request or a drill? I don't want to ignore something important, but it felt off.`,
    replies: [
      { ...emp("EMP-047"), body: "Good instinct not to click! A few red flags you spotted correctly: the domain is 'nisir-maintenance.et', not our official nisirbank.et domain. Legitimate IT will never ask for credentials via email. Report it to security@nisirbank.et." },
      { ...emp("EMP-082"), body: "This is almost certainly a phishing simulation or a real phishing attempt. The 24-hour urgency is a classic social engineering tactic. Always verify with IT directly by calling Ext. 4000 — never through a link in the email itself." },
    ],
  },
  {
    ...emp("EMP-047"),
    category: "password",
    title: "How do you manage passwords for all our systems?",
    body: `I access several systems every day — core banking, loan management, the reporting portal, and email. I keep forgetting one password or getting locked out.

I know reusing passwords is a security risk, but managing unique passwords for each system is really hard without writing them down somewhere. What strategies do experienced colleagues use? Is there an approved way to handle this within bank policy?`,
    replies: [
      { ...emp("EMP-015"), body: "The IT Security team recommends using a passphrase approach — three or four unrelated words joined together (e.g., 'coffee-lamp-river-22'). They're long enough to be secure but easier to remember than random characters." },
      { ...emp("EMP-003"), body: "I asked IT about a password manager last quarter. They said KeePass is approved for offline use on bank devices. You keep one master password and it generates/stores all the others. Might be worth requesting formal guidance from IT Security." },
      { ...emp("EMP-061"), body: "Whatever method you use, please never write passwords on sticky notes near your workstation! I've seen this happen and it's a serious audit finding. The passphrase tip from above is genuinely useful." },
    ],
  },
  {
    ...emp("EMP-015"),
    category: "policy",
    title: "Question: can we include customer account numbers in internal emails?",
    body: `I've been reading the NBE data privacy circular that was shared in the resources section. Section 4.2 covers handling of customer PII in internal communications.

I'm not entirely clear on one point: when escalating a customer issue internally, can we include masked account numbers (e.g., ****1234) in the email body, or must we always use the secure document management system instead?

Can someone from compliance or IT Security clarify? I want to make sure our team's workflow is compliant before the next internal audit.`,
    replies: [
      { ...emp("EMP-082"), body: "Great question. Masked account numbers (last 4 digits only) are generally acceptable in internal email for operational purposes. Full account numbers should always go through the secure document system or be communicated verbally. If in doubt, contact the Compliance team on Ext. 4200 for a written confirmation." },
      { ...emp("EMP-038"), body: "Same rule applies to national ID numbers and phone numbers — partial masking is the minimum standard. The full NBE directive is in the Resources section of this portal. Recommend all staff in customer-facing roles read section 4 carefully." },
    ],
  },
  {
    ...emp("EMP-061"),
    category: "tips",
    title: "My personal checklist for spotting phishing emails",
    body: `After the phishing awareness training, I started building a mental checklist for every email I receive. Sharing it here in case it helps anyone:

1. Check the actual sender domain (hover over the name) — not just the display name
2. Does the email create urgency or fear? ("Your account will be suspended in 24 hours")
3. Is it asking me to click a link or provide credentials?
4. Does the link URL match what the text says? (hover before clicking)
5. Did I expect this email? Was I waiting for this type of message?
6. Are there spelling errors or awkward phrasing?

If I answer YES to two or more of checks 2–6, I treat the email as suspicious and report it without clicking anything.

What other checks do colleagues use?`,
    replies: [
      { ...emp("EMP-023"), body: "I also check whether my name appears in the greeting. Phishing emails often use generic greetings like 'Dear Staff Member' or 'Dear Customer'. Real internal comms usually address you by name." },
      { ...emp("EMP-003"), body: "Number 4 is the most important one for me. I've started hovering over every link before clicking — even from people I know, since their account could be compromised. It takes two extra seconds and has already saved me from one suspicious link." },
      { ...emp("EMP-047"), body: "Great list. I'd add: check if the attachment type makes sense. A PDF from HR is normal; an .exe file or a password-protected zip from an unknown sender is not. Unexpected attachments with password protection are a major red flag." },
      { ...emp("EMP-038"), body: "This should be pinned for everyone to see. One thing I'd emphasize: when in doubt, NEVER click. Just pick up the phone and verify directly with the sender. A few seconds of verification can prevent hours of incident response work." },
    ],
  },
  {
    ...emp("EMP-082"),
    category: "incident",
    title: "What is the exact procedure if you accidentally click a suspicious link?",
    body: `For general awareness — not because this happened to me, but because I want to be prepared.

If someone accidentally clicks a link in a suspicious email before realising it might be phishing, what is the exact procedure?

- Stop using the device immediately?
- Call IT on Ext. 4000 or the SOC on Ext. 4444?
- Fill out an incident report form?
- How quickly does it need to be reported?

I want to know the step-by-step process so that if it ever happens I don't panic and waste time trying to figure out the right channel.`,
    replies: [
      { ...emp("EMP-047"), body: "The official steps are: (1) Stop using the device immediately — don't try to close the browser or 'fix' anything yourself. (2) Call the Security Operations Centre on Ext. 4444 — they operate 24/7. (3) Do NOT power off the device unless instructed — the SOC may need to capture forensic evidence. (4) Fill in an incident report form afterward (available on the IT intranet)." },
      { ...emp("EMP-015"), body: "Reporting speed matters a lot. The SOC told me that within the first 15–30 minutes they can usually contain a potential compromise before credentials are harvested or malware executes. The longer you wait, the worse it can get. Call immediately — they will not judge you for making a mistake." },
      { ...emp("EMP-023"), body: "One extra point: if you entered any credentials on the suspicious page before realising, tell the SOC that immediately. They'll need to trigger a password reset across affected systems as a priority. Disclosing this quickly makes a huge difference to the response outcome." },
    ],
  },
];

// Insert discussions and their replies
let inserted = 0;
for (const d of discussions) {
  const { rows: [disc] } = await client.query(
    `INSERT INTO "Discussion" (id, "employeeId", "authorName", title, body, category, "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW() - (random() * INTERVAL '2 hours'), NOW())
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [d.employeeId, d.authorName, d.title, d.body, d.category]
  );
  if (!disc) { console.log(`Skipped (conflict): ${d.title}`); continue; }

  for (const r of d.replies) {
    await client.query(
      `INSERT INTO "DiscussionReply" (id, "discussionId", "employeeId", "authorName", body, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW() - (random() * INTERVAL '90 minutes'))`,
      [disc.id, r.employeeId, r.authorName, r.body]
    );
  }
  inserted++;
  console.log(`✓ "${d.title}" (${d.replies.length} replies)`);
}

await client.end();
console.log(`\nSeeded ${inserted} discussions.`);
