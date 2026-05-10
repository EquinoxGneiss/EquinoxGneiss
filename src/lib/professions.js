/**
 * Profession registry — single source of truth for all profession-specific
 * labels, field configs, and layout decisions.
 *
 * Field types used in `fields[]`:
 *   'tags'  — comma-separated text input stored as array in details
 *   'text'  — single-line text input stored in details
 *   'url'   — URL input stored in details
 */

export const professions = [
  {
    id: 'developer',
    label: 'Developer',
    icon: '💻',
    description: 'Software engineer, web developer, full-stack, mobile developer',
    sectionLabel: 'Projects',
    projectLabel: 'Project',
    projectLabelPlural: 'Projects',
    placeholderIcon: '💻',
    showImage: true,
    fields: [
      { type: 'tags', key: 'tech', label: 'Tech Stack', placeholder: 'Vue.js, Node.js, PostgreSQL, Tailwind CSS' },
      { type: 'url',  key: 'live_url',   label: 'Live Demo URL', placeholder: 'https://yourproject.com' },
      { type: 'url',  key: 'github_url', label: 'GitHub URL',    placeholder: 'https://github.com/you/repo' },
    ],
  },
  {
    id: 'designer',
    label: 'Designer',
    icon: '🎨',
    description: 'UI/UX designer, graphic designer, visual artist, creative director',
    sectionLabel: 'Projects',
    projectLabel: 'Project',
    projectLabelPlural: 'Projects',
    placeholderIcon: '🎨',
    showImage: true,
    fields: [
      { type: 'tags', key: 'tools',       label: 'Tools Used',           placeholder: 'Figma, Photoshop, Illustrator, Adobe XD' },
      { type: 'url',  key: 'live_url',    label: 'Live / Preview URL',   placeholder: 'https://yourproject.com' },
      { type: 'url',  key: 'behance_url', label: 'Behance / Dribbble',   placeholder: 'https://behance.net/...' },
    ],
  },
  {
    id: 'accountant',
    label: 'Accountant',
    icon: '📊',
    description: 'CPA, bookkeeper, financial analyst, auditor, tax specialist',
    sectionLabel: 'Case Studies',
    projectLabel: 'Case Study',
    projectLabelPlural: 'Case Studies',
    placeholderIcon: '📊',
    showImage: false,
    fields: [
      { type: 'text', key: 'client_type', label: 'Client Type',        placeholder: 'SME, Non-profit, Corporate, Start-up...' },
      { type: 'tags', key: 'services',    label: 'Services Provided',   placeholder: 'Tax Filing, Audit, Payroll, Bookkeeping...' },
      { type: 'text', key: 'outcome',     label: 'Outcome / Result',    placeholder: 'Reduced tax liability by 20%, saved PHP 500K...' },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher / Educator',
    icon: '📚',
    description: 'Teacher, professor, trainer, tutor, coach, instructional designer',
    sectionLabel: 'Lessons & Work',
    projectLabel: 'Lesson / Material',
    projectLabelPlural: 'Lessons & Materials',
    placeholderIcon: '📚',
    showImage: false,
    fields: [
      { type: 'text', key: 'subject',      label: 'Subject / Topic',    placeholder: 'Mathematics, Science, English, History...' },
      { type: 'text', key: 'level',        label: 'Level / Grade',      placeholder: 'Grade 7, College, Adult Learners, K-12...' },
      { type: 'tags', key: 'tools',        label: 'Tools / Methods',    placeholder: 'Google Classroom, Canva, Project-Based Learning...' },
      { type: 'url',  key: 'resource_url', label: 'Resource URL',       placeholder: 'https://drive.google.com/...' },
    ],
  },
  {
    id: 'engineer',
    label: 'Engineer',
    icon: '⚙️',
    description: 'Civil, mechanical, electrical, chemical, structural engineer',
    sectionLabel: 'Projects',
    projectLabel: 'Project',
    projectLabelPlural: 'Projects',
    placeholderIcon: '⚙️',
    showImage: false,
    fields: [
      { type: 'text', key: 'specialization', label: 'Specialization',          placeholder: 'Structural, Electrical, HVAC, Geotechnical...' },
      { type: 'text', key: 'scope',          label: 'Scope / Scale',           placeholder: 'Commercial building, Bridge, Pipeline, 5-story...' },
      { type: 'text', key: 'outcome',        label: 'Outcome / Completion',    placeholder: 'Completed on time, 15% cost savings...' },
      { type: 'url',  key: 'reference_url',  label: 'Reference / Report URL',  placeholder: 'https://...' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing Professional',
    icon: '📣',
    description: 'Digital marketer, social media manager, brand strategist, content creator',
    sectionLabel: 'Campaigns',
    projectLabel: 'Campaign',
    projectLabelPlural: 'Campaigns',
    placeholderIcon: '📣',
    showImage: false,
    fields: [
      { type: 'text', key: 'client_type', label: 'Client Type',    placeholder: 'E-commerce, SaaS, F&B, Retail...' },
      { type: 'tags', key: 'channels',    label: 'Channels Used',  placeholder: 'Facebook Ads, SEO, Email, TikTok, Google Ads...' },
      { type: 'text', key: 'results',     label: 'Results',        placeholder: '30% increase in conversions, 2x ROAS...' },
      { type: 'url',  key: 'live_url',    label: 'Campaign URL',   placeholder: 'https://...' },
    ],
  },
  {
    id: 'nurse',
    label: 'Nurse',
    icon: '🏥',
    description: 'Registered nurse, licensed nurse, community health nurse',
    sectionLabel: 'Clinical Experience',
    projectLabel: 'Experience',
    projectLabelPlural: 'Clinical Experiences',
    placeholderIcon: '🏥',
    showImage: false,
    fields: [
      { type: 'text', key: 'specialty', label: 'Specialty / Area',          placeholder: 'ICU, Pediatrics, ER, Oncology, Med-Surg...' },
      { type: 'text', key: 'setting',   label: 'Clinical Setting',          placeholder: 'Hospital, Clinic, Community Health, Home Care...' },
      { type: 'tags', key: 'skills',    label: 'Skills & Competencies',     placeholder: 'IV Therapy, Patient Assessment, ACLS, BLS...' },
      { type: 'text', key: 'outcome',   label: 'Outcome / Achievement',     placeholder: 'Reduced patient falls by 40%, led care team of 6...' },
    ],
  },
  {
    id: 'doctor',
    label: 'Doctor / Physician',
    icon: '🩺',
    description: 'Medical doctor, physician, surgeon, medical specialist',
    sectionLabel: 'Clinical Work',
    projectLabel: 'Case / Research',
    projectLabelPlural: 'Clinical Work',
    placeholderIcon: '🩺',
    showImage: false,
    fields: [
      { type: 'text', key: 'specialty',     label: 'Specialty',                   placeholder: 'Cardiology, Pediatrics, Surgery, Internal Medicine...' },
      { type: 'text', key: 'institution',   label: 'Institution / Hospital',      placeholder: 'Name of hospital, clinic, or organization...' },
      { type: 'text', key: 'role',          label: 'Role / Position',             placeholder: 'Attending Physician, Resident, Consultant, Fellow...' },
      { type: 'url',  key: 'reference_url', label: 'Publication / Reference URL', placeholder: 'https://pubmed.ncbi.nlm.nih.gov/...' },
    ],
  },
  {
    id: 'general',
    label: 'Other / General',
    icon: '🌟',
    description: 'Freelancer, consultant, or any other profession',
    sectionLabel: 'Portfolio',
    projectLabel: 'Item',
    projectLabelPlural: 'Portfolio Items',
    placeholderIcon: '🌟',
    showImage: false,
    fields: [
      { type: 'text', key: 'category',     label: 'Category',          placeholder: 'Consulting, Research, Creative, Legal...' },
      { type: 'text', key: 'outcome',      label: 'Outcome / Result',  placeholder: 'Describe the impact or results achieved...' },
      { type: 'url',  key: 'reference_url', label: 'Reference URL',    placeholder: 'https://...' },
    ],
  },
]

/** Look up a profession by id. Falls back to 'developer' for legacy/null. */
export function getProfession(id) {
  return professions.find((p) => p.id === id) ?? professions[0]
}
