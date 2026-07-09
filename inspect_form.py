path = "components/forms/ApplicationForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the Supabase import
content = content.replace(
    'import { createClient } from "@/lib/supabase/client";\n',
    "",
    1
)

# Replace the whole Supabase insert block with a fetch call
old_block_start = content.find("const supabase = createClient();")
old_block_end = content.find("if (insertError) {")
old_block_end = content.find("}", content.find("return;", old_block_end)) + 1

if old_block_start == -1 or old_block_end == -1:
    print("MARKERS NOT FOUND - manual patch needed")
else:
    old_block = content[old_block_start:old_block_end]
    print("--- FOUND BLOCK TO REPLACE ---")
    print(old_block)
