# Unlabelled Plugin Manifest Purpose Audit

## Provenance

This point-in-time audit entered the local repository in commit `5ded92a` (`Expose unlabelled plugin purpose metadata`). It is a retained catalogue-analysis artifact, not a live runtime report. Run `capability-intelligence unlabelled` for the current environment.

## Scope

This local, read-only audit reviewed all 111 Codex catalogue plugin manifests that omit the standard manifest capability field. The source inventory was generated during the final local validation run.

Unlabelled means the publisher manifest does not contain the standard capability label list. It does not mean the plugin has no description or that Capability Intelligence executed it.

## Result

- Manifests reviewed: 111
- Records with at least one broad label inferred from safe manifest text: 78
- Records represented by publisher category and description without a broad label: 33
- Installed in the observed cache: 0
- Runtime verified: 0
- Every record has a safe description and at least one declared integration surface.

## Manifest Categories

| Category | Count |
| --- | ---: |
| Productivity | 34 |
| Finance | 23 |
| Business & Operations | 14 |
| Developer Tools | 10 |
| Data & Analytics | 8 |
| Education & Research | 7 |
| Communication | 6 |
| Creativity | 5 |
| Other | 2 |
| Travel | 2 |

## Broad Inferred Labels

| Label | Manifests |
| --- | ---: |
| research | 36 |
| data | 26 |
| communication | 15 |
| workflow | 12 |
| documents | 6 |
| deployment | 3 |
| code | 2 |
| design | 2 |
| security | 2 |
| video | 1 |

The labels above are conservative, token-aware domains derived from safe manifest text. A manifest may appear under more than one label. Records with no match in the current broad taxonomy still retain their publisher category and description below.

## Records Without Broad Labels

| Plugin | Category | Surfaces | Publisher description |
| --- | --- | --- | --- |
| Apollo | Business & Operations | apps=1 | Prospecting and outbound execution in Apollo |
| Attio | Business & Operations | apps=1 | Attio connects Codex directly to your CRM workspace, letting you manage customer relationships through na... |
| Clay | Business & Operations | apps=1 | Find and engage prospects |
| Close | Business & Operations | apps=1 | Reference and update Close CRM |
| Pipedrive | Business & Operations | apps=1 | Connect to sync Pipedrive deals and contacts for use in Codex. |
| BioRender | Creativity | apps=1 | BioRender helps scientists create professional figures in minutes. |
| Fal | Creativity | apps=1 | Generate and manage media with Fal models |
| Statsig | Developer Tools | apps=1 | Bring your Statsig workspace into Codex. |
| Brex | Finance | apps=1 | Connect Brex to Codex and review your company finances through natural conversation — at Codex speed. |
| KeyBid Puls | Finance | apps=1 | Unlock the profitability of short-term rental investments with our ROI Calculator app, tailored for platfor... |
| QuickBooks | Finance | apps=1 | Analyze finances and manage QuickBooks records |
| S&P Global | Finance | apps=1 | Query S&P Global financial datasets |
| Setu Bharat Connect BillPay | Finance | apps=1 | This app helps you pay your utility bills through simple conversation. |
| Stripe | Finance | skills=1, apps=1 | Payments and business tools |
| Taxdown | Finance | apps=1 | TaxDown te ayuda a resolver dudas fiscales en España, tanto para particulares como autónomos: deducciones,... |
| Third Bridge | Finance | apps=1 | Seamlessly incorporate critical context and trusted insights from industry experts as part of your financia... |
| Tinman AI | Finance | apps=1 | Tinman AI helps loan officers and underwriters quickly underwrite home financing scenarios and answer compl... |
| Cogedim | Other | apps=1 | Cogedim is one of France's leading real estate developers. |
| MyRegistry.com | Other | apps=1 | MyRegistry.com helps make gift-giving easy for friends & family to get you the gifts you really want! |
| ClickUp | Productivity | apps=1 | Turn Codex into your ClickUp command center. |
| Common Room | Productivity | apps=1 | Embed complete buyer intelligence directly within Codex. |
| Conductor | Productivity | apps=1 | The Conductor MCP server retrieves proprietary performance metrics regarding a brand's visibility, sentimen... |
| Docusign | Productivity | apps=1 | Automate contract creation and insights |
| Dovetail | Productivity | apps=1 | Connect Dovetail inside Codex to turn customer feedback into decisions without leaving your conversation. |
| Help Scout | Productivity | apps=1 | Connect to sync Help Scout mailboxes and conversations for use in Codex. |
| Jam | Productivity | apps=1 | Screen record with context |
| Linear | Productivity | skills=1, apps=1, mcpServers=1 | Find and reference issues and projects. |
| Ranked AI | Productivity | apps=1 | Ranked AI provides industry leading AI SEO & PPC software, with a fully managed service integrated into it. |
| Teamwork.com | Productivity | apps=1 | Connect to sync Teamwork projects and tasks for use in Codex. |
| United Rentals | Productivity | apps=1 | Get the right equipment for the job without guesswork. |
| Waldo | Productivity | apps=1 | Waldo is an AI-powered strategy platform for agencies and brands. |
| FINN | Travel | apps=1 | A FINN car subscription is a flexible way to stay mobile anytime - without long-term commitments like buyin... |
| WeatherPromise | Travel | apps=1 | Protect your trip with WeatherPromise and get back the full cost if it rains more than promised during your... |

