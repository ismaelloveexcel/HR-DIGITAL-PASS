import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin,
  Calendar,
  Clock,
  Briefcase,
  Award,
  CheckCircle2,
  TrendingUp,
  Users,
  Brain,
  Download,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@assets/baynunah-logo_1764408063481.png';

// Mock data based on user prompt
const CANDIDATE_DATA = {
  basicInfo: {
    fullName: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    phone: "+971 50 123 4567",
    currentLocation: "Dubai, UAE",
    nationality: "British",
    gender: "Female",
    visaStatus: "Employment Visa (Transferable)",
    willingToRelocateAbudhabi: "Yes",
    noticePeriod: "30 Days",
    dateOfBirth: "1990-05-15",
    languages: ["English", "Arabic"],
    linkedInProfile: "https://www.linkedin.com/in/sarahjenkins",
    otherSocialLinks: {
      github: "https://github.com/sarahjenkins",
      portfolio: "https://sarahjenkins.design"
    }
  },
  positionInfo: {
    positionApplied: "Senior UX Designer",
    appliedDate: "2024-11-15",
    currentStage: "Final Interview",
    candidateId: "C-2024-889",
    positionId: "UX-SENIOR-24",
    positionRef: "REF-2025-01",
    source: "LinkedIn Referral",
    timeInPipeline: "11 days"
  },
  compensation: {
    salaryExpectation: 25000,
    currency: "AED",
    benefitsPreferences: ["Health Insurance", "Remote Work Options", "Professional Development Budget"]
  },
  experience: {
    totalYearsExperience: 8,
    currentOrLastJobTitle: "Lead Product Designer",
    currentOrLastCompany: "TechFlow Solutions",
    workHistory: [
      {
        jobTitle: "Lead Product Designer",
        company: "TechFlow Solutions",
        startDate: "2020-01-01",
        endDate: "Present",
        description: "Led design teams on fintech projects."
      },
      {
        jobTitle: "UX Designer",
        company: "DesignHub",
        startDate: "2016-06-01",
        endDate: "2019-12-31",
        description: "Developed user interfaces for e-commerce platforms."
      }
    ],
    certifications: [
      {
        name: "Certified UX Professional",
        issuer: "Nielsen Norman Group",
        issueDate: "2022-03-15",
        expiryDate: "2025-03-15"
      }
    ]
  },
  skills: {
    technicalSkills: ["Figma", "Protopie", "React Basics", "User Research", "Design Systems"],
    skillProficiency: {
      "Figma": "Expert",
      "User Research": "Advanced"
    }
  },
  education: {
    highestDegree: "Master of Design",
    major: "Interaction Design",
    university: "Royal College of Art",
    graduationYear: "2016",
    educationHistory: [
      {
        degree: "Master of Design",
        major: "Interaction Design",
        university: "Royal College of Art",
        graduationYear: "2016",
        gpa: "3.8/4.0"
      },
      {
        degree: "Bachelor of Arts in Graphic Design",
        major: "Graphic Design",
        university: "University of London",
        graduationYear: "2014"
      }
    ]
  },
  evaluation: {
    matchScore: 88,
    summaryNotes: "Sarah is an exceptional candidate with strong leadership potential. Her technical skills are top-tier, and she demonstrates excellent cultural alignment.",
    matchScoreBreakdown: {
        profile_fit: 85,
        soft_skills: 92,
        technical: 78,
        interview: 88,
        diversity_fit: 90
    }
  },
  metrics: {
    timeToHire: "Projected: 20 days",
    retentionProbability: 82
  }
};

