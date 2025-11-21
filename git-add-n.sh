#!/bin/bash

MAX_FILES_TO_ADD=${1:-100} # 默认值是 100

UNSTAGED_FILES=()
FILES_TO_ADD=()
COUNT=0

# 获取所有未暂存的文件
while IFS= read -r line; do
    # 提取文件名
    # 对于 M file 或 ?? file，文件名在第三个字符之后
    filename=$(echo "$line" | cut -c4-)
    
    if [[ -n "$filename" && (-f "$filename" || -d "$filename") ]]; then
        UNSTAGED_FILES+=("$filename")
    fi
done < <(git status --porcelain | grep -E '^(M|\?\?)')

for file in "${UNSTAGED_FILES[@]}"; do
    if (( COUNT < MAX_FILES_TO_ADD )); then
        FILES_TO_ADD+=("$file")
        COUNT=$((COUNT + 1))
    else
        break
    fi
done

if (( ${#FILES_TO_ADD[@]} > 0 )); then
    echo "Adding first $COUNT unstaged files out of ${#UNSTAGED_FILES[@]} available:"
    for file in "${FILES_TO_ADD[@]}"; do
        echo "  - $file"
    done
    git add "${FILES_TO_ADD[@]}"
    echo "Successfully added $COUNT files."
else
    echo "No unstaged files found to add."
fi