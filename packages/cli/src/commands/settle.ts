import { Command } from "commander";
import { PipelineRunner } from "@actalk/inkos-core";
import { loadConfig, buildPipelineConfig, findProjectRoot, resolveBookId, log, logError } from "../utils.js";
import { formatWriteNextResultLines, resolveCliLanguage } from "../localization.js";

export const settleCommand = new Command("settle")
  .description("Settle the state for a chapter (Observer + Reflector)")
  .argument("[book-id]", "Book ID (auto-detected if only one book)")
  .argument("[chapter]", "Chapter number")
  .option("--json", "Output JSON")
  .action(async (bookIdArg, chapterArg, opts) => {
    try {
      const config = await loadConfig();
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);

      const pipeline = new PipelineRunner(buildPipelineConfig(config, root));

      const chapterNumber = chapterArg ? parseInt(chapterArg, 10) : undefined;

      if (!opts.json) log(`Settling state for chapter ${chapterNumber ?? 'latest'} of "${bookId}"...`);

      const result = await pipeline.repairChapterState(bookId, chapterNumber);

      if (opts.json) {
        log(JSON.stringify(result, null, 2));
      } else {
        const language = resolveCliLanguage(config.language);
        for (const line of formatWriteNextResultLines(language, {
          chapterNumber: result.chapterNumber,
          title: result.title,
          wordCount: result.wordCount,
          auditPassed: result.auditResult.passed,
          revised: result.revised,
          status: result.status,
          issues: result.auditResult.issues,
        })) {
          log(line);
        }
      }
    } catch (e) {
      if (opts.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Failed to settle chapter: ${e}`);
      }
      process.exit(1);
    }
  });
