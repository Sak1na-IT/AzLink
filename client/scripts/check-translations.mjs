/*
 * Tərcümə yoxlaması: node scripts/check-translations.mjs
 *
 * - kodda t("...") ilə yazılmış hər mətnin en.ts-də tərcüməsi varmı
 * - {count} kimi yer tutucular hər iki dildə eynidirmi
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SRC = new URL("../src/", import.meta.url).pathname;

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(name)) files.push(path);
  }
};
walk(SRC);

const dictSource = readFileSync(join(SRC, "i18n/en.ts"), "utf8");
const en = JSON.parse(
  "{" +
    dictSource
      .slice(dictSource.indexOf("= {") + 3, dictSource.lastIndexOf("}"))
      .trim()
      .replace(/,\s*$/, "") +
    "}"
);

const unescape = (value) => value.replace(/\\"/g, '"').replace(/\\'/g, "'");
const pattern = /\bt\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`([^`$]*)`)/g;
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

let problems = 0;

for (const file of files) {
  if (file.endsWith("i18n/en.ts")) continue;
  const source = readFileSync(file, "utf8");

  for (const match of source.matchAll(pattern)) {
    const key = unescape(match[1] ?? match[2] ?? match[3]);

    if (!(key in en)) {
      console.log(`Tərcümə yoxdur: ${file.replace(SRC, "")}: ${JSON.stringify(key)}`);
      problems += 1;
    } else if (placeholders(key) !== placeholders(en[key])) {
      console.log(`Yer tutucular fərqlidir: ${JSON.stringify(key)} → ${JSON.stringify(en[key])}`);
      problems += 1;
    }
  }
}

for (const [key, value] of Object.entries(en)) {
  if (key.endsWith("#one") && placeholders(key.slice(0, -4)).replace("count", "").replace(/^,|,$/g, "") !== placeholders(value).replace("count", "").replace(/^,|,$/g, "")) {
    console.log(`Tək forma yer tutucuları fərqlidir: ${JSON.stringify(key)}`);
    problems += 1;
  }
}

console.log(problems === 0 ? `Hamısı qaydasındadır (${Object.keys(en).length} tərcümə).` : `${problems} problem tapıldı.`);
process.exit(problems === 0 ? 0 : 1);
