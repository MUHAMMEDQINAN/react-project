import { config } from 'dotenv';
config();

import '@/ai/flows/generate-anomaly-report.ts';
import '@/ai/flows/detect-anomalies.ts';
import '@/ai/flows/calculate-risk-score.ts';
