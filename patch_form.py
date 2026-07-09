path = "components/forms/ApplicationForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { createClient } from "@/lib/supabase/client";\n',
    "",
    1
)

old_block = """const supabase = createClient();
    const { error: insertError } = await supabase.from("applicants").insert({
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email.trim().toLowerCase(),
      age_range: form.ageRange,
      gender: form.gender,
      state_country: form.stateCountry,
      linkedin: form.linkedin || null,
      business_social: form.businessSocial || null,
      business_name: form.businessName,
      business_stage: form.businessStage,
      industry: form.industry,
      other_industry: form.otherIndustry || null,
      business_description: form.businessDescription,
      problem_solved: form.problemSolved,
      target_customers: form.targetCustomers,
      business_registered: form.businessRegistered,
      generates_revenue: form.generatesRevenue,
      revenue_progress: form.revenueProgress || null,
      growth_potential: form.growthPotential,
      long_term_vision: form.longTermVision,
      use_of_funds: form.useOfFunds,
      biggest_challenges: form.biggestChallenges.join(", "),
      attend_lagos_event: form.attendLagosEvent,
      why_considered: form.whyConsidered,
      commitment_confirmed: true,
      disclaimers_accepted: true,
      date_applied: new Date().toISOString(),
      current_stage: "Application Submitted",
      current_status: "Active",
    });
    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong submitting your application. Please try again.");
      return;
    }"""

new_block = """const res = await fetch("/api/public/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        email: form.email.trim().toLowerCase(),
        age_range: form.ageRange,
        gender: form.gender,
        state_country: form.stateCountry,
        linkedin: form.linkedin || null,
        business_social: form.businessSocial || null,
        business_name: form.businessName,
        business_stage: form.businessStage,
        industry: form.industry,
        other_industry: form.otherIndustry || null,
        business_description: form.businessDescription,
        problem_solved: form.problemSolved,
        target_customers: form.targetCustomers,
        business_registered: form.businessRegistered,
        generates_revenue: form.generatesRevenue,
        revenue_progress: form.revenueProgress || null,
        growth_potential: form.growthPotential,
        long_term_vision: form.longTermVision,
        use_of_funds: form.useOfFunds,
        biggest_challenges: form.biggestChallenges.join(", "),
        attend_lagos_event: form.attendLagosEvent,
        why_considered: form.whyConsidered,
        commitment_confirmed: true,
        disclaimers_accepted: true,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Something went wrong submitting your application. Please try again.");
      return;
    }"""

count = content.count(old_block)
content = content.replace(old_block, new_block, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Matched and replaced: {count == 1}")