export default function CandidateProfile() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState(CANDIDATE_DATA);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phone: data.basicInfo.phone,
    email: data.basicInfo.email,
    emirate: "Dubai", // Default derived from location
    currentCity: "Dubai",
    visaStatus: data.basicInfo.visaStatus,
    noticePeriod: data.basicInfo.noticePeriod,
    readyToRelocateAbuDhabi: data.basicInfo.willingToRelocateAbudhabi,
    expectedSalary: data.compensation.salaryExpectation,
    salaryCurrency: data.compensation.currency,
    languages: data.basicInfo.languages.join(", "),
    portfolioLink: data.basicInfo.otherSocialLinks.portfolio,
    linkedInProfile: data.basicInfo.linkedInProfile,
    agreed: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    // Update main data with form data
    const updatedData = {
        ...data,
        basicInfo: {
            ...data.basicInfo,
            phone: formData.phone,
            email: formData.email,
            currentLocation: `${formData.currentCity}, ${formData.emirate}`,
            visaStatus: formData.visaStatus,
            noticePeriod: formData.noticePeriod,
            willingToRelocateAbudhabi: formData.readyToRelocateAbuDhabi,
            languages: formData.languages.split(",").map(l => l.trim()),
            linkedInProfile: formData.linkedInProfile,
            otherSocialLinks: {
                ...data.basicInfo.otherSocialLinks,
                portfolio: formData.portfolioLink
            }
        },
        compensation: {
            ...data.compensation,
            salaryExpectation: Number(formData.expectedSalary),
            currency: formData.salaryCurrency
        }
    };
    
    setData(updatedData);
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-subtle font-sans text-slate-900 pb-20 relative">
      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Edit Profile Details</h2>
                            <p className="text-sm text-slate-500">Update your candidate information</p>
                        </div>
                        <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-8">
                        {/* Contact Info */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#1E40AF]" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Phone Number</label>
                                    <input 
                                        type="text" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Location Info */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1E40AF]" />
                                Location Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Current Emirate</label>
                                    <select 
                                        name="emirate"
                                        value={formData.emirate}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium appearance-none"
                                    >
                                        <option value="Abu Dhabi">Abu Dhabi</option>
                                        <option value="Dubai">Dubai</option>
                                        <option value="Sharjah">Sharjah</option>
                                        <option value="Ajman">Ajman</option>
                                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                                        <option value="Fujairah">Fujairah</option>
                                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Current City</label>
                                    <input 
                                        type="text" 
                                        name="currentCity"
                                        value={formData.currentCity}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Job Eligibility */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#1E40AF]" />
                                Job Eligibility
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Visa Status</label>
                                    <input 
                                        type="text" 
                                        name="visaStatus"
                                        value={formData.visaStatus}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Notice Period</label>
                                    <input 
                                        type="text" 
                                        name="noticePeriod"
                                        value={formData.noticePeriod}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-500">Willing to relocate to Abu Dhabi?</label>
                                    <div className="flex gap-4 mt-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="readyToRelocateAbuDhabi" 
                                                value="Yes"
                                                checked={formData.readyToRelocateAbuDhabi === "Yes"}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="readyToRelocateAbuDhabi" 
                                                value="No"
                                                checked={formData.readyToRelocateAbuDhabi === "No"}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">No</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Job Preferences */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#1E40AF]" />
                                Job Preferences
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Expected Salary</label>
                                    <input 
                                        type="number" 
                                        name="expectedSalary"
                                        value={formData.expectedSalary}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Currency</label>
                                    <select 
                                        name="salaryCurrency"
                                        value={formData.salaryCurrency}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium appearance-none"
                                    >
                                        <option value="AED">AED</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Additional Info */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#1E40AF]" />
                                Additional Information
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Languages (comma separated)</label>
                                    <input 
                                        type="text" 
                                        name="languages"
                                        value={formData.languages}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500">Portfolio Link</label>
                                        <input 
                                            type="url" 
                                            name="portfolioLink"
                                            value={formData.portfolioLink}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500">LinkedIn Profile</label>
                                        <input 
                                            type="url" 
                                            name="linkedInProfile"
                                            value={formData.linkedInProfile}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        {/* Confirmation */}
                        <div className="bg-blue-50 rounded-xl p-4 flex gap-3 items-start">
                            <input 
                                type="checkbox" 
                                name="agreed"
                                checked={formData.agreed}
                                onChange={handleCheckboxChange}
                                className="mt-1 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <p className="text-xs text-blue-800 leading-relaxed">
                                I confirm that the information provided above is accurate and up-to-date. I understand that providing false information may result in disqualification from the recruitment process.
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                        <button 
                            onClick={() => setShowEditModal(false)}
                            className="px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors text-sm"
                        >
                            Close
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!formData.agreed}
                            className="px-6 py-3 rounded-xl bg-[#1E40AF] text-white font-semibold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Save & Confirm
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-white rounded-lg shadow-sm flex items-center justify-center p-1">
                <img src={logo} alt="Baynunah" className="h-full object-contain" />
             </div>
             <div className="h-4 w-px bg-slate-300" />
             <span className="text-sm font-semibold text-slate-500">Candidate Profile</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {data.positionInfo.currentStage}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 shadow-[20px_20px_60px_#e2e8f0,-20px_-20px_60px_#ffffff] relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 opacity-50 pointer-events-none" />
           
           <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
             <div className="w-32 h-32 rounded-[24px] bg-slate-100 overflow-hidden shadow-inner ring-4 ring-white shrink-0">
               <img 
                 src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                 alt={data.basicInfo.fullName}
                 className="w-full h-full object-cover"
               />
             </div>
             
             <div className="flex-1 space-y-4">
               <div>
                 <div className="flex items-center gap-3 mb-1">
                     <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{data.basicInfo.fullName}</h1>
                     <button 
                        onClick={() => setShowEditModal(true)}
                        className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-[#1E40AF] transition-colors"
                     >
                        <Edit2 className="w-4 h-4" />
                     </button>
                 </div>
                 <p className="text-lg text-[#1E40AF] font-medium">{data.positionInfo.positionApplied}</p>
               </div>

               <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                 <div className="flex items-center gap-1.5">
                   <MapPin className="w-4 h-4 text-slate-400" />
                   {data.basicInfo.currentLocation}
                 </div>
                 <div className="flex items-center gap-1.5">
                   <Mail className="w-4 h-4 text-slate-400" />
                   {data.basicInfo.email}
                 </div>
                 <div className="flex items-center gap-1.5">
                   <Phone className="w-4 h-4 text-slate-400" />
                   {data.basicInfo.phone}
                 </div>
               </div>

               <div className="flex gap-3 pt-2">
                  <a href={data.basicInfo.linkedInProfile} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={data.basicInfo.otherSocialLinks.portfolio} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                  <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20">
                    <Download className="w-4 h-4" />
                    Download CV
                  </button>
               </div>
             </div>

             <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Match Score</p>
                  <div className="text-3xl font-bold text-[#1E40AF]">{data.evaluation.matchScore}%</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Pipeline Time</p>
                  <div className="text-xl font-bold text-slate-700">{data.positionInfo.timeInPipeline}</div>
                </div>
             </div>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left Column - Info */}
           <div className="space-y-6 lg:col-span-2">
              {/* Experience */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1E40AF]" />
                  Experience
                </h2>
                <div className="space-y-8 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {data.experience.workHistory.map((job, i) => (
                    <div key={i} className="relative flex gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 z-10">
                         <Briefcase className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{job.jobTitle}</h3>
                        <p className="text-sm text-[#1E40AF] font-medium mb-1">{job.company}</p>
                        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {job.startDate} - {job.endDate}
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Education & Certs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100"
                 >
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#1E40AF]" />
                      Education
                    </h2>
                    <div className="space-y-4">
                      {data.education.educationHistory.map((edu, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                           <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                           <p className="text-sm text-slate-600">{edu.university}</p>
                           <p className="text-xs text-slate-400 mt-1">{edu.graduationYear}</p>
                        </div>
                      ))}
                    </div>
                 </motion.div>

                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100"
                 >
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#1E40AF]" />
                      Certifications
                    </h2>
                    <div className="space-y-4">
                      {data.experience.certifications.map((cert, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                           <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                           <p className="text-sm text-slate-600">{cert.issuer}</p>
                           <p className="text-xs text-slate-400 mt-1">Expires: {cert.expiryDate}</p>
                        </div>
                      ))}
                    </div>
                 </motion.div>
              </div>
           </div>

           {/* Right Column - Evaluation */}
           <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100"
              >
                 <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#1E40AF]" />
                    AI Evaluation
                 </h2>
                 <p className="text-sm text-slate-600 italic mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
                   "{data.evaluation.summaryNotes}"
                 </p>

                 <div className="space-y-4">
                   {Object.entries(data.evaluation.matchScoreBreakdown).map(([key, value]) => (
                     <div key={key}>
                       <div className="flex justify-between text-sm mb-1">
                         <span className="capitalize text-slate-600">{key.replace('_', ' ')}</span>
                         <span className="font-bold text-slate-900">{value}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-[#1E40AF] rounded-full" 
                           style={{ width: `${value}%` }}
                         />
                       </div>
                     </div>
                   ))}
                 </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100"
              >
                 <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1E40AF]" />
                    Skills
                 </h2>
                 <div className="flex flex-wrap gap-2">
                   {data.skills.technicalSkills.map((skill, i) => (
                     <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-sm rounded-lg border border-slate-200 font-medium">
                       {skill}
                     </span>
                   ))}
                 </div>
              </motion.div>

              <div className="bg-gradient-to-br from-[#1E40AF] to-blue-700 rounded-[24px] p-6 text-white shadow-lg shadow-blue-900/20">
                 <h3 className="font-bold text-lg mb-2">Hiring Recommendation</h3>
                 <div className="text-3xl font-bold mb-4">Strong Hire</div>
                 <p className="text-blue-100 text-sm mb-6">
                   Candidate exceeds expectations for the Senior UX Designer role.
                 </p>
                 <button className="w-full py-3 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                   Proceed to Offer
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}