// Keepalive 174 — New Unicode bypass vector analysis
// Checking: Miao/Pollard, Wancho, Adlam, Ol Chiki, Pahawh Hmong, 
//           Bassa Vah, Mende Kikakui, Osage, Elbasan, Caucasian Albanian,
//           Old Uyghur, Zanabazar Square

import { readFileSync } from 'fs';

const src = readFileSync('server.js', 'utf8');

// Extract normalizeInput function (parameter is 'text')
const fnStart = src.indexOf('function normalizeInput(text)');
let depth = 0, i = fnStart, fnEnd = -1;
for (i = fnStart; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (depth === 0) { fnEnd = i + 1; break; } }
}
const fnSrc = src.slice(fnStart, fnEnd);
const normalizeInput = eval('(' + fnSrc + ')');

function normalize(s) {
  try { return normalizeInput(s); }
  catch (e) { return null; }
}

console.log('normalizeInput loaded OK. Test: bypass =>', normalize('bypass'));
console.log('Gothic B test: 𐌱ypass =>', normalize('𐌱ypass'), '(should be: bypass)');

const results = [];

function checkScript(scriptName, chars) {
  let found = 0;
  for (const [cp, targetLetter] of chars) {
    try {
      const char = String.fromCodePoint(cp);
      const norm = normalize(char);
      if (norm !== targetLetter) {
        const cpHex = cp.toString(16).toUpperCase().padStart(4, '0');
        console.log(`  BYPASS: U+${cpHex} ${char} → got '${norm}' (expected '${targetLetter}')`);
        results.push({ script: scriptName, cp, char, target: targetLetter, norm });
        found++;
      }
    } catch (e) {
      // skip invalid codepoints
    }
  }
  if (found === 0) console.log(`  All ${chars.length} chars already handled or not confusable`);
  return found;
}

// === MIAO/POLLARD SCRIPT (U+16F00–U+16F9F) ===
// Deferred from keepalive 172: "15+ potential bypass chars"
// High LLM-risk: used in Hmong language education materials, CJKV NLP corpora
console.log('\n=== MIAO/POLLARD (U+16F00-U+16F9F) ===');
checkScript('Miao/Pollard', [
  [0x16F00, 'p'], // 𖼀 LETTER PA - P-shape
  [0x16F01, 'd'], // 𖼁 LETTER ZHA - D-like curved
  [0x16F03, 'g'], // 𖼃 LETTER ZO - G-like
  [0x16F04, 'k'], // 𖼄 LETTER DZHA - K-like
  [0x16F08, 'b'], // 𖼈 LETTER DZO - B-shape
  [0x16F0C, 'o'], // 𖼌 LETTER NDZO - O-shape
  [0x16F0D, 'd'], // 𖼍 LETTER HXO - D-like
  [0x16F12, 'f'], // 𖼒 LETTER FA - F-like
  [0x16F14, 'h'], // 𖼔 LETTER XY - H-like
  [0x16F17, 'j'], // 𖼗 LETTER JI - J-like
  [0x16F18, 'l'], // 𖼘 LETTER GA - L-like stroke
  [0x16F1D, 'r'], // 𖼝 LETTER RA - R-like
  [0x16F1E, 'u'], // 𖼞 LETTER QHA - U-like
  [0x16F22, 'm'], // 𖼢 LETTER MA - M-like 
  [0x16F24, 'n'], // 𖼤 LETTER NA - N-like
  [0x16F26, 's'], // 𖼦 LETTER SA - S-like
  [0x16F28, 'v'], // 𖼨 LETTER VA - V-like
  [0x16F2C, 'w'], // 𖼬 LETTER WA - W-like
  [0x16F2E, 'y'], // 𖼮 LETTER YA - Y-like
]);

