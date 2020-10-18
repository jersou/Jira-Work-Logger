#!/usr/bin/env -S deno run --allow-run

export async function getHamsterReport(begin: string, end: string, ignoreCateg?: string | null) {
  if ((await Deno.permissions.query({ name: "run" })).state !== "granted") {
    throw new Error(`Missing Deno run permission"`);
  }
  const hamsterReport = await Deno.run({
    cmd: ["hamster", "export", "tsv", begin, end],
    stdout: "piped",
  }).output();
  const lines = new TextDecoder().decode(hamsterReport).split("\n").slice(1);

  return lines
    .filter((line) => line)
    .map((line) => {
      const [comment, date, , minutes, category] = line.split("\t");
      return { comment, date, minutes, category };
    })
    .filter(({ comment, date, minutes, category }) => !ignoreCateg || !category || !category.match(ignoreCateg))
    .map(({ comment, date, minutes, category }) => {
      return {
        comment,
        date: date?.substr(0, 10),
        hours: Math.round((100 * parseFloat(minutes)) / 60) / 100,
      };
    });
}

if (import.meta.main) {
  console.log(await getHamsterReport("2020-01-01", "2020-12-31"));
}
