import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_key || process.env.GEMINI_API_KEY) as string });

export const extractBillData = async (base64Image: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Extract all information from this K-Electric (KE) electricity bill image. 
    KE bills are from Karachi, Pakistan. 
    
    Fields to extract:
    1. Consumer Number (usually 12-14 digits)
    2. Billing Month (e.g., September 2024)
    3. Due Date (format: YYYY-MM-DD)
    4. Total Units Consumed
    5. Total Amount Payable (within due date)
    6. Peak and Off-Peak units if available
    7. All individual charges/taxes (Electricity Duty, Fuel Adjustment, Sales Tax, Income Tax, PTV Fee, etc.)
    
    For each charge, provide a simple explanation in English AND Urdu. 
    Identify if the user is in a "Slab Trap" (e.g., if they crossed 200 or 300 units by a small margin, leading into a much higher tariff).
    
    Respond strictly in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { 
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ] 
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          consumer_no: { type: Type.STRING },
          billing_month: { type: Type.STRING },
          due_date: { type: Type.STRING },
          units_consumed: { type: Type.NUMBER },
          total_amount: { type: Type.NUMBER },
          peak_units: { type: Type.NUMBER },
          off_peak_units: { type: Type.NUMBER },
          charges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                explanation_en: { type: Type.STRING },
                explanation_ur: { type: Type.STRING }
              },
              required: ["name", "amount", "explanation_en", "explanation_ur"]
            }
          },
          tax_slab_info: { type: Type.STRING },
          is_slab_trap: { type: Type.BOOLEAN }
        },
        required: ["consumer_no", "billing_month", "due_date", "units_consumed", "total_amount", "charges", "is_slab_trap"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Could not extract data from the bill. Please try a clearer photo.");
  }
};

export const extractSSGCBill = async (base64Image: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are analyzing an SSGC (Sui Southern Gas Company) bill from Pakistan.
    Extract ALL fields and return ONLY valid JSON with NO extra text, no markdown.

    Return exactly:
    {
      "bill_type": "SSGC",
      "customer_no": "",
      "bill_ref_id": "",
      "billing_month": "",
      "issue_date": "",
      "due_date": "",
      "tariff_class": "",
      "meter_no": "",
      "curr_reading": 0,
      "curr_reading_date": "",
      "prev_reading": 0,
      "prev_reading_date": "",
      "measured_qty_cms": 0,
      "gcv": 0,
      "mmbtu": 0,
      "gas_charges": 0,
      "meter_rent": 0,
      "fixed_charges": 0,
      "gst_standard": 0,
      "gst_further": 0,
      "withholding_tax": 0,
      "adjustments_debit": 0,
      "adjustments_credit": 0,
      "total_current_charges": 0,
      "previous_balance": 0,
      "payable_within_due_date": 0,
      "late_payment_surcharge": 0,
      "payment_after_due_date": 0,
      "gas_supply_deposit": 0,
      "cnic_registered": true,
      "monthly_history": [
        { "month": "APR-2026", "cms": 0, "amount": 0 }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Could not extract SSGC data. Please try a clearer photo.");
  }
};
