import { config } from 'dotenv';
config();

import '@/ai/flows/nudge-for-missing-data.ts';
import '@/ai/flows/smart-trip-detection.ts';
import '@/ai/flows/co2-estimation.ts';
import '@/ai/flows/ai-trip-recommendation.ts';
import '@/ai/flows/suggest-hidden-gem.ts';
