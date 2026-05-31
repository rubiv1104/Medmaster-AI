// ============================================================
// MedMaster AI — Syllabus Templates
// Used during onboarding to pre-populate the user's syllabus
// ============================================================

export interface TopicTemplate {
  name: string
  sort_order: number
}

export interface SectionTemplate {
  name: string
  sort_order: number
  topics: TopicTemplate[]
}

export interface BranchTemplate {
  branch: string
  syllabus_name: string
  sections: SectionTemplate[]
}

export const BRANCH_TEMPLATES: BranchTemplate[] = [
  // ──────────────────────────────────────────────────────────
  // MD KAYACHIKITSA (Internal Medicine)
  // ──────────────────────────────────────────────────────────
  {
    branch: 'MD Kayachikitsa',
    syllabus_name: 'MD Kayachikitsa Syllabus',
    sections: [
      {
        name: 'Jwara (Fever)',
        sort_order: 1,
        topics: [
          { name: 'Nidana & Samprapti of Jwara', sort_order: 1 },
          { name: 'Santata Jwara', sort_order: 2 },
          { name: 'Satataga Jwara', sort_order: 3 },
          { name: 'Anyedyushka Jwara', sort_order: 4 },
          { name: 'Tritiyaka Jwara', sort_order: 5 },
          { name: 'Chaturthaka Jwara', sort_order: 6 },
          { name: 'Vishama Jwara', sort_order: 7 },
          { name: 'Chikitsa of Jwara', sort_order: 8 },
          { name: 'Vataja, Pittaja, Kaphaja Jwara', sort_order: 9 },
          { name: 'Dhatugata Jwara', sort_order: 10 },
          { name: 'Agantuja Jwara', sort_order: 11 },
        ],
      },
      {
        name: 'Amavata',
        sort_order: 2,
        topics: [
          { name: 'Nidana of Amavata', sort_order: 1 },
          { name: 'Samprapti of Amavata', sort_order: 2 },
          { name: 'Lakshana of Amavata', sort_order: 3 },
          { name: 'Chikitsa of Amavata', sort_order: 4 },
          { name: 'Panchakarma in Amavata', sort_order: 5 },
          { name: 'Modern Correlation — Rheumatoid Arthritis', sort_order: 6 },
        ],
      },
      {
        name: 'Prameha (Diabetes)',
        sort_order: 3,
        topics: [
          { name: 'Classification of 20 types of Prameha', sort_order: 1 },
          { name: 'Nidana & Samprapti of Prameha', sort_order: 2 },
          { name: 'Madhumeha — Diagnosis & Management', sort_order: 3 },
          { name: 'Prameha Pidaka', sort_order: 4 },
          { name: 'Chikitsa of Prameha', sort_order: 5 },
          { name: 'Pathya-Apathya in Prameha', sort_order: 6 },
          { name: 'Modern Correlation — Type 1 & Type 2 DM', sort_order: 7 },
        ],
      },
      {
        name: 'Rajayakshma (Tuberculosis)',
        sort_order: 4,
        topics: [
          { name: 'Nidana & Samprapti of Rajayakshma', sort_order: 1 },
          { name: 'Sapta Rupa of Rajayakshma', sort_order: 2 },
          { name: 'Chikitsa of Rajayakshma', sort_order: 3 },
          { name: 'Modern Correlation — Pulmonary TB', sort_order: 4 },
          { name: 'HIV and Rajayakshma', sort_order: 5 },
        ],
      },
      {
        name: 'Kushtha (Skin Disorders)',
        sort_order: 5,
        topics: [
          { name: 'Mahakushtha — 7 types', sort_order: 1 },
          { name: 'Kshudrakushtha — 11 types', sort_order: 2 },
          { name: 'Nidana & Samprapti of Kushtha', sort_order: 3 },
          { name: 'Chikitsa of Kushtha', sort_order: 4 },
          { name: 'Kushtha Panchakarma', sort_order: 5 },
          { name: 'Modern Correlation — Psoriasis, Eczema', sort_order: 6 },
        ],
      },
      {
        name: 'Atisara & Grahani',
        sort_order: 6,
        topics: [
          { name: 'Nidana of Atisara', sort_order: 1 },
          { name: 'Types and Chikitsa of Atisara', sort_order: 2 },
          { name: 'Grahani — Nidana & Samprapti', sort_order: 3 },
          { name: 'Types of Grahani', sort_order: 4 },
          { name: 'Chikitsa of Grahani', sort_order: 5 },
          { name: 'Modern Correlation — IBS, Crohn\'s Disease', sort_order: 6 },
        ],
      },
      {
        name: 'Hridroga (Cardiac Disorders)',
        sort_order: 7,
        topics: [
          { name: 'Nidana & Types of Hridroga', sort_order: 1 },
          { name: 'Chikitsa of Hridroga', sort_order: 2 },
          { name: 'Modern Correlation — IHD, Hypertension', sort_order: 3 },
          { name: 'Rakta Vata — Hypertension Management', sort_order: 4 },
        ],
      },
      {
        name: 'Pandu & Kamala',
        sort_order: 8,
        topics: [
          { name: 'Nidana & Samprapti of Pandu', sort_order: 1 },
          { name: 'Types of Pandu', sort_order: 2 },
          { name: 'Chikitsa of Pandu', sort_order: 3 },
          { name: 'Kamala — Nidana & Chikitsa', sort_order: 4 },
          { name: 'Modern Correlation — Anaemia, Jaundice', sort_order: 5 },
        ],
      },
      {
        name: 'Research Methodology',
        sort_order: 9,
        topics: [
          { name: 'Introduction to Research Methodology', sort_order: 1 },
          { name: 'Types of Research Studies', sort_order: 2 },
          { name: 'Randomised Controlled Trials (RCT)', sort_order: 3 },
          { name: 'Observational Studies', sort_order: 4 },
          { name: 'Systematic Reviews & Meta-analysis', sort_order: 5 },
          { name: 'Evidence-Based Medicine', sort_order: 6 },
          { name: 'Writing Research Protocol', sort_order: 7 },
          { name: 'Ethics in Research — ICH-GCP', sort_order: 8 },
        ],
      },
      {
        name: 'Biostatistics',
        sort_order: 10,
        topics: [
          { name: 'Data Types and Scales of Measurement', sort_order: 1 },
          { name: 'Measures of Central Tendency', sort_order: 2 },
          { name: 'Measures of Dispersion', sort_order: 3 },
          { name: 'Normal Distribution & Standard Deviation', sort_order: 4 },
          { name: 'Hypothesis Testing — p-value, CI', sort_order: 5 },
          { name: 'Parametric Tests — t-test, ANOVA', sort_order: 6 },
          { name: 'Non-parametric Tests', sort_order: 7 },
          { name: 'Sample Size Calculation', sort_order: 8 },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // MD PANCHAKARMA
  // ──────────────────────────────────────────────────────────
  {
    branch: 'MD Panchakarma',
    syllabus_name: 'MD Panchakarma Syllabus',
    sections: [
      {
        name: 'Fundamentals of Panchakarma',
        sort_order: 1,
        topics: [
          { name: 'Definition and Purpose of Panchakarma', sort_order: 1 },
          { name: 'Shodhana vs Shamana Chikitsa', sort_order: 2 },
          { name: 'Poorvakarma — Deepana, Pachana, Snehana, Swedana', sort_order: 3 },
          { name: 'Pradhana Karma — The Five Actions', sort_order: 4 },
          { name: 'Paschatkarma — Samsarjana Krama', sort_order: 5 },
          { name: 'Indications and Contraindications of Panchakarma', sort_order: 6 },
        ],
      },
      {
        name: 'Vamana (Therapeutic Emesis)',
        sort_order: 2,
        topics: [
          { name: 'Definition and Indications of Vamana', sort_order: 1 },
          { name: 'Poorvakarma for Vamana', sort_order: 2 },
          { name: 'Vamana Procedure — Step by Step', sort_order: 3 },
          { name: 'Vamana Vyapada (Complications)', sort_order: 4 },
          { name: 'Samsarjana Krama after Vamana', sort_order: 5 },
          { name: 'Diseases indicated for Vamana', sort_order: 6 },
        ],
      },
      {
        name: 'Virechana (Therapeutic Purgation)',
        sort_order: 3,
        topics: [
          { name: 'Definition and Indications of Virechana', sort_order: 1 },
          { name: 'Poorvakarma for Virechana', sort_order: 2 },
          { name: 'Virechana Dravyas', sort_order: 3 },
          { name: 'Virechana Procedure', sort_order: 4 },
          { name: 'Virechana Vyapada', sort_order: 5 },
          { name: 'Diseases indicated for Virechana', sort_order: 6 },
        ],
      },
      {
        name: 'Basti (Medicated Enema)',
        sort_order: 4,
        topics: [
          { name: 'Definition and Types of Basti', sort_order: 1 },
          { name: 'Niruha Basti — Composition & Procedure', sort_order: 2 },
          { name: 'Anuvasana Basti — Procedure', sort_order: 3 },
          { name: 'Uttara Basti', sort_order: 4 },
          { name: 'Karma Basti, Kala Basti, Yoga Basti', sort_order: 5 },
          { name: 'Basti Vyapada', sort_order: 6 },
          { name: 'Diseases indicated for Basti', sort_order: 7 },
        ],
      },
      {
        name: 'Nasya (Nasal Administration)',
        sort_order: 5,
        topics: [
          { name: 'Types of Nasya', sort_order: 1 },
          { name: 'Nasya Procedure', sort_order: 2 },
          { name: 'Nasya Vyapada', sort_order: 3 },
          { name: 'Diseases indicated for Nasya', sort_order: 4 },
        ],
      },
      {
        name: 'Raktamokshana (Bloodletting)',
        sort_order: 6,
        topics: [
          { name: 'Types of Raktamokshana', sort_order: 1 },
          { name: 'Jalauka (Leech Therapy)', sort_order: 2 },
          { name: 'Siravyadha (Venesection)', sort_order: 3 },
          { name: 'Diseases indicated for Raktamokshana', sort_order: 4 },
        ],
      },
      {
        name: 'Keraliya Panchakarma',
        sort_order: 7,
        topics: [
          { name: 'Shirodhara — Procedure and Indications', sort_order: 1 },
          { name: 'Pizhichil (Sarvanga Snehana)', sort_order: 2 },
          { name: 'Navara Kizhi (Shashtika Shali Pinda Sweda)', sort_order: 3 },
          { name: 'Njavara (Shashtikashali)', sort_order: 4 },
          { name: 'Kati Basti, Janu Basti, Greeva Basti', sort_order: 5 },
          { name: 'Netra Tarpana', sort_order: 6 },
        ],
      },
      {
        name: 'Research Methodology',
        sort_order: 8,
        topics: [
          { name: 'Clinical Research in Panchakarma', sort_order: 1 },
          { name: 'Study Design for PK Research', sort_order: 2 },
          { name: 'Outcome Measures and Assessment Tools', sort_order: 3 },
          { name: 'Biostatistics for PK Studies', sort_order: 4 },
          { name: 'Ethics — Consent in Panchakarma', sort_order: 5 },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // MD DRAVYAGUNA (Pharmacognosy)
  // ──────────────────────────────────────────────────────────
  {
    branch: 'MD Dravyaguna',
    syllabus_name: 'MD Dravyaguna Syllabus',
    sections: [
      {
        name: 'Basic Principles of Dravyaguna',
        sort_order: 1,
        topics: [
          { name: 'Definition and Scope of Dravyaguna', sort_order: 1 },
          { name: 'Dravya — Definition and Classification', sort_order: 2 },
          { name: 'Guna — 20 Gunas and their significance', sort_order: 3 },
          { name: 'Rasa — 6 Tastes and pharmacological action', sort_order: 4 },
          { name: 'Vipaka — Post-digestive effect', sort_order: 5 },
          { name: 'Veerya — Potency and its types', sort_order: 6 },
          { name: 'Prabhava — Special effect', sort_order: 7 },
        ],
      },
      {
        name: 'Rasa Panchaka',
        sort_order: 2,
        topics: [
          { name: 'Rasa Panchaka — Overview', sort_order: 1 },
          { name: 'Panchamahabhuta and Rasa', sort_order: 2 },
          { name: 'Karma based on Rasa', sort_order: 3 },
          { name: 'Clinical application of Rasa Panchaka', sort_order: 4 },
        ],
      },
      {
        name: 'Dravya Classification',
        sort_order: 3,
        topics: [
          { name: 'Charaka\'s Classification of Dravyas', sort_order: 1 },
          { name: 'Sushruta\'s Classification of Dravyas', sort_order: 2 },
          { name: 'Vagbhata\'s Classification', sort_order: 3 },
          { name: 'Modern Pharmacognostic Classification', sort_order: 4 },
        ],
      },
      {
        name: 'Important Dravyas',
        sort_order: 4,
        topics: [
          { name: 'Amalaki — Phyllanthus emblica', sort_order: 1 },
          { name: 'Haritaki — Terminalia chebula', sort_order: 2 },
          { name: 'Bibhitaki — Terminalia bellirica', sort_order: 3 },
          { name: 'Guduchi — Tinospora cordifolia', sort_order: 4 },
          { name: 'Ashwagandha — Withania somnifera', sort_order: 5 },
          { name: 'Shatavari — Asparagus racemosus', sort_order: 6 },
          { name: 'Brahmi — Bacopa monnieri', sort_order: 7 },
          { name: 'Punarnava — Boerhavia diffusa', sort_order: 8 },
          { name: 'Nimba — Azadirachta indica', sort_order: 9 },
          { name: 'Shunthi, Pippali, Maricha — Trikatu', sort_order: 10 },
          { name: 'Triphala — Composition and Actions', sort_order: 11 },
          { name: 'Dasamoola — 10 Roots', sort_order: 12 },
        ],
      },
      {
        name: 'Modern Pharmacology Integration',
        sort_order: 5,
        topics: [
          { name: 'Phytochemistry basics', sort_order: 1 },
          { name: 'Alkaloids, Glycosides, Tannins, Flavonoids', sort_order: 2 },
          { name: 'Pharmacokinetics of Herbal Drugs', sort_order: 3 },
          { name: 'Drug Interactions — Herb-Drug', sort_order: 4 },
          { name: 'Standardisation of Herbal Formulations', sort_order: 5 },
        ],
      },
      {
        name: 'Research Methodology',
        sort_order: 6,
        topics: [
          { name: 'Research in Dravyaguna', sort_order: 1 },
          { name: 'Pharmacological Screening Methods', sort_order: 2 },
          { name: 'Clinical Trials for Herbal Drugs', sort_order: 3 },
          { name: 'Biostatistics', sort_order: 4 },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // MD ROGA NIDANA (Pathology & Diagnosis)
  // ──────────────────────────────────────────────────────────
  {
    branch: 'MD Roga Nidana',
    syllabus_name: 'MD Roga Nidana Syllabus',
    sections: [
      {
        name: 'Nidana Panchaka',
        sort_order: 1,
        topics: [
          { name: 'Nidana — Definition and Types of Causative Factors', sort_order: 1 },
          { name: 'Poorvarupa — Prodromal Features', sort_order: 2 },
          { name: 'Rupa — Clinical Features', sort_order: 3 },
          { name: 'Upashaya & Anupashaya', sort_order: 4 },
          { name: 'Samprapti — Pathogenesis', sort_order: 5 },
          { name: 'Shat Kriya Kala', sort_order: 6 },
        ],
      },
      {
        name: 'Dosha, Dushya, Mala',
        sort_order: 2,
        topics: [
          { name: 'Tridosha in Disease Causation', sort_order: 1 },
          { name: 'Dushya — Tissues involved in Disease', sort_order: 2 },
          { name: 'Mala — Role in Diagnosis', sort_order: 3 },
          { name: 'Ashtavidha Pariksha', sort_order: 4 },
          { name: 'Dashavidha Pariksha', sort_order: 5 },
        ],
      },
      {
        name: 'Specific Disease Pathogenesis',
        sort_order: 3,
        topics: [
          { name: 'Samprapti of Jwara', sort_order: 1 },
          { name: 'Samprapti of Prameha', sort_order: 2 },
          { name: 'Samprapti of Amavata', sort_order: 3 },
          { name: 'Samprapti of Kushtha', sort_order: 4 },
          { name: 'Samprapti of Pandu', sort_order: 5 },
          { name: 'Samprapti of Rajayakshma', sort_order: 6 },
          { name: 'Samprapti of Unmada & Apasmara', sort_order: 7 },
        ],
      },
      {
        name: 'Laboratory Diagnosis',
        sort_order: 4,
        topics: [
          { name: 'Complete Blood Count interpretation', sort_order: 1 },
          { name: 'Liver Function Tests', sort_order: 2 },
          { name: 'Kidney Function Tests', sort_order: 3 },
          { name: 'Blood Sugar and HbA1c', sort_order: 4 },
          { name: 'Inflammatory Markers — ESR, CRP, RA Factor', sort_order: 5 },
          { name: 'Urine Analysis', sort_order: 6 },
          { name: 'Imaging in Diagnosis', sort_order: 7 },
        ],
      },
      {
        name: 'Research Methodology & Biostatistics',
        sort_order: 5,
        topics: [
          { name: 'Research Methods in Roga Nidana', sort_order: 1 },
          { name: 'Diagnostic Study Design', sort_order: 2 },
          { name: 'Sensitivity, Specificity, PPV, NPV', sort_order: 3 },
          { name: 'Receiver Operating Characteristic (ROC)', sort_order: 4 },
          { name: 'Biostatistics Fundamentals', sort_order: 5 },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // MD PRASUTI TANTRA (Obstetrics & Gynaecology)
  // ──────────────────────────────────────────────────────────
  {
    branch: 'MD Prasuti Tantra',
    syllabus_name: 'MD Prasuti Tantra Syllabus',
    sections: [
      {
        name: 'Garbhini Paricharya',
        sort_order: 1,
        topics: [
          { name: 'Month-wise Garbhini Paricharya', sort_order: 1 },
          { name: 'Ahara in Pregnancy', sort_order: 2 },
          { name: 'Vihara in Pregnancy', sort_order: 3 },
          { name: 'Garbha Vyapada', sort_order: 4 },
        ],
      },
      {
        name: 'Prasava (Labour & Delivery)',
        sort_order: 2,
        topics: [
          { name: 'Normal Labour — Stages', sort_order: 1 },
          { name: 'Sutika Paricharya — Postnatal Care', sort_order: 2 },
          { name: 'Prasava Vyapada (Complications)', sort_order: 3 },
        ],
      },
      {
        name: 'Stri Roga (Gynaecology)',
        sort_order: 3,
        topics: [
          { name: 'Artava — Menstrual Cycle Ayurvedic View', sort_order: 1 },
          { name: 'Rajodushti — Menstrual Disorders', sort_order: 2 },
          { name: 'Yonivyapat — 20 types', sort_order: 3 },
          { name: 'Vandhyatva — Infertility Management', sort_order: 4 },
        ],
      },
      {
        name: 'Research Methodology',
        sort_order: 4,
        topics: [
          { name: 'Research Design in Obstetrics', sort_order: 1 },
          { name: 'Biostatistics', sort_order: 2 },
        ],
      },
    ],
  },
]

export const BRANCHES = BRANCH_TEMPLATES.map(t => t.branch)

export function getBranchTemplate(branch: string): BranchTemplate | undefined {
  return BRANCH_TEMPLATES.find(t => t.branch === branch)
}

// Total topic count for a branch
export function getBranchTopicCount(branch: string): number {
  const template = getBranchTemplate(branch)
  if (!template) return 0
  return template.sections.reduce((acc, s) => acc + s.topics.length, 0)
}