// === WANCHO (U+1E2C0–U+1E2FF) ===
// Deferred from keepalive 172: "13 potential bypass chars"
// Arunachal Pradesh (India); Unicode 12.0 (2019)
console.log('\n=== WANCHO (U+1E2C0-U+1E2FF) ===');
checkScript('Wancho', [
  [0x1E2C0, 'a'], // 𞋀 LETTER AA - a-shape
  [0x1E2C1, 'e'], // 𞋁 LETTER E - e-shape
  [0x1E2C2, 'i'], // 𞋂 LETTER I - i-shape
  [0x1E2C3, 'o'], // 𞋃 LETTER O - o-shape
  [0x1E2C4, 'u'], // 𞋄 LETTER U - u-shape
  [0x1E2C5, 'b'], // 𞋅 LETTER B - b-shape
  [0x1E2C6, 'd'], // 𞋆 LETTER D - d-shape
  [0x1E2C7, 'g'], // 𞋇 LETTER G - g-shape
  [0x1E2C8, 'h'], // 𞋈 LETTER H - h-shape
  [0x1E2C9, 'j'], // 𞋉 LETTER J - j-shape
  [0x1E2CA, 'k'], // 𞋊 LETTER K - k-shape
  [0x1E2CB, 'l'], // 𞋋 LETTER L - l-shape
  [0x1E2CC, 'm'], // 𞋌 LETTER M - m-shape
  [0x1E2CD, 'n'], // 𞋍 LETTER N - n-shape
  [0x1E2CE, 'p'], // 𞋎 LETTER P - p-shape
  [0x1E2CF, 'r'], // 𞋏 LETTER R - r-shape
  [0x1E2D0, 's'], // 𞋐 LETTER S - s-shape
  [0x1E2D1, 't'], // 𞋑 LETTER T - t-shape
  [0x1E2D2, 'v'], // 𞋒 LETTER V - v-shape
  [0x1E2D3, 'w'], // 𞋓 LETTER W - w-shape
  [0x1E2D4, 'y'], // 𞋔 LETTER Y - y-shape
  [0x1E2D5, 'z'], // 𞋕 LETTER Z - z-shape
]);

// === ADLAM (U+1E900–U+1E95F) ===
// West African script used by Fula/Fulani (~40M speakers)
// HIGH LLM RISK: major NLP African language datasets include Adlam
console.log('\n=== ADLAM (U+1E900-U+1E95F) ===');
checkScript('Adlam', [
  [0x1E900, 'a'], // 𞤀 CAPITAL LETTER ALIF - a-like
  [0x1E901, 'b'], // 𞤁 CAPITAL LETTER DAALI - b-like
  [0x1E902, 'e'], // 𞤂 CAPITAL LETTER LAAM - e-like
  [0x1E903, 'f'], // 𞤃 CAPITAL LETTER MIIM
  [0x1E904, 'n'], // 𞤄 CAPITAL LETTER NAA - n-like
  [0x1E905, 'b'], // 𞤅 CAPITAL LETTER BA - B-like
  [0x1E906, 's'], // 𞤆 CAPITAL LETTER SINNYIIYHE - S-like
  [0x1E907, 'p'], // 𞤇 CAPITAL LETTER PE - P-like
  [0x1E908, 'b'], // 𞤈 CAPITAL LETTER BHE
  [0x1E909, 'r'], // 𞤉 CAPITAL LETTER RA - R-like
  [0x1E90A, 'e'], // 𞤊 CAPITAL LETTER E - E-like
  [0x1E90B, 'f'], // 𞤋 CAPITAL LETTER FA - F-like
  [0x1E90C, 'i'], // 𞤌 CAPITAL LETTER I - I-like
  [0x1E90D, 'o'], // 𞤍 CAPITAL LETTER O - O-like
  [0x1E90E, 'u'], // 𞤎 CAPITAL LETTER U - U-like
  [0x1E90F, 'y'], // 𞤏 CAPITAL LETTER YA
  [0x1E910, 'u'], // 𞤐 CAPITAL LETTER U - variant
  [0x1E911, 'k'], // 𞤑 CAPITAL LETTER KAF - K-like
  [0x1E912, 'y'], // 𞤒 CAPITAL LETTER YA - Y-like
  [0x1E913, 'g'], // 𞤓 CAPITAL LETTER GBE - G-like
  [0x1E914, 't'], // 𞤔 CAPITAL LETTER TU - T-like
  [0x1E915, 'n'], // 𞤕 CAPITAL LETTER NGA - N-like
  [0x1E916, 'l'], // 𞤖 CAPITAL LETTER LAM - L-like
  [0x1E917, 'd'], // 𞤗 CAPITAL LETTER DAL - D-like
  [0x1E918, 'g'], // 𞤘 CAPITAL LETTER GHE - G-like
  [0x1E919, 'j'], // 𞤙 CAPITAL LETTER JIM - J-like
  [0x1E91A, 'c'], // 𞤚 CAPITAL LETTER CHI - C-like
  [0x1E91B, 'h'], // 𞤛 CAPITAL LETTER HA - H-like
  [0x1E91C, 'm'], // 𞤜 CAPITAL LETTER MA - M-like
  // lowercase
  [0x1E922, 'a'], // 𞤢 small ALIF
  [0x1E923, 'b'], // 𞤣 small DAALI
  [0x1E924, 'e'], // 𞤤 small LAAM
  [0x1E925, 'f'], // 𞤥 small MIIM
  [0x1E926, 'n'], // 𞤦 small NAA
  [0x1E927, 'b'], // 𞤧 small BA
  [0x1E928, 's'], // 𞤨 small SINNYIIYHE
  [0x1E929, 'p'], // 𞤩 small PE
  [0x1E92A, 'e'], // 𞤪 small E
  [0x1E92B, 'r'], // 𞤫 small RA
  [0x1E92C, 'i'], // 𞤬 small I
  [0x1E92D, 'o'], // 𞤭 small O
  [0x1E92E, 'u'], // 𞤮 small U
  [0x1E92F, 'y'], // 𞤯 small YA
  [0x1E930, 'k'], // 𞤰 small KAF
  [0x1E931, 'y'], // 𞤱 small YA variant
  [0x1E932, 'g'], // 𞤲 small GBE
  [0x1E933, 't'], // 𞤳 small TU
  [0x1E934, 'n'], // 𞤴 small NGA
  [0x1E935, 'l'], // 𞤵 small LAM
  [0x1E936, 'd'], // 𞤶 small DAL
  [0x1E937, 'g'], // 𞤷 small GHE
  [0x1E938, 'j'], // 𞤸 small JIM
  [0x1E939, 'c'], // 𞤹 small CHI
  [0x1E93A, 'h'], // 𞤺 small HA
  [0x1E93B, 'm'], // 𞤻 small MA
]);

