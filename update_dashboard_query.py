path = "app/admin/dashboard/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = """  const { data: applicants } = await supabase
    .from("applicants")
    .select("id, first_name, last_name, email, current_stage, current_status, date_applied")
    .order("date_applied", { ascending: false });"""

new = """  const { data: applicants } = await supabase
    .from("applicants")
    .select(
      "id, first_name, last_name, email, phone, current_stage, current_status, date_applied, industry, business_name, business_stage, business_description, problem_solved, target_customers, monthly_revenue, use_of_funds, seeking_funding, funding_amount, business_registered, registration_number, existing_investors, hours_per_week, available_for_sessions, state_country, age_range, gender, linkedin, business_social, assigned_reviewer, notes, next_action_required"
    )
    .order("date_applied", { ascending: false });"""

content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done" if new in content else "NOT FOUND - check file")
