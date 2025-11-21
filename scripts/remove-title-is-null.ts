// # 只扫描，不删除
// tsx scripts/remove-title-is-null.ts

// # 扫描并删除
// tsx scripts/remove-title-is-null.ts --delete
// # 或
// tsx scripts/remove-title-is-null.ts -d

import fs from "node:fs";
import path from "node:path";

function findEmptyNameFiles(dirPath: string, results: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // 递归处理子目录
      findEmptyNameFiles(fullPath, results);
    } else if (file.endsWith(".md")) {
      // 检查文件名（去掉 .md 扩展名）是否为空
      const fileName = path.basename(file, ".md");

      if (!fileName || fileName.trim() === "" || file === ".md") {
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

  console.log("开始扫描 poems 目录...\n");
  const emptyNameFiles = findEmptyNameFiles(poemsDir);

  if (emptyNameFiles.length === 0) {
    console.log("✓ 未发现文件名为空的 .md 文件");
    return;
  }

  console.log(`发现 ${emptyNameFiles.length} 个文件名为空的文件:\n`);
  emptyNameFiles.forEach((file) => {
    console.log(file);
  });

  if (shouldDelete) {
    console.log("\n开始删除文件...\n");
    deleteFiles(emptyNameFiles);
  } else {
    console.log("\n提示: 使用 --delete 或 -d 参数来删除这些文件");
    console.log("示例: tsx scripts/remove.ts --delete");
  }
}

main();
