docs/developer-guide.md

How to run dev: npm install, npm run scaffold, npm run dev. How to register a manifest via POST /api/register. How to call /api/execute with a payload:

{
"selector":"agent/gemini@2.5",
"templateName":"research-analysis",
"context":{"topic":"quantum computing","activeDimensions":["analytical","creative"]}
}