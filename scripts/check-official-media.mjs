import { existsSync } from "node:fs";
import { resolve } from "node:path";

const files = [
  "hero-transformacao.webp", "suelen-retrato.webp", "mega-hair-detalhe-01.webp",
  "mega-hair-detalhe-02.webp", "antes-01.webp", "depois-01.webp",
  ...Array.from({ length: 6 }, (_, index) => `transformacao-0${index + 1}.webp`),
  ...Array.from({ length: 3 }, (_, index) => `coloracao-0${index + 1}.webp`),
  "finalizacao-01.webp", "finalizacao-02.webp", "studio-ambiente-01.webp",
  "studio-ambiente-02.webp", "studio-ambiente-03.webp", "suelen-trabalho-01.webp",
  "equipe-01.webp", "equipe-02.webp",
];

const root = resolve("public/images/official");
const missing = files.filter((file) => !existsSync(resolve(root, file)));

if (missing.length) {
  console.error(`\nMídia oficial pendente (${missing.length} arquivos):\n- ${missing.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  console.log(`Todas as ${files.length} fotografias oficiais estão disponíveis.`);
}