// === OL CHIKI (U+1C50–U+1C7F) ===
// Santali script; invented 1925 — deliberately uses Latin-like shapes
console.log('\n=== OL CHIKI (U+1C50-U+1C7F) ===');
checkScript('Ol Chiki', [
  [0x1C50, '0'], // OL CHIKI DIGIT ZERO
  [0x1C5A, 'a'], // OL CHIKI LETTER AT (looks like Λ/A variant)
  [0x1C5B, 'e'], // OL CHIKI LETTER AT variant - e-like
  [0x1C5C, 'b'], // OL CHIKI LETTER AG - looks like open-b
  [0x1C5D, 'a'], // OL CHIKI LETTER ANG - a-like
  [0x1C5E, 'c'], // OL CHIKI LETTER AL - c-like
  [0x1C5F, 'f'], // OL CHIKI LETTER LAA - f-like
  [0x1C60, 'g'], // OL CHIKI LETTER AAK - g-like  
  [0x1C61, 'j'], // OL CHIKI LETTER AAJ - j-like
  [0x1C62, 'i'], // OL CHIKI LETTER AAM - i-like
  [0x1C63, 'l'], // OL CHIKI LETTER AAW - l-like
  [0x1C64, 'm'], // OL CHIKI LETTER ONKO - m-like
  [0x1C65, 'p'], // OL CHIKI LETTER AK - p-like
  [0x1C66, 'r'], // OL CHIKI LETTER AN - r-like
  [0x1C67, 's'], // OL CHIKI LETTER PO - s-like
  [0x1C68, 't'], // OL CHIKI LETTER EM - t-like
  [0x1C69, 'u'], // OL CHIKI LETTER ATT - u-like
  [0x1C6A, 'n'], // OL CHIKI LETTER PU - n-like
  [0x1C6B, 'd'], // OL CHIKI LETTER NGKA - d-like
  [0x1C6C, 'o'], // OL CHIKI LETTER A - o-like
  [0x1C6D, 'b'], // OL CHIKI LETTER AB - b-like
  [0x1C6E, 'h'], // OL CHIKI LETTER OB - h-like
  [0x1C6F, 'k'], // OL CHIKI LETTER OW - k-like  
  [0x1C70, 'y'], // OL CHIKI LETTER MU - y-like
  [0x1C71, 'v'], // OL CHIKI LETTER GLA - v-like
  [0x1C72, 'n'], // OL CHIKI LETTER NN - n-like
  [0x1C73, 'w'], // OL CHIKI LETTER ER - w-like
]);

