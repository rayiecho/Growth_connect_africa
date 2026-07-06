path = "components/forms/ApplicationForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add the visible Industry input, right after Business Name field
old_field = """          <Field label="Business Name" required>
            <TextInput
              required
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
            />
          </Field>"""

new_field = old_field + """

          <Field label="Industry" required>
            <TextInput
              required
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
            />
          </Field>"""

content = content.replace(old_field, new_field, 1)

# Add industry to the Supabase insert
content = content.replace(
    "business_name: form.businessName,",
    "business_name: form.businessName,\n      industry: form.industry,",
    1
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
