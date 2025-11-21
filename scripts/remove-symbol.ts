// # 只扫描，不删除
// tsx scripts/remove-symbol.ts

// # 扫描并删除
// tsx scripts/remove-symbol.ts --delete
// # 或
// tsx scripts/remove-symbol.ts -d

import fs from "node:fs";
import path from "node:path";

function findFilesWithSymbol(dirPath: string, results: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // 递归处理子目录
      findFilesWithSymbol(fullPath, results);
    } else if (file.endsWith(".md")) {
      // 读取文件内容
      const content = fs.readFileSync(fullPath, "utf-8");

      // 检查是否包含 □ 符号
      if (content.includes("□")) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

function deleteFiles(files: string[]) {
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      fs.unlinkSync(file);
      console.log(`✓ 已删除: ${file}`);
      successCount++;
    } catch (error) {
      console.error(`✗ 删除失败: ${file}`, error);
      failCount++;
    }
  }

  console.log(`\n删除完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
}

function main() {
  const args = process.argv.slice(2);
  const shouldDelete = args.includes("--delete") || args.includes("-d");

  const poemsDir = path.resolve("poems");

  if (!fs.existsSync(poemsDir)) {
    console.error("错误: poems 目录不存在");
    process.exit(1);
  }

  console.log('开始扫描包含 "□" 符号的文件...\n');
  const filesWithSymbol = findFilesWithSymbol(poemsDir);

  if (filesWithSymbol.length === 0) {
    console.log('✓ 未发现包含 "□" 符号的文件');
    return;
  }

  console.log(`发现 ${filesWithSymbol.length} 个包含 "□" 符号的文件:\n`);
  filesWithSymbol.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  if (shouldDelete) {
    console.log("\n开始删除文件...\n");
    deleteFiles(filesWithSymbol);
  } else {
    console.log("\n提示: 使用 --delete 或 -d 参数来删除这些文件");
    console.log("示例: tsx scripts/remove-symbol.ts --delete");
  }
}

main();
