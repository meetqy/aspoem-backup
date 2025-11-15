// 针对 markdown 中标题中的其进行格式化 xxx・yyy
import fs from "node:fs";
import path from "node:path";

function formatMarkdownFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  let formatted = content;

  // 1. 匹配 title 字段，将连续的空格（≥1个）替换为"・"
  formatted = formatted.replace(/^(title:\s+)(.*)$/gm, (match, prefix, value) => {
    const newValue = value.replace(/\s+/g, "・");
    return `${prefix}${newValue}`;
  });

  // 2. 匹配 titlePinyin 字段，将连续的空格（≥2个）替换为"・"
  formatted = formatted.replace(/^(titlePinyin:\s+)(.*)$/gm, (match, prefix, value) => {
    const newValue = value.replace(/\s{2,}/g, "・");
    return `${prefix}${newValue}`;
  });

  if (content !== formatted) {
    fs.writeFileSync(filePath, formatted, "utf-8");
    console.log(`✓ 已格式化: ${filePath}`);

    // 显示 title 修改内容
    const titleMatch = content.match(/^title:\s+(.*)$/m);
    const newTitleMatch = formatted.match(/^title:\s+(.*)$/m);
    if (titleMatch && newTitleMatch && titleMatch[1] !== newTitleMatch[1]) {
      console.log(`  title: ${titleMatch[1]} -> ${newTitleMatch[1]}`);
    }

    // 显示 titlePinyin 修改内容
    const titlePinyinMatch = content.match(/^titlePinyin:\s+(.*)$/m);
    const newTitlePinyinMatch = formatted.match(/^titlePinyin:\s+(.*)$/m);
    if (titlePinyinMatch && newTitlePinyinMatch && titlePinyinMatch[1] !== newTitlePinyinMatch[1]) {
      console.log(`  titlePinyin: ${titlePinyinMatch[1]} -> ${newTitlePinyinMatch[1]}`);
    }
  }
}

function processDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    console.error(`错误: 路径不存在 ${dirPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(dirPath);

  if (stats.isFile() && dirPath.endsWith(".md")) {
    formatMarkdownFile(dirPath);
    return;
  }

  if (!stats.isDirectory()) {
    console.error(`错误: ${dirPath} 不是有效的目录或 markdown 文件`);
    process.exit(1);
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const fileStat = fs.statSync(fullPath);

    if (fileStat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".md")) {
      formatMarkdownFile(fullPath);
    }
  }
}

function validatePath(targetPath: string): boolean {
  const normalizedPath = path.normalize(targetPath);
  const pathParts = normalizedPath.split(path.sep).filter((p) => p && p !== ".");

  // 检查是否是 poems 目录本身
  if (pathParts[pathParts.length - 1] === "poems" || normalizedPath.endsWith("poems")) {
    return false;
  }

  // 检查路径中是否包含 poems，且 poems 后面还有子目录
  const poemsIndex = pathParts.indexOf("poems");
  if (poemsIndex !== -1 && poemsIndex === pathParts.length - 1) {
    return false;
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("用法: tsx scripts/format-title-qi.ts <目录路径>");
    console.error("示例: tsx scripts/format-title-qi.ts poems/cao-cao");
    console.error("注意: 不能直接传入 poems 目录，必须指定具体的子目录");
    process.exit(1);
  }

  const targetPath = args[0];

  if (!validatePath(targetPath)) {
    console.error("错误: 不能直接处理 poems 目录");
    console.error("请指定 poems 下的具体子目录，例如: poems/cao-cao");
    process.exit(1);
  }

  const absolutePath = path.resolve(targetPath);

  console.log(`开始处理: ${absolutePath}`);
  processDirectory(absolutePath);
  console.log("完成!");
}

main();
