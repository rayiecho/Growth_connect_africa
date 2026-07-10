import { NextRequest, NextResponse } from "next/server";
import { firestoreQueryOrdered, firestoreUpdate } from "@/lib/firebase/rest-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      email, 
      action,
      preferred_name,
      alternate_phone,
      linkedin,
      consent_stored
    } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // 1. Verify if the applicant exists in Firestore
    const queryResults = await firestoreQueryOrdered(
      "applicants",
      [{ field: "email", op: "EQUAL", value: email.trim().toLowerCase() }],
      "email",
      "ASCENDING",
      1
    );

    if (queryResults.length === 0) {
      return NextResponse.json({ error: "No matching application found for this email address." }, { status: 404 });
    }

    // Access individual array indices from firestoreQueryOrdered result
    const docRef = queryResults[0].ref.name;
    const applicantData = queryResults[0].data() as any;

    // 2. Action Switch: Lookup Profiles or Generate New IDs
    if (action === "lookup") {
      return NextResponse.json({ 
        success: true, 
        hasId: !!applicantData.lpx_id,
        data: applicantData 
      });
    }

    if (action === "generate") {
      if (applicantData.lpx_id) {
        return NextResponse.json({ 
          success: true, 
          message: "ID already generated.", 
          lpx_id: applicantData.lpx_id 
        });
      }

      if (!consent_stored) {
        return NextResponse.json({ error: "Data processing consent is mandatory." }, { status: 400 });
      }

      // Generate a permanent 10-digit random identifier
      const randomBits = Math.floor(1000000000 + Math.random() * 9000000000);
      const generatedId = `LPX-${randomBits}`;

      const updatePayload: Record<string, any> = {
        lpx_id: generatedId,
        lpx_id_generated_at: new Date().toISOString(),
        current_stage: "LaunchpadX ID Activated",
        preferred_name: preferred_name?.trim() || null,
        alternate_phone: alternate_phone?.trim() || null,
        linkedin: linkedin?.trim() || null,
        consent_stored: true
      };

      await firestoreUpdate(docRef, updatePayload);

      return NextResponse.json({ 
        success: true, 
        lpx_id: generatedId 
      });
    }

    return NextResponse.json({ error: "Invalid action requested." }, { status: 400 });
  } catch (err: any) {
    console.error("ID Generation route exception:", err);
    return NextResponse.json({ error: "Internal transaction failure." }, { status: 500 });
  }
}
