// Avvio di Chromium con fallback: prima il browser gestito da Playwright; se la versione non
// coincide (es. sandbox con browser preinstallato) usa CHROMIUM_PATH o /opt/pw-browsers/chromium.
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

export async function launchChromium() {
  try { return await chromium.launch(); } catch (e) {
    const candidates = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter(existsSync);
    if (!candidates.length) throw e;
    return chromium.launch({ executablePath: candidates[0], args: ['--no-sandbox'] });
  }
}
