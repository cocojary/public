import fs from 'fs';
import path from 'path';

const CACHE_PATH = path.join(__dirname, 'ai_answers_cache.json');
const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));

// Persona 31: Random Response
const p31 = cache.personas['31'];
if (p31) {
  for (const id in p31.answers) {
    p31.answers[id] = Math.floor(Math.random() * 5) + 1; // True random 1-5
  }
}

// Persona 34: Nay-Saying
// Nay-saying means they systematically deny everything (mostly 1 or 2)
const p34 = cache.personas['34'];
if (p34) {
  for (const id in p34.answers) {
    p34.answers[id] = Math.random() > 0.8 ? 2 : 1; 
  }
}

fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
console.log('Fixed Persona 31 (True Random) & 34 (True Nay-Saying) answers in cache');
