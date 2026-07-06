path = "components/forms/ApplicationForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "businessName: string;",
    "businessName: string;\n  industry: string;",
    1
)
content = content.replace(
    'businessName: "",',
    'businessName: "",\n  industry: "",',
    1
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
