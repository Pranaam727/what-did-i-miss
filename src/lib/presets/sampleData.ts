export interface SamplePreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  rawChat: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'incident-outage',
    title: '🚨 Sev-1 Incident: Payment Gateway 502 Outage',
    badge: 'Critical Urgency',
    description: 'High-stakes production outage with emergency rollbacks, customer impact, and hotfix deadlines.',
    rawChat: `[10/09/2026, 14:02:11] Sarah Jenkins: @channel EMERGENCY: Payment gateway is returning 502 Bad Gateway errors across all regions!
[10/09/2026, 14:03:05] Dave Miller: Confirmed. Error rate spiked to 84% in the last 5 minutes. Checkout is completely blocked.
[10/09/2026, 14:03:40] Sarah Jenkins: @PRANAAM we need you immediately on the incident bridge! Can you check the API connection pool?
[10/09/2026, 14:05:12] PRANAAM: Looking into it now. The database connection pool is maxed out at 200 connections after the 2.4.2 deployment.
[10/09/2026, 14:06:30] Dave Miller: Was there a migration that didn't close connections?
[10/09/2026, 14:07:15] PRANAAM: Yes, the new webhook retry loop has an unhandled connection leak.
[10/09/2026, 14:08:00] Sarah Jenkins: We decided to roll back to release v2.4.1 immediately to restore service.
[10/09/2026, 14:09:22] Dave Miller: I will trigger the automated Kubernetes rollback now.
[10/09/2026, 14:11:45] Sarah Jenkins: Status page updated to "Investigating degraded payment services".
[10/09/2026, 14:13:10] Dave Miller: Rollback to v2.4.1 complete. Pods are healthy again.
[10/09/2026, 14:14:02] PRANAAM: Connection counts normalized back to 18. Error rates dropping to 0%.
[10/09/2026, 14:15:30] Sarah Jenkins: Great job. We need to submit the post-mortem report by 5:00 PM today.
[10/09/2026, 14:16:10] Sarah Jenkins: @PRANAAM please draft the technical root cause section before 4:30 PM.
[10/09/2026, 14:17:00] PRANAAM: Understood. I'll document the connection leak and prepare the regression test suite.`,
  },
  {
    id: 'protocolx-hackathon',
    title: '⚡ ProtocolX Hackathon: Final Crunch & Submission',
    badge: 'Hackathon Sprint',
    description: 'ProtocolX team coordinating local-first AI architecture, Vercel deployment, and submission deadlines.',
    rawChat: `Rohan [09:15 AM]: Good morning team! ProtocolX submission day is here. We have 4 hours left.
Maya [09:16 AM]: Hey everyone! What is our status on the "What Did I Miss?" micro-app?
PRANAAM [09:18 AM]: Core Next.js frontend and chat parsers for WhatsApp, Slack, and Discord are working.
Rohan [09:20 AM]: Remember the most critical constraint from the hackathon judges: strict local-first AI processing! No external APIs like OpenAI or Anthropic.
Maya [09:22 AM]: Agreed on using @xenova/transformers running client-side with WASM and Web Worker. That guarantees conversations never leave the browser.
Rohan [09:25 AM]: Perfect. We decided to feature the 100% Client-Side Privacy Auditor badge prominently on the dashboard.
Maya [09:30 AM]: @PRANAAM please verify the Vercel deployment build and ensure all types pass.
PRANAAM [09:32 AM]: On it. Running next build and configuring Webpack fallbacks.
Rohan [09:40 AM]: Attention team: Submission portal closes at 11:59 PM sharp! We cannot afford a late submit.
Maya [09:45 AM]: Rohan to record the 2-minute demo video showing local processing with network disabled.
Rohan [09:46 AM]: I will record the walkthrough as soon as PRANAAM deploys the live link.
Maya [09:50 AM]: Don't forget to update the README with the mandatory Gen AI attribution section crediting PRANAAM as the author.
PRANAAM [09:55 AM]: All set. Pushing commits with clear semantic git messages.`,
  },
  {
    id: 'product-launch',
    title: '🚀 Product Launch V2: Go-To-Market Sync',
    badge: 'Product Sync',
    description: 'Product team planning rollout strategy, marketing assets, and executive sign-offs.',
    rawChat: `Elena: Morning team! Launch day minus 2 days. Let's do a quick sync on blockers.
Vikram: Frontend QA sign-off is completed. Performance score is 98 on mobile.
Marcus: Marketing emails are staged in Customer.io. We have 14,000 users in the early access segment.
Elena: Did we decide on the default theme setting for new signups?
Vikram: We decided to set Dark Mode as default based on the A/B test results showing +18% retention.
Elena: Approved. Let's go with Dark Mode.
Marcus: Press release is scheduled to go live tomorrow at 9:00 AM EST.
Elena: @PRANAAM can you make sure the analytics tracking script is capturing the new onboarding funnel?
PRANAAM: Yes, verified mixpanel and custom events on staging.
Elena: Awesome. Action item: Vikram will deploy the release build to production staging by 6 PM today.
Vikram: Will do.
Elena: Please make sure everyone is available on the war room channel tomorrow morning at 8:30 AM.`,
  },
];
