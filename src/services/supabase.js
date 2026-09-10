import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[name];
    }
  } catch {
    // fallback
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name];
    }
  } catch {
    // fallback
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Save a newly submitted problem to Supabase
 */
export async function persistProblemReport(problemData) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null, isMock: true };
  }

  try {
    const { data, error } = await supabase
      .from('problems')
      .insert([
        {
          title: problemData.title,
          description: problemData.description,
          category: problemData.category,
          location: problemData.location,
          evidence_file_name: problemData.fileName || null,
          status: 'analyzing',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, isMock: false };
  } catch (err) {
    console.error('Failed to persist problem report to Supabase:', err);
    return { data: null, error: err, isMock: false };
  }
}

/**
 * Save AI analysis results and matched partners to Supabase
 */
export async function persistProblemAnalysis(problemId, aiAnalysis, partnerMatches) {
  if (!isSupabaseConfigured || !problemId) {
    return { data: null, error: null, isMock: true };
  }

  try {
    // 1. Insert analysis record
    const { data: analysisRecord, error: analysisErr } = await supabase
      .from('problem_analyses')
      .insert([
        {
          problem_id: problemId,
          primary_classification: aiAnalysis.primaryClassification,
          severity: aiAnalysis.severity,
          confidence: aiAnalysis.confidence,
          required_expertise: aiAnalysis.requiredExpertise,
          extracted_keywords: aiAnalysis.extractedKeywords,
          root_causes: aiAnalysis.rootCauses,
          reasoning: aiAnalysis.reasoning,
        },
      ])
      .select()
      .single();

    if (analysisErr) throw analysisErr;

    // 2. Insert partner match records
    if (partnerMatches && partnerMatches.length > 0) {
      const matchRows = partnerMatches.map((p) => ({
        problem_id: problemId,
        institution_name: p.name,
        institution_type: p.type === 'UNIVERSITY MATCH' ? 'UNIVERSITY' : 'INDUSTRY',
        match_score: p.score,
        reasons: p.reasons,
      }));

      const { error: matchErr } = await supabase
        .from('partner_matches')
        .insert(matchRows);

      if (matchErr) console.warn('Could not insert partner matches:', matchErr);
    }

    // 3. Update problem status
    await supabase
      .from('problems')
      .update({ status: 'analyzed' })
      .eq('id', problemId);

    return { data: analysisRecord, error: null, isMock: false };
  } catch (err) {
    console.error('Failed to persist analysis to Supabase:', err);
    return { data: null, error: err, isMock: false };
  }
}