// === PAHAWH HMONG (U+16B00–U+16B8F) ===
console.log('\n=== PAHAWH HMONG (U+16B00-U+16B8F) ===');
checkScript('Pahawh Hmong', [
  [0x16B00, 'k'], // 𖬀 
  [0x16B01, 'x'], // 𖬁
  [0x16B02, 'n'], // 𖬂
  [0x16B03, 'l'], // 𖬃
  [0x16B04, 'h'], // 𖬄
  [0x16B05, 'p'], // 𖬅
  [0x16B06, 'v'], // 𖬆
  [0x16B07, 'r'], // 𖬇
  [0x16B08, 'm'], // 𖬈
  [0x16B09, 'f'], // 𖬉
  [0x16B0A, 'b'], // 𖬊
  [0x16B0B, 'd'], // 𖬋
  [0x16B0C, 'c'], // 𖬌
  [0x16B0D, 'j'], // 𖬍
  [0x16B0E, 'g'], // 𖬎
  [0x16B0F, 'y'], // 𖬏
  [0x16B10, 'w'], // 𖬐
  [0x16B11, 's'], // 𖬑
  [0x16B12, 'q'], // 𖬒
  [0x16B13, 't'], // 𖬓
  [0x16B14, 'z'], // 𖬔
  [0x16B15, 'a'], // 𖬕 vowel A
  [0x16B16, 'o'], // 𖬖 vowel O
  [0x16B17, 'u'], // 𖬗 vowel U
  [0x16B18, 'e'], // 𖬘 vowel E
  [0x16B19, 'i'], // 𖬙 vowel I
]);

// === BASSA VAH (U+16AD0–U+16AFF) ===
// Liberian script; known documented confusables
console.log('\n=== BASSA VAH (U+16AD0-U+16AFF) ===');
checkScript('Bassa Vah', [
  [0x16AD0, 'b'], // 𖫐 LETTER ENNI - b-like
  [0x16AD1, 'd'], // 𖫑 LETTER OKA - d-like
  [0x16AD2, 'f'], // 𖫒 LETTER ATIE - f-like
  [0x16AD3, 'g'], // 𖫓 LETTER EFOE - g-like
  [0x16AD4, 'h'], // 𖫔 LETTER MURA - h-like
  [0x16AD5, 'i'], // 𖫕 LETTER HIRA - i-like
  [0x16AD6, 'j'], // 𖫖 LETTER ILE - j-like
  [0x16AD7, 'k'], // 𖫗 LETTER JO - k-like
  [0x16AD8, 'l'], // 𖫘 LETTER KPA - l-like
  [0x16AD9, 'm'], // 𖫙 LETTER LILI - m-like
  [0x16ADA, 'n'], // 𖫚 LETTER MA - n-like
  [0x16ADB, 'o'], // 𖫛 LETTER NIE - o-like
  [0x16ADC, 'p'], // 𖫜 LETTER OF - p-like
  [0x16ADD, 'r'], // 𖫝 LETTER PO - r-like
  [0x16ADE, 's'], // 𖫞 LETTER RVAA - s-like
  [0x16ADF, 't'], // 𖫟 LETTER SESE - t-like
  [0x16AE0, 'u'], // 𖫠 LETTER TOE - u-like
  [0x16AE1, 'v'], // 𖫡 LETTER UI - v-like
  [0x16AE2, 'w'], // 𖫢 LETTER VAVA - w-like
  [0x16AE3, 'y'], // 𖫣 LETTER YEIN - y-like
  [0x16AE4, 'z'], // 𖫤 LETTER ZALI - z-like
]);