## Complete Manifest Audit

| Plugin | Category | Broad labels | Evidence | Surfaces | Publisher description |
| --- | --- | --- | --- | --- | --- |
| Actively | Business & Operations | workflow | inferred | apps=1 | Account agents for GTM intelligence |
| Apollo | Business & Operations | not inferred | structural | apps=1 | Prospecting and outbound execution in Apollo |
| Attio | Business & Operations | not inferred | structural | apps=1 | Attio connects Codex directly to your CRM workspace, letting you manage customer relationships through na... |
| Carta CRM | Business & Operations | communication | inferred | apps=1 | Carta CRM helps investment teams stay on top of deal flow by keeping deals, companies, and relationships in... |
| Clay | Business & Operations | not inferred | structural | apps=1 | Find and engage prospects |
| Close | Business & Operations | not inferred | structural | apps=1 | Reference and update Close CRM |
| Demandbase | Business & Operations | communication, data, research | inferred | apps=1 | Demandbase integration with Codex gives sales, marketing, and GTM teams seamless access to rich B2B data... |
| Hebbia | Business & Operations | workflow, research | inferred | apps=1 | Institutional research and financial workflows |
| Intercom | Business & Operations | workflow | inferred | apps=1 | Customer conversations, contacts, tickets, and support workflows from Intercom |
| Outreach | Business & Operations | workflow | inferred | apps=1 | Revenue workflow automation with Outreach |
| Pipedrive | Business & Operations | not inferred | structural | apps=1 | Connect to sync Pipedrive deals and contacts for use in Codex. |
| Streak | Business & Operations | communication, workflow | inferred | apps=1 | Streak is a CRM built directly into Gmail, so you can track deals, contacts, and workflows from your inbox. |
| Zoho | Business & Operations | workflow | inferred | apps=1 | Manage Zoho CRM sales workflows |
| ZoomInfo | Business & Operations | research | inferred | apps=1 | Prospecting and account research with ZoomInfo |
| Circleback | Communication | communication | inferred | apps=1 | Circleback helps teams get the most out of every conversation with AI-powered meeting notes, action items,... |
| Fireflies | Communication | documents, communication | inferred | apps=1 | The Fireflies app brings your meetings and knowledge directly into Codex. |
| Fyxer | Communication | communication | inferred | apps=1 | Fyxer for Codex lets you write emails that sound like you, right from the chat. |
| Granola | Communication | communication | inferred | apps=1 | Granola MCP connects your meeting history to Codex so your assistant can pull real context from past conv... |
| Otter.ai | Communication | communication, workflow, research | inferred | apps=1 | The Otter.ai MCP server connects Codex to your meeting intelligence, enabling search and retrieval of tra... |
| Read AI | Communication | communication, workflow | inferred | apps=1 | Read AI brings your meeting intelligence directly into your AI workflows. |
| BioRender | Creativity | not inferred | structural | apps=1 | BioRender helps scientists create professional figures in minutes. |
| Canva | Creativity | design, research | inferred | skills=1, apps=1 | Search, create, edit designs |
| Fal | Creativity | not inferred | structural | apps=1 | Generate and manage media with Fal models |
| Picsart | Creativity | video, design | inferred | apps=1 | Generate videos, images, and audio |
| Shutterstock | Creativity | research | inferred | apps=1 | Search stock media libraries |
| Alation | Data & Analytics | data | inferred | apps=1 | Trusted enterprise data context and governance |
| Amplitude | Data & Analytics | data | inferred | apps=1 | Product analytics and funnels |
| Coupler.io | Data & Analytics | data, research | inferred | apps=1 | Analyze multi-channel marketing, financial, sales, e-commerce, and other business data within Codex by co... |
| MotherDuck | Data & Analytics | data | inferred | apps=1 | Connect AI assistants to your MotherDuck data warehouse. |
| Omni Analytics | Data & Analytics | data, security | inferred | apps=1 | Query Omni using the same semantic model, permissions, and logic defined by your data team directly from Codex. |
| Similarweb | Data & Analytics | data, research | inferred | apps=1 | Research web and app market intelligence |
| ThoughtSpot | Data & Analytics | data | inferred | apps=1 | Trusted business data answers |
| Windsor.ai | Data & Analytics | data, research | inferred | apps=1 | Windsor.ai connects your marketing and business data sources to Codex so you can ask questions in natural... |
| Cloudinary | Developer Tools | research | inferred | apps=1 | Manage, search, and transform your Cloudinary media library — directly from Codex. |
| Hostinger | Developer Tools | code | inferred | apps=1 | Hostinger Horizons lets you build real websites and apps just by describing what you want. |
| Lovable | Developer Tools | research | inferred | apps=1 | Create full-stack web apps from prompts |
| MarcoPolo | Developer Tools | data | inferred | apps=1 | MarcoPolo spins up a secure container where Codex can work with your actual data. |
| Quicknode | Developer Tools | deployment | inferred | apps=1 | Manage your Quicknode infrastructure directly in OpenAI. |
| Replit | Developer Tools | research | inferred | apps=1 | Create and iterate Replit web apps |
| SendGrid | Developer Tools | communication | inferred | apps=1 | Connector for interacting with the SendGrid email API. |
| Statsig | Developer Tools | not inferred | structural | apps=1 | Bring your Statsig workspace into Codex. |
| Vantage | Developer Tools | deployment | inferred | apps=1 | Vantage is a cloud observability and optimization platform that aggregates cloud infrastructure costs acros... |
| YepCode | Developer Tools | code | inferred | apps=1 | YepCode lets you build custom AI tools using your own code with JSON Schema-defined inputs, executed in an... |
| Dow Jones Factiva | Education & Research | research | inferred | apps=1 | The Factiva Connector, enables authorized users to search Factiva’s global news archive, including premium... |
| GovTribe | Education & Research | research | inferred | apps=1 | Search government contracts, awards, and vendors directly from Codex. |
| Midpage | Education & Research | research | inferred | skills=1, apps=1 | Legal research with cited case law |
| Particl Market Research | Education & Research | communication, research | inferred | apps=1 | Particl Market Research helps teams answer ecommerce research questions directly in Codex. |
| PolicyNote | Education & Research | research | inferred | apps=1 | Use the PolicyNote app to access structured policy and regulatory intelligence from around the world. |
| Readwise | Education & Research | research | inferred | apps=1 | The official app for Readwise and Reader. |
| Scite | Education & Research | research | inferred | apps=1 | Scite delivers answers grounded in peer-reviewed research you can verify. |
| Aiera | Finance | data | inferred | apps=1 | Institutional financial data and events |
| Alpaca | Finance | research | inferred | apps=1 | Stop watching the markets. |
| Binance | Finance | data, research | inferred | apps=1 | Binance for Codex lets you access and explore Binance public, read-only market data using natural language. |
| Brex | Finance | not inferred | structural | apps=1 | Connect Brex to Codex and review your company finances through natural conversation — at Codex speed. |
| CB Insights | Finance | workflow, research | inferred | apps=1 | Unleash Codex as your private markets research agent. |
| Chronograph GP | Finance | communication, data | inferred | skills=1, apps=1 | Trusted portfolio data for private capital GP teams |
| Chronograph LP | Finance | communication, data | inferred | skills=1, apps=1 | Trusted portfolio data for private capital LP teams |
| Cube | Finance | data | inferred | apps=1 | With the Cube MCP Server, you can: - Query live Cube data from actuals, budgets, forecasts, variances, and... |
| FactSet | Finance | data, workflow | inferred | apps=1 | Connect financial data, analytics, and workflows |
| Fiscal AI | Finance | data, security, research | inferred | apps=1 | Audit-ready financial data and equity research |
| KeyBid Puls | Finance | not inferred | structural | apps=1 | Unlock the profitability of short-term rental investments with our ROI Calculator app, tailored for platfor... |
| LSEG | Finance | data, research | inferred | apps=1 | Financial market data and analytics |
| MT Newswires | Finance | research | inferred | apps=1 | MT Newswires brings real-time global financial news directly into Codex — providing original, unbiased an... |
| PitchBook | Finance | data, research | inferred | apps=1 | PitchBook provides structured access to private capital market data across companies, investors, funds, de... |
| Quartr | Finance | data, research | inferred | apps=1 | Public company IR data and earnings research |
| QuickBooks | Finance | not inferred | structural | apps=1 | Analyze finances and manage QuickBooks records |
| Razorpay | Finance | data | inferred | apps=1 | Connect your Razorpay account to access your payment data through conversation. |
| S&P Global | Finance | not inferred | structural | apps=1 | Query S&P Global financial datasets |
| Setu Bharat Connect BillPay | Finance | not inferred | structural | apps=1 | This app helps you pay your utility bills through simple conversation. |
| Stripe | Finance | not inferred | structural | skills=1, apps=1 | Payments and business tools |
| Taxdown | Finance | not inferred | structural | apps=1 | TaxDown te ayuda a resolver dudas fiscales en España, tanto para particulares como autónomos: deducciones,... |
| Third Bridge | Finance | not inferred | structural | apps=1 | Seamlessly incorporate critical context and trusted insights from industry experts as part of your financia... |
| Tinman AI | Finance | not inferred | structural | apps=1 | Tinman AI helps loan officers and underwriters quickly underwrite home financing scenarios and answer compl... |
| Cogedim | Other | not inferred | structural | apps=1 | Cogedim is one of France's leading real estate developers. |
| MyRegistry.com | Other | not inferred | structural | apps=1 | MyRegistry.com helps make gift-giving easy for friends & family to get you the gifts you really want! |
| Box | Productivity | documents, research | inferred | skills=1, apps=1 | Search and reference your documents |
| Brand24 | Productivity | communication, research | inferred | apps=1 | The Brand24 app in Codex lets marketing and PR teams instantly explore brand mentions, sentiment, and med... |
| Calendly | Productivity | communication | inferred | apps=1 | Scheduling links, availability, and bookings |
| Channel99 | Productivity | research | inferred | apps=1 | Channel99 real time go to market intelligence connects Codex directly to Channel99’s performance marketin... |
| ClickUp | Productivity | not inferred | structural | apps=1 | Turn Codex into your ClickUp command center. |
| Common Room | Productivity | not inferred | structural | apps=1 | Embed complete buyer intelligence directly within Codex. |
| Conductor | Productivity | not inferred | structural | apps=1 | The Conductor MCP server retrieves proprietary performance metrics regarding a brand's visibility, sentimen... |
| Coveo | Productivity | research | inferred | apps=1 | Search your enterprise content |
| Datasite | Productivity | data | inferred | skills=1, apps=1 | Manage secure M&A data rooms |
| Docket | Productivity | documents | inferred | apps=1 | Docket AI makes your sales knowledge your instant superpower. |
| Docusign | Productivity | not inferred | structural | apps=1 | Automate contract creation and insights |
| Domotz (Preview) | Productivity | deployment | inferred | apps=1 | Monitor and manage your network infrastructure through natural language. |
| Dovetail | Productivity | not inferred | structural | apps=1 | Connect Dovetail inside Codex to turn customer feedback into decisions without leaving your conversation. |
| Egnyte | Productivity | documents | inferred | apps=1 | Work with documents and files stored in Egnyte directly from Codex. |
| Happenstance | Productivity | research | inferred | apps=1 | Happenstance searches your professional network using natural language to find the right people. |
| Help Scout | Productivity | not inferred | structural | apps=1 | Connect to sync Help Scout mailboxes and conversations for use in Codex. |
| HG Insights | Productivity | data | inferred | apps=1 | Prospect data and revenue intelligence |
| HighLevel | Productivity | workflow | inferred | apps=1 | HighLevel gives agencies a unified CRM, automation, and client communication platform. |
| Jam | Productivity | not inferred | structural | apps=1 | Screen record with context |
| Linear | Productivity | not inferred | structural | skills=1, apps=1, mcpServers=1 | Find and reference issues and projects. |
| Mem | Productivity | documents | inferred | apps=1 | Give Codex the full context of your second brain by connecting your Mem knowledge base. |
| Meticulate | Productivity | research | inferred | apps=1 | Research companies and similar targets |
| Monday.com | Productivity | workflow | inferred | apps=1 | A powerful MCP connector enabling AI agents to seamlessly interact with monday.com. |
| Network Solutions | Productivity | research | inferred | apps=1 | The Network Solutions Domain Search Assistant makes finding an available domain fast, simple, and conversat... |
| Pylon | Productivity | research | inferred | apps=1 | Access Pylon's customer support platform directly from Codex to search, manage, and resolve customer issues. |
| Ranked AI | Productivity | not inferred | structural | apps=1 | Ranked AI provides industry leading AI SEO & PPC software, with a fully managed service integrated into it. |
| Responsive | Productivity | data | inferred | apps=1 | The Responsive App makes it easy to work with your organization’s data inside Codex. |
| Rox | Productivity | data | inferred | apps=1 | Analyze sales data from Rox workspaces |
| Semrush | Productivity | data | inferred | apps=1 | The Semrush MCP provides structured, quantitative SEO and traffic data for domains, keywords, backlinks, an... |
| SignNow | Productivity | documents | inferred | apps=1 | Get documents signed faster without switching between tools. |
| SkyWatch | Productivity | research | inferred | apps=1 | Search and explore satellite imagery from top providers including Vantor, Planet, Airbus, and more, all in... |
| Teamwork.com | Productivity | not inferred | structural | apps=1 | Connect to sync Teamwork projects and tasks for use in Codex. |
| United Rentals | Productivity | not inferred | structural | apps=1 | Get the right equipment for the job without guesswork. |
| Waldo | Productivity | not inferred | structural | apps=1 | Waldo is an AI-powered strategy platform for agencies and brands. |
| FINN | Travel | not inferred | structural | apps=1 | A FINN car subscription is a flexible way to stay mobile anytime - without long-term commitments like buyin... |
| WeatherPromise | Travel | not inferred | structural | apps=1 | Protect your trip with WeatherPromise and get back the full cost if it rains more than promised during your... |

## Interpretation Boundaries

- Publisher descriptions and categories explain intended purpose; they do not prove behaviour.
- Inferred labels are not rewritten into the source manifests and are not reported as declared evidence.
- Presence in the catalogue does not prove installation, enablement, authentication, runnability, or verification.
- Capability Intelligence did not install, invoke, authenticate, update, or remove any plugin during this audit.
- Raw connector identifiers, install URLs, server origins, credentials, sessions, logs, and absolute home paths are excluded.

## Product Follow-On

The new read-only `capability-intelligence unlabelled` command makes this set inspectable in human and JSON modes. A richer business-domain taxonomy should be a separate product-model decision; Capability Intelligence should not silently replace missing publisher declarations with stronger claims.