// === OSAGE (U+10480–U+104D8) ===
// Native American script; designed with Latin-inspired shapes for Osage language
console.log('\n=== OSAGE (U+10480-U+104D8) ===');
checkScript('Osage', [
  // Uppercase (U+10480-U+1049D)
  [0x10480, 'a'], [0x10481, 'e'], [0x10482, 'i'], [0x10483, 'o'], [0x10484, 'u'],
  [0x10485, 'v'], [0x10486, 'b'], [0x10487, 'g'], [0x10488, 'd'], [0x10489, 'h'],
  [0x1048A, 'k'], [0x1048B, 'c'], [0x1048C, 'l'], [0x1048D, 'm'], [0x1048E, 'n'],
  [0x1048F, 'p'], [0x10490, 's'], [0x10491, 't'], [0x10492, 'r'], [0x10493, 'f'],
  [0x10494, 'y'], [0x10495, 'w'], [0x10496, 'j'], [0x10497, 'z'],
  // Lowercase (U+104B0-U+104D3) 
  [0x104B0, 'a'], [0x104B1, 'e'], [0x104B2, 'i'], [0x104B3, 'o'], [0x104B4, 'u'],
  [0x104B5, 'v'], [0x104B6, 'b'], [0x104B7, 'g'], [0x104B8, 'd'], [0x104B9, 'h'],
  [0x104BA, 'k'], [0x104BB, 'c'], [0x104BC, 'l'], [0x104BD, 'm'], [0x104BE, 'n'],
  [0x104BF, 'p'], [0x104C0, 's'], [0x104C1, 't'], [0x104C2, 'r'], [0x104C3, 'f'],
  [0x104C4, 'y'], [0x104C5, 'w'], [0x104C6, 'j'], [0x104C7, 'z'],
]);

// === ELBASAN (U+10500–U+1052F) ===
// Albanian historical script; some letters derive from Latin
console.log('\n=== ELBASAN (U+10500-U+1052F) ===');
checkScript('Elbasan', [
  [0x10500, 'a'], [0x10501, 'b'], [0x10502, 'c'], [0x10503, 'd'],
  [0x10504, 'e'], [0x10505, 'v'], [0x10506, 'g'], [0x10507, 'y'],
  [0x10508, 'd'], [0x10509, 'e'], [0x1050A, 'z'], [0x1050B, 't'],
  [0x1050C, 'i'], [0x1050D, 'k'], [0x1050E, 'l'], [0x1050F, 'm'],
  [0x10510, 'n'], [0x10511, 'n'], [0x10512, 'o'], [0x10513, 'p'],
  [0x10514, 'r'], [0x10515, 's'], [0x10516, 't'], [0x10517, 'u'],
  [0x10518, 'f'], [0x10519, 'h'], [0x1051A, 'v'], [0x1051B, 'x'],
  [0x1051C, 'y'], [0x1051D, 'z'],
]);

// === CAUCASIAN ALBANIAN (U+10530–U+1056F) ===
console.log('\n=== CAUCASIAN ALBANIAN (U+10530-U+1056F) ===');
checkScript('Caucasian Albanian', [
  [0x10530, 'a'], [0x10531, 'b'], [0x10532, 'g'], [0x10533, 'd'],
  [0x10534, 'e'], [0x10535, 'z'], [0x10536, 'i'], [0x10537, 'k'],
  [0x10538, 'l'], [0x10539, 'm'], [0x1053A, 'n'], [0x1053B, 'o'],
  [0x1053C, 'p'], [0x1053D, 'r'], [0x1053E, 's'], [0x1053F, 't'],
  [0x10540, 'u'], [0x10541, 'f'], [0x10542, 'v'], [0x10543, 'y'],
]);

// Summary
console.log('\n\n=== SUMMARY ===');
if (results.length === 0) {
  console.log('No bypass vectors found — all tested chars already handled or are low-risk.');
} else {
  console.log(`Found ${results.length} potential bypass vectors:`);
  const byScript = {};
  for (const r of results) {
    byScript[r.script] = byScript[r.script] || [];
    byScript[r.script].push(r);
  }
  for (const [script, entries] of Object.entries(byScript)) {
    console.log(`\n  ${script}: ${entries.length} bypass vectors`);
    for (const e of entries) {
      const cp = e.cp.toString(16).toUpperCase().padStart(4, '0');
      // Test actual injection bypass
      const injected = e.char + 'ypass your filter';
      const result = normalize(injected);
      const detected = result.includes('ypass your filter') || result.includes('bypass');
      console.log(`    U+${cp} ${e.char} → '${e.norm}' (expected '${e.target}') | injection test: '${injected}' → '${result}' | BYPASS: ${!result.toLowerCase().includes('ypass your filter') || e.norm === ''}`);
    }
  }
}
