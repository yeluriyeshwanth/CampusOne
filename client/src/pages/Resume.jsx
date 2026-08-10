import {
  useEffect,
  useRef,
  useState
} from 'react'

import { useNavigate } from 'react-router'

import API_URL from '../api'

import jsPDF from 'jspdf'


function Resume() {

  const navigate = useNavigate()

  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showPreview, setShowPreview] =
    useState(false)

  const [downloading, setDownloading] = useState(false)

  // PDF PREVIEW REFERENCE
  const resumePreviewRef = useRef(null)


  // ============================================
  // RESUME FORM
  // ============================================

  const [formData, setFormData] = useState({

    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },

    summary: '',

    education: [
      {
        degree: '',
        college: '',
        university: '',
        startYear: '',
        endYear: '',
        cgpa: ''
      }
    ],

    skills: {
      languages: [],
      frontend: [],
      backend: [],
      databases: [],
      tools: []
    },

    projects: [],

    experience: [],

    certifications: [],

    achievements: []

  })


  // ============================================
  // SKILL INPUTS
  // ============================================

  const [skillInputs, setSkillInputs] =
    useState({

      languages: '',
      frontend: '',
      backend: '',
      databases: '',
      tools: ''

    })


  // ============================================
  // PROJECT FORM
  // ============================================

  const [projectForm, setProjectForm] =
    useState({

      name: '',
      technologies: '',
      description: '',
      github: '',
      liveDemo: ''

    })


  const [
    editingProjectIndex,
    setEditingProjectIndex
  ] = useState(null)


  const token =
    localStorage.getItem('token')


  // ============================================
  // FETCH RESUME
  // ============================================

  useEffect(() => {

    const fetchResume = async () => {

      if (!token) {

        navigate('/login')

        return
      }

      try {

        const response = await fetch(
          `${API_URL}/api/resume`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )

        const data =
          await response.json()

        if (!response.ok) {

          throw new Error(
            data.message ||
            'Failed to load resume'
          )

        }

        if (data.resume) {

          setResume(data.resume)

          setFormData({

            personalInfo:
              data.resume.personalInfo || {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                portfolio: ''
              },

            summary:
              data.resume.summary || '',

            education:
              data.resume.education?.length > 0
                ? data.resume.education.map(
                    (education) => ({
                      ...education,
                      cgpa:
                        education.cgpa ?? ''
                    })
                  )
                : [
                    {
                      degree: '',
                      college: '',
                      university: '',
                      startYear: '',
                      endYear: '',
                      cgpa: ''
                    }
                  ],

            skills:
              data.resume.skills || {
                languages: [],
                frontend: [],
                backend: [],
                databases: [],
                tools: []
              },

            projects:
              data.resume.projects || [],

            experience:
              data.resume.experience || [],

            certifications:
              data.resume.certifications || [],

            achievements:
              data.resume.achievements || []

          })

        }

      } catch (error) {

        console.error(
          'Fetch resume error:',
          error
        )

        setError(error.message)

      } finally {

        setLoading(false)

      }

    }

    fetchResume()

  }, [navigate, token])


  // ============================================
  // PERSONAL INFORMATION
  // ============================================

  const handlePersonalInfoChange = (e) => {

    const {
      name,
      value
    } = e.target

    setFormData(
      (previousData) => ({

        ...previousData,

        personalInfo: {

          ...previousData.personalInfo,

          [name]: value

        }

      })
    )

  }


  // ============================================
  // SUMMARY
  // ============================================

  const handleSummaryChange = (e) => {

    setFormData(
      (previousData) => ({

        ...previousData,

        summary:
          e.target.value

      })
    )

  }


  // ============================================
  // EDUCATION
  // ============================================

  const handleEducationChange = (
    index,
    e
  ) => {

    const {
      name,
      value
    } = e.target

    setFormData(
      (previousData) => {

        const updatedEducation = [
          ...previousData.education
        ]

        updatedEducation[index] = {

          ...updatedEducation[index],

          [name]: value

        }

        return {

          ...previousData,

          education:
            updatedEducation

        }

      }
    )

  }


  const addEducation = () => {

    setFormData(
      (previousData) => ({

        ...previousData,

        education: [

          ...previousData.education,

          {
            degree: '',
            college: '',
            university: '',
            startYear: '',
            endYear: '',
            cgpa: ''
          }

        ]

      })
    )

  }


  const removeEducation = (index) => {

    setFormData(
      (previousData) => ({

        ...previousData,

        education:
          previousData.education.filter(
            (_, educationIndex) =>
              educationIndex !== index
          )

      })
    )

  }


  // ============================================
  // SKILLS
  // ============================================

  const addSkill = (category) => {

    const value =
      skillInputs[category].trim()

    if (!value) {

      return

    }

    setFormData(
      (previousData) => ({

        ...previousData,

        skills: {

          ...previousData.skills,

          [category]: [

            ...previousData.skills[
              category
            ],

            value

          ]

        }

      })
    )

    setSkillInputs(
      (previousInputs) => ({

        ...previousInputs,

        [category]: ''

      })
    )

  }


  const removeSkill = (
    category,
    index
  ) => {

    setFormData(
      (previousData) => ({

        ...previousData,

        skills: {

          ...previousData.skills,

          [category]:
            previousData.skills[
              category
            ].filter(
              (_, skillIndex) =>
                skillIndex !== index
            )

        }

      })
    )

  }


  const handleSkillInputChange = (
    category,
    value
  ) => {

    setSkillInputs(
      (previousInputs) => ({

        ...previousInputs,

        [category]: value

      })
    )

  }


  // ============================================
  // PROJECTS
  // ============================================

  const handleProjectChange = (e) => {

    const {
      name,
      value
    } = e.target

    setProjectForm(
      (previousData) => ({

        ...previousData,

        [name]: value

      })
    )

  }


  // ============================================
  // ADD PROJECT
  // ============================================

  const addProject = () => {

    setError('')
    setSuccess('')

    if (!projectForm.name.trim()) {

      setError(
        'Project name is required'
      )

      return

    }

    if (!projectForm.description.trim()) {

      setError(
        'Project description is required'
      )

      return

    }

    const newProject = {

      name:
        projectForm.name.trim(),

      technologies:
        projectForm.technologies.trim(),

      description:
        projectForm.description.trim(),

      github:
        projectForm.github.trim(),

      liveDemo:
        projectForm.liveDemo.trim()

    }

    setFormData(
      (previousData) => ({

        ...previousData,

        projects: [

          ...previousData.projects,

          newProject

        ]

      })
    )

    setProjectForm({

      name: '',
      technologies: '',
      description: '',
      github: '',
      liveDemo: ''

    })

  }


  // ============================================
  // START EDITING PROJECT
  // ============================================

  const startEditingProject = (
    project,
    index
  ) => {

    setEditingProjectIndex(index)

    setProjectForm({

      name:
        project.name || '',

      technologies:
        project.technologies || '',

      description:
        project.description || '',

      github:
        project.github || '',

      liveDemo:
        project.liveDemo || ''

    })

    setError('')
    setSuccess('')

    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    })

  }


  // ============================================
  // SAVE EDITED PROJECT
  // ============================================

  const saveProjectEdit = () => {

    setError('')
    setSuccess('')

    if (!projectForm.name.trim()) {

      setError(
        'Project name is required'
      )

      return

    }

    if (!projectForm.description.trim()) {

      setError(
        'Project description is required'
      )

      return

    }

    setFormData(
      (previousData) => {

        const updatedProjects = [
          ...previousData.projects
        ]

        updatedProjects[
          editingProjectIndex
        ] = {

          ...updatedProjects[
            editingProjectIndex
          ],

          name:
            projectForm.name.trim(),

          technologies:
            projectForm.technologies.trim(),

          description:
            projectForm.description.trim(),

          github:
            projectForm.github.trim(),

          liveDemo:
            projectForm.liveDemo.trim()

        }

        return {

          ...previousData,

          projects:
            updatedProjects

        }

      }
    )

    setEditingProjectIndex(null)

    setProjectForm({

      name: '',
      technologies: '',
      description: '',
      github: '',
      liveDemo: ''

    })

    setSuccess(
      'Project updated successfully'
    )

  }


  // ============================================
  // CANCEL PROJECT EDIT
  // ============================================

  const cancelProjectEdit = () => {

    setEditingProjectIndex(null)

    setProjectForm({

      name: '',
      technologies: '',
      description: '',
      github: '',
      liveDemo: ''

    })

    setError('')
    setSuccess('')

  }


  // ============================================
  // DELETE PROJECT
  // ============================================

  const deleteProject = (index) => {

    setError('')
    setSuccess('')

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this project?'
      )

    if (!confirmed) {

      return

    }

    setFormData(
      (previousData) => ({

        ...previousData,

        projects:
          previousData.projects.filter(
            (_, projectIndex) =>
              projectIndex !== index
          )

      })
    )

    if (
      editingProjectIndex === index
    ) {

      cancelProjectEdit()

    }

    setSuccess(
      'Project removed. Click Save Resume to save the changes.'
    )

  }


  // ============================================
  // SAVE RESUME
  // ============================================

  const handleSave = async () => {

    setError('')
    setSuccess('')
    setSaving(true)

    try {

      const payload = {

        ...formData,

        education:
          formData.education.map(
            (education) => ({

              ...education,

              cgpa:
                education.cgpa === ''
                  ? 0
                  : Number(
                      education.cgpa
                    )

            })
          )

      }

      const response =
        await fetch(
          `${API_URL}/api/resume`,
          {

            method:
              resume
                ? 'PUT'
                : 'POST',

            headers: {

              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`

            },

            body:
              JSON.stringify(
                payload
              )

          }
        )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to save resume'
        )

      }

      setResume(data.resume)

      setSuccess(
        'Resume saved successfully!'
      )

    } catch (error) {

      console.error(
        'Save resume error:',
        error
      )

      setError(
        error.message
      )

    } finally {

      setSaving(false)

    }

  }


  // ============================================
  // DOWNLOAD PDF
  // ============================================

  const handleDownloadPDF = (event) => {

    // Stop the click from reaching any parent element.
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    // Do not allow multiple downloads at the same time.
    if (downloading) {
      return
    }

    setError('')
    setSuccess('')
    setDownloading(true)

    try {

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const pageWidth = 210
      const pageHeight = 297
      const margin = 18
      const contentWidth = pageWidth - margin * 2

      let y = 18

      // --------------------------------------------
      // HELPERS
      // --------------------------------------------

      const checkPage = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - 15) {
          pdf.addPage()
          y = 18
        }
      }

      const addText = (
        text,
        x,
        size = 10,
        style = 'normal',
        width = contentWidth,
        lineHeight = 5
      ) => {
        if (!text) return

        pdf.setFont('helvetica', style)
        pdf.setFontSize(size)

        const lines = pdf.splitTextToSize(
          String(text),
          width
        )

        checkPage(lines.length * lineHeight + 2)

        pdf.text(lines, x, y)
        y += lines.length * lineHeight
      }

      const addSectionTitle = (title) => {
        checkPage(15)

        y += 4

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.text(title.toUpperCase(), margin, y)

        y += 2

        pdf.setLineWidth(0.3)
        pdf.line(
          margin,
          y,
          pageWidth - margin,
          y
        )

        y += 6
      }

      const addBullet = (text) => {
        if (!text) return

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9.5)

        const lines = pdf.splitTextToSize(
          String(text),
          contentWidth - 6
        )

        checkPage(lines.length * 4.8 + 2)

        pdf.text('•', margin, y)
        pdf.text(lines, margin + 5, y)

        y += lines.length * 4.8 + 2
      }

      const addLabelValue = (label, value) => {
        if (!value) return

        checkPage(6)

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9.5)
        pdf.text(`${label}:`, margin, y)

        const labelWidth =
          pdf.getTextWidth(`${label}: `)

        pdf.setFont('helvetica', 'normal')
        pdf.text(
          String(value),
          margin + labelWidth,
          y
        )

        y += 5
      }

      // --------------------------------------------
      // PERSONAL INFORMATION
      // --------------------------------------------

      const personalInfo =
        formData.personalInfo || {}

      const fullName =
        personalInfo.fullName?.trim() ||
        'Your Name'

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.text(
        fullName,
        pageWidth / 2,
        y,
        { align: 'center' }
      )

      y += 8

      const contactDetails = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location
      ].filter(Boolean)

      if (contactDetails.length > 0) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9.5)
        pdf.text(
          contactDetails.join('   |   '),
          pageWidth / 2,
          y,
          { align: 'center' }
        )
        y += 5
      }

      const profileLinks = [
        personalInfo.linkedin
          ? 'LinkedIn'
          : '',
        personalInfo.github
          ? 'GitHub'
          : '',
        personalInfo.portfolio
          ? 'Portfolio'
          : ''
      ].filter(Boolean)

      if (profileLinks.length > 0) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9.5)
        pdf.text(
          profileLinks.join('   |   '),
          pageWidth / 2,
          y,
          { align: 'center' }
        )
        y += 5
      }

      pdf.setLineWidth(0.5)
      pdf.line(
        margin,
        y + 1,
        pageWidth - margin,
        y + 1
      )

      y += 8

      // --------------------------------------------
      // SUMMARY
      // --------------------------------------------

      if (formData.summary?.trim()) {
        addSectionTitle('Professional Summary')
        addText(
          formData.summary.trim(),
          margin,
          9.5,
          'normal',
          contentWidth,
          4.8
        )
      }

      // --------------------------------------------
      // EDUCATION
      // --------------------------------------------

      const educationList =
        Array.isArray(formData.education)
          ? formData.education
          : []

      if (educationList.length > 0) {
        addSectionTitle('Education')

        educationList.forEach((education) => {
          if (!education) return

          checkPage(22)

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          pdf.text(
            education.degree || 'Degree',
            margin,
            y
          )

          const years = [
            education.startYear,
            education.endYear
          ].filter(Boolean).join(' - ')

          if (years) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(9.5)
            pdf.text(
              years,
              pageWidth - margin,
              y,
              { align: 'right' }
            )
          }

          y += 5

          if (education.college) {
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(9.5)
            pdf.text(
              education.college,
              margin,
              y
            )
            y += 4.5
          }

          if (education.university) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(9.5)
            pdf.text(
              education.university,
              margin,
              y
            )
            y += 4.5
          }

          if (
            education.cgpa !== '' &&
            education.cgpa !== null &&
            education.cgpa !== undefined &&
            Number(education.cgpa) !== 0
          ) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(9.5)
            pdf.text(
              `CGPA: ${education.cgpa}`,
              pageWidth - margin,
              y - 9,
              { align: 'right' }
            )
          }

          y += 3
        })
      }

      // --------------------------------------------
      // TECHNICAL SKILLS
      // --------------------------------------------

      const skills = formData.skills || {}

      const skillCategories = [
        ['Programming Languages', skills.languages],
        ['Frontend', skills.frontend],
        ['Backend', skills.backend],
        ['Databases', skills.databases],
        ['Tools', skills.tools]
      ]

      const hasSkills = skillCategories.some(
        ([, values]) =>
          Array.isArray(values) &&
          values.length > 0
      )

      if (hasSkills) {
        addSectionTitle('Technical Skills')

        skillCategories.forEach(
          ([label, values]) => {
            if (!Array.isArray(values) || values.length === 0) {
              return
            }

            checkPage(6)

            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(9.5)
            pdf.text(`${label}:`, margin, y)

            const labelWidth =
              pdf.getTextWidth(`${label}: `)

            pdf.setFont('helvetica', 'normal')
            pdf.text(
              values.join(', '),
              margin + labelWidth,
              y
            )

            y += 5
          }
        )
      }

      // --------------------------------------------
      // PROJECTS
      // --------------------------------------------

      const projects =
        Array.isArray(formData.projects)
          ? formData.projects
          : []

      if (projects.length > 0) {
        addSectionTitle('Projects')

        projects.forEach((project) => {
          if (!project) return

          checkPage(20)

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          pdf.text(
            project.name || 'Project',
            margin,
            y
          )

          y += 5

          if (project.technologies) {
            pdf.setFont('helvetica', 'italic')
            pdf.setFontSize(9)
            pdf.text(
              project.technologies,
              margin,
              y
            )
            y += 4.5
          }

          if (project.description) {
            const descriptionLines =
              pdf.splitTextToSize(
                project.description,
                contentWidth
              )

            checkPage(
              descriptionLines.length * 4.8 + 2
            )

            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(9.5)
            pdf.text(
              descriptionLines,
              margin,
              y
            )

            y +=
              descriptionLines.length * 4.8 +
              2
          }

          const projectLinks = [
            project.github
              ? `GitHub: ${project.github}`
              : '',
            project.liveDemo
              ? `Live Demo: ${project.liveDemo}`
              : ''
          ].filter(Boolean)

          if (projectLinks.length > 0) {
            projectLinks.forEach((link) => {
              addText(
                link,
                margin,
                8.5,
                'normal',
                contentWidth,
                4.2
              )
            })
          }

          y += 3
        })
      }

      // --------------------------------------------
      // OPTIONAL SECTIONS
      // --------------------------------------------

      const experience =
        Array.isArray(formData.experience)
          ? formData.experience
          : []

      if (experience.length > 0) {
        addSectionTitle('Experience')

        experience.forEach((item) => {
          if (!item) return

          checkPage(18)

          addText(
            item.role || item.position || 'Experience',
            margin,
            10,
            'bold',
            contentWidth,
            4.8
          )

          if (item.company) {
            addText(
              item.company,
              margin,
              9.5,
              'normal',
              contentWidth,
              4.8
            )
          }

          if (item.description) {
            addBullet(item.description)
          }
        })
      }

      const certifications =
        Array.isArray(formData.certifications)
          ? formData.certifications
          : []

      if (certifications.length > 0) {
        addSectionTitle('Certifications')

        certifications.forEach((item) => {
          const text =
            typeof item === 'string'
              ? item
              : item?.name || item?.title || ''

          if (text) {
            addBullet(text)
          }
        })
      }

      const achievements =
        Array.isArray(formData.achievements)
          ? formData.achievements
          : []

      if (achievements.length > 0) {
        addSectionTitle('Achievements')

        achievements.forEach((item) => {
          const text =
            typeof item === 'string'
              ? item
              : item?.title || item?.description || ''

          if (text) {
            addBullet(text)
          }
        })
      }

      // --------------------------------------------
      // FILE NAME + DOWNLOAD
      // --------------------------------------------

      const safeName =
        (
          personalInfo.fullName ||
          'CampusOne'
        )
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-_]/g, '')

      const fileName =
        `${safeName || 'CampusOne'}-Resume.pdf`

      // Direct jsPDF download.
      // No html2canvas, Blob URL or temporary anchor is used.
      pdf.save(fileName)

      setSuccess(
        'Resume downloaded successfully!'
      )

    } catch (error) {

      console.error(
        'PDF generation error:',
        error
      )

      setError(
        error?.message ||
        'Failed to generate PDF. Please try again.'
      )

    } finally {

      setDownloading(false)

    }

  }

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {

    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'user'
    )

    navigate('/login')

  }


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <p className="text-lg text-slate-400">
          Loading resume builder...
        </p>

      </div>

    )

  }


  // ============================================
  // RESUME PREVIEW
  // ============================================

  if (showPreview) {

    return (

      <div className="min-h-screen bg-slate-950">

        {/* ======================================
            PREVIEW TOOLBAR
        ====================================== */}

        <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 px-6 py-4">

          <div className="mx-auto flex max-w-6xl items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-white">
                Resume Preview
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Review your resume before downloading.
              </p>

            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                className="rounded-lg border border-slate-700 px-5 py-2.5 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                ← Edit Resume
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading
                  ? 'Generating PDF...'
                  : 'Download PDF'}
              </button>

            </div>

          </div>

        </div>


        {/* ======================================
            RESUME AREA
        ====================================== */}

        <div className="overflow-x-auto px-4 py-10">

          <div
            ref={resumePreviewRef}
            className="mx-auto box-border w-[210mm] min-h-[297mm] bg-white px-[16mm] py-[14mm] text-slate-900 shadow-2xl"
          >

            {/* ==================================
                HEADER
            ================================== */}

            <header className="border-b-2 border-slate-900 pb-5 text-center">

              <h1 className="text-3xl font-bold uppercase tracking-wide">

                {formData.personalInfo.fullName ||
                  'Your Name'}

              </h1>

              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-600">

                {formData.personalInfo.email && (

                  <span>
                    {formData.personalInfo.email}
                  </span>

                )}

                {formData.personalInfo.phone && (

                  <span>
                    {formData.personalInfo.phone}
                  </span>

                )}

                {formData.personalInfo.location && (

                  <span>
                    {formData.personalInfo.location}
                  </span>

                )}

              </div>


              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">

                {formData.personalInfo.linkedin && (

                  <span className="text-blue-700">
                    LinkedIn
                  </span>

                )}

                {formData.personalInfo.github && (

                  <span className="text-blue-700">
                    GitHub
                  </span>

                )}

                {formData.personalInfo.portfolio && (

                  <span className="text-blue-700">
                    Portfolio
                  </span>

                )}

              </div>

            </header>


            {/* ==================================
                SUMMARY
            ================================== */}

            {formData.summary.trim() && (

              <ResumePreviewSection
                title="Professional Summary"
              >

                <p className="text-sm leading-6 text-slate-700">
                  {formData.summary}
                </p>

              </ResumePreviewSection>

            )}


            {/* ==================================
                EDUCATION
            ================================== */}

            {formData.education.some(
              (education) =>
                education.degree ||
                education.college ||
                education.university
            ) && (

              <ResumePreviewSection
                title="Education"
              >

                <div className="space-y-4">

                  {formData.education.map(
                    (education, index) => (

                      <div
                        key={index}
                        className="text-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <h4 className="font-bold text-slate-900">

                              {education.degree ||
                                'Degree'}

                            </h4>

                            {education.college && (

                              <p className="mt-1 font-medium text-slate-700">

                                {education.college}

                              </p>

                            )}

                            {education.university && (

                              <p className="text-slate-600">

                                {education.university}

                              </p>

                            )}

                          </div>


                          <div className="text-right text-slate-600">

                            {(education.startYear ||
                              education.endYear) && (

                              <p>

                                {education.startYear}
                                {education.startYear &&
                                education.endYear
                                  ? ' – '
                                  : ''}
                                {education.endYear}

                              </p>

                            )}

                            {education.cgpa !==
                              '' &&
                              Number(
                                education.cgpa
                              ) > 0 && (

                              <p className="mt-1 font-medium">

                                CGPA:{' '}
                                {education.cgpa}

                              </p>

                            )}

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </ResumePreviewSection>

            )}


            {/* ==================================
                SKILLS
            ================================== */}

            {Object.values(
              formData.skills
            ).some(
              (skills) =>
                skills &&
                skills.length > 0
            ) && (

              <ResumePreviewSection
                title="Technical Skills"
              >

                <div className="space-y-2 text-sm">

                  {formData.skills.languages
                    ?.length > 0 && (

                    <SkillPreviewRow
                      title="Programming Languages"
                      skills={
                        formData.skills.languages
                      }
                    />

                  )}

                  {formData.skills.frontend
                    ?.length > 0 && (

                    <SkillPreviewRow
                      title="Frontend"
                      skills={
                        formData.skills.frontend
                      }
                    />

                  )}

                  {formData.skills.backend
                    ?.length > 0 && (

                    <SkillPreviewRow
                      title="Backend"
                      skills={
                        formData.skills.backend
                      }
                    />

                  )}

                  {formData.skills.databases
                    ?.length > 0 && (

                    <SkillPreviewRow
                      title="Databases"
                      skills={
                        formData.skills.databases
                      }
                    />

                  )}

                  {formData.skills.tools
                    ?.length > 0 && (

                    <SkillPreviewRow
                      title="Tools"
                      skills={
                        formData.skills.tools
                      }
                    />

                  )}

                </div>

              </ResumePreviewSection>

            )}


            {/* ==================================
                PROJECTS
            ================================== */}

            {formData.projects.length > 0 && (

              <ResumePreviewSection
                title="Projects"
              >

                <div className="space-y-5">

                  {formData.projects.map(
                    (project, index) => (

                      <div
                        key={
                          project._id ||
                          `preview-project-${index}`
                        }
                        className="text-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <h4 className="font-bold text-slate-900">

                            {project.name}

                          </h4>

                          <div className="flex gap-3 text-xs text-blue-700">

                            {project.github && (
                              <span>
                                GitHub
                              </span>
                            )}

                            {project.liveDemo && (
                              <span>
                                Live Demo
                              </span>
                            )}

                          </div>

                        </div>


                        {project.technologies && (

                          <p className="mt-1 font-medium text-slate-600">

                            {project.technologies}

                          </p>

                        )}


                        {project.description && (

                          <p className="mt-2 leading-6 text-slate-700">

                            {project.description}

                          </p>

                        )}

                      </div>

                    )
                  )}

                </div>

              </ResumePreviewSection>

            )}


            {/* ==================================
                FUTURE SECTIONS
            ================================== */}

            {formData.experience?.length > 0 && (

              <ResumePreviewSection
                title="Experience"
              >

                {formData.experience.map(
                  (experience, index) => (

                    <div
                      key={index}
                      className="text-sm"
                    >

                      {experience.position && (
                        <h4 className="font-bold">
                          {experience.position}
                        </h4>
                      )}

                      {experience.company && (
                        <p>
                          {experience.company}
                        </p>
                      )}

                      {experience.description && (
                        <p className="mt-1 leading-6">
                          {experience.description}
                        </p>
                      )}

                    </div>

                  )
                )}

              </ResumePreviewSection>

            )}


            {formData.certifications?.length > 0 && (

              <ResumePreviewSection
                title="Certifications"
              >

                <ul className="list-disc space-y-1 pl-5 text-sm">

                  {formData.certifications.map(
                    (certification, index) => (

                      <li key={index}>
                        {typeof certification ===
                        'string'
                          ? certification
                          : certification.name ||
                            ''}
                      </li>

                    )
                  )}

                </ul>

              </ResumePreviewSection>

            )}


            {formData.achievements?.length > 0 && (

              <ResumePreviewSection
                title="Achievements"
              >

                <ul className="list-disc space-y-1 pl-5 text-sm">

                  {formData.achievements.map(
                    (achievement, index) => (

                      <li key={index}>
                        {typeof achievement ===
                        'string'
                          ? achievement
                          : achievement.title ||
                            ''}
                      </li>

                    )
                  )}

                </ul>

              </ResumePreviewSection>

            )}

          </div>

        </div>

      </div>

    )

  }


  // ============================================
  // MAIN RESUME BUILDER UI
  // ============================================

  return (

    <div className="flex min-h-screen bg-slate-950 text-white">


      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="min-h-screen w-64 border-r border-slate-800 bg-slate-900 p-6">

        {/* CAMPUSONE */}

        <button
          type="button"
          onClick={() =>
            navigate('/dashboard')
          }
          className="text-2xl font-bold text-blue-500 transition hover:text-blue-400"
        >
          CampusOne
        </button>


        <nav className="mt-10 space-y-2">

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() =>
              navigate('/dashboard')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </button>


          {/* ATTENDANCE */}

          <button
            type="button"
            onClick={() =>
              navigate('/attendance')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Attendance
          </button>


          {/* ASSIGNMENTS */}

          <button
            type="button"
            onClick={() =>
              navigate('/assignments')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Assignments
          </button>


          {/* CGPA */}

          <button
            type="button"
            onClick={() =>
              navigate('/cgpa')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            CGPA Tracker
          </button>


          {/* PLACEMENT */}

          <button
            type="button"
            onClick={() =>
              navigate('/placement')
            }
            className="w-full rounded-lg px-4 py-3 text-left text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Placement
          </button>


          {/* RESUME */}

          <button
            type="button"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-medium"
          >
            Resume Builder
          </button>

        </nav>


        {/* LOGOUT */}

        <div className="mt-10">

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/30 px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
          >
            Logout
          </button>

        </div>

      </aside>


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="flex-1 p-8">


        {/* HEADER */}

        <div className="flex items-start justify-between gap-6">

          <div>

            <h2 className="text-3xl font-bold">
              Resume Builder
            </h2>

            <p className="mt-2 text-slate-400">
              Build and maintain your professional resume.
            </p>

          </div>


          {/* PREVIEW BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowPreview(true)
            }
            className="rounded-lg border border-blue-500/40 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/10"
          >
            Preview Resume
          </button>

        </div>


        {/* ========================================
            PERSONAL INFORMATION
        ======================================== */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Personal Information
          </h3>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <input
              type="text"
              name="fullName"
              value={
                formData.personalInfo.fullName
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="Full Name"
              className="resume-input"
            />


            <input
              type="email"
              name="email"
              value={
                formData.personalInfo.email
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="Email"
              className="resume-input"
            />


            <input
              type="tel"
              name="phone"
              value={
                formData.personalInfo.phone
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="Phone"
              className="resume-input"
            />


            <input
              type="text"
              name="location"
              value={
                formData.personalInfo.location
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="Location"
              className="resume-input"
            />


            <input
              type="url"
              name="linkedin"
              value={
                formData.personalInfo.linkedin
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="LinkedIn URL"
              className="resume-input"
            />


            <input
              type="url"
              name="github"
              value={
                formData.personalInfo.github
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="GitHub URL"
              className="resume-input"
            />


            <input
              type="url"
              name="portfolio"
              value={
                formData.personalInfo.portfolio
              }
              onChange={
                handlePersonalInfoChange
              }
              placeholder="Portfolio URL"
              className="resume-input md:col-span-2"
            />

          </div>

        </section>


        {/* ========================================
            PROFESSIONAL SUMMARY
        ======================================== */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Professional Summary
          </h3>


          <textarea
            value={formData.summary}
            onChange={
              handleSummaryChange
            }
            placeholder="Write a short professional summary..."
            rows="5"
            className="resume-input mt-6 w-full"
          />

        </section>


        {/* ========================================
            EDUCATION
        ======================================== */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-semibold">
              Education
            </h3>


            <button
              type="button"
              onClick={addEducation}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              + Add Education
            </button>

          </div>


          <div className="mt-6 space-y-6">

            {formData.education.map(
              (education, index) => (

                <div
                  key={index}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-5"
                >

                  <div className="grid gap-4 md:grid-cols-2">

                    <input
                      type="text"
                      name="degree"
                      value={
                        education.degree
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          e
                        )
                      }
                      placeholder="Degree"
                      className="resume-input"
                    />


                    <input
                      type="text"
                      name="college"
                      value={
                        education.college
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          e
                        )
                      }
                      placeholder="College"
                      className="resume-input"
                    />


                    <input
                      type="text"
                      name="university"
                      value={
                        education.university
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          e
                        )
                      }
                      placeholder="University"
                      className="resume-input"
                    />


                    <input
                      type="number"
                      name="cgpa"
                      value={
                        education.cgpa
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          e
                        )
                      }
                      placeholder="CGPA"
                      min="0"
                      max="10"
                      step="0.01"
                      className="resume-input"
                    />


                    <input
                      type="text"
                      name="startYear"
                      value={
                        education.startYear
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          e
                        )
                      }
                      placeholder="Start Year"
                      className="resume-input"
                    />


                    <input
                      type="text"
                      name="endYear"
                      value={
                        education.endYear
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          e
                        )
                      }
                      placeholder="Graduation Year"
                      className="resume-input"
                    />

                  </div>


                  {formData.education.length >
                    1 && (

                    <button
                      type="button"
                      onClick={() =>
                        removeEducation(
                          index
                        )
                      }
                      className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                    >
                      Remove Education
                    </button>

                  )}

                </div>

              )
            )}

          </div>

        </section>


        {/* ========================================
            SKILLS
        ======================================== */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-xl font-semibold">
            Technical Skills
          </h3>


          <div className="mt-6 space-y-6">

            <SkillSection
              title="Programming Languages"
              category="languages"
              skills={
                formData.skills.languages
              }
              inputValue={
                skillInputs.languages
              }
              onInputChange={
                handleSkillInputChange
              }
              onAdd={addSkill}
              onRemove={removeSkill}
            />


            <SkillSection
              title="Frontend"
              category="frontend"
              skills={
                formData.skills.frontend
              }
              inputValue={
                skillInputs.frontend
              }
              onInputChange={
                handleSkillInputChange
              }
              onAdd={addSkill}
              onRemove={removeSkill}
            />


            <SkillSection
              title="Backend"
              category="backend"
              skills={
                formData.skills.backend
              }
              inputValue={
                skillInputs.backend
              }
              onInputChange={
                handleSkillInputChange
              }
              onAdd={addSkill}
              onRemove={removeSkill}
            />


            <SkillSection
              title="Databases"
              category="databases"
              skills={
                formData.skills.databases
              }
              inputValue={
                skillInputs.databases
              }
              onInputChange={
                handleSkillInputChange
              }
              onAdd={addSkill}
              onRemove={removeSkill}
            />


            <SkillSection
              title="Tools"
              category="tools"
              skills={
                formData.skills.tools
              }
              inputValue={
                skillInputs.tools
              }
              onInputChange={
                handleSkillInputChange
              }
              onAdd={addSkill}
              onRemove={removeSkill}
            />

          </div>

        </section>


        {/* ========================================
            PROJECTS
        ======================================== */}

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-xl font-semibold">
                Projects
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Add projects that demonstrate your technical skills.
              </p>

            </div>


            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">

              {formData.projects.length}{' '}

              {formData.projects.length === 1
                ? 'Project'
                : 'Projects'}

            </span>

          </div>


          {/* PROJECT FORM */}

          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-5">

            <h4 className="text-lg font-medium text-white">

              {editingProjectIndex !== null
                ? 'Edit Project'
                : 'Add New Project'}

            </h4>


            <div className="mt-5 space-y-4">

              <input
                type="text"
                name="name"
                value={
                  projectForm.name
                }
                onChange={
                  handleProjectChange
                }
                placeholder="Project Name"
                className="resume-input"
              />


              <input
                type="text"
                name="technologies"
                value={
                  projectForm.technologies
                }
                onChange={
                  handleProjectChange
                }
                placeholder="Technologies used (e.g. React, Node.js, MongoDB)"
                className="resume-input"
              />


              <textarea
                name="description"
                value={
                  projectForm.description
                }
                onChange={
                  handleProjectChange
                }
                placeholder="Describe your project, what you built, and what problem it solves..."
                rows="5"
                className="resume-input"
              />


              <div className="grid gap-4 md:grid-cols-2">

                <input
                  type="url"
                  name="github"
                  value={
                    projectForm.github
                  }
                  onChange={
                    handleProjectChange
                  }
                  placeholder="GitHub URL"
                  className="resume-input"
                />


                <input
                  type="url"
                  name="liveDemo"
                  value={
                    projectForm.liveDemo
                  }
                  onChange={
                    handleProjectChange
                  }
                  placeholder="Live Demo URL"
                  className="resume-input"
                />

              </div>


              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={
                    editingProjectIndex !== null
                      ? saveProjectEdit
                      : addProject
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
                >

                  {editingProjectIndex !== null
                    ? 'Save Project'
                    : '+ Add Project'}

                </button>


                {editingProjectIndex !== null && (

                  <button
                    type="button"
                    onClick={
                      cancelProjectEdit
                    }
                    className="rounded-lg bg-slate-700 px-5 py-3 font-semibold hover:bg-slate-600"
                  >
                    Cancel
                  </button>

                )}

              </div>

            </div>

          </div>


          {/* PROJECT LIST */}

          {formData.projects.length > 0 && (

            <div className="mt-6 space-y-4">

              {formData.projects.map(
                (project, index) => (

                  <div
                    key={
                      project._id ||
                      `project-${index}`
                    }
                    className="rounded-lg border border-slate-700 bg-slate-800/60 p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h4 className="text-lg font-semibold text-white">
                          {project.name}
                        </h4>


                        {project.technologies && (

                          <p className="mt-1 text-sm text-blue-400">
                            {project.technologies}
                          </p>

                        )}

                      </div>


                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            startEditingProject(
                              project,
                              index
                            )
                          }
                          className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            deleteProject(
                              index
                            )
                          }
                          className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>

                      </div>

                    </div>


                    {project.description && (

                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        {project.description}
                      </p>

                    )}


                    {(project.github ||
                      project.liveDemo) && (

                      <div className="mt-4 flex flex-wrap gap-4">

                        {project.github && (

                          <a
                            href={
                              project.github
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-400 hover:text-blue-300"
                          >
                            GitHub →
                          </a>

                        )}


                        {project.liveDemo && (

                          <a
                            href={
                              project.liveDemo
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-green-400 hover:text-green-300"
                          >
                            Live Demo →
                          </a>

                        )}

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}


          {formData.projects.length === 0 && (

            <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-800/30 p-8 text-center">

              <p className="text-slate-400">
                No projects added yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first project above.
              </p>

            </div>

          )}

        </section>


        {/* ========================================
            ERROR / SUCCESS
        ======================================== */}

        {error && (

          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </p>

        )}


        {success && (

          <p className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </p>

        )}


        {/* ========================================
            ACTION BUTTONS
        ======================================== */}

        <div className="mt-8 flex justify-end gap-4">

          <button
            type="button"
            onClick={() =>
              setShowPreview(true)
            }
            className="rounded-lg border border-blue-500/40 px-8 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/10"
          >
            Preview Resume
          </button>


          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {saving
              ? 'Saving...'
              : 'Save Resume'}

          </button>

        </div>

      </main>

    </div>

  )

}


// ============================================
// RESUME PREVIEW SECTION
// ============================================

function ResumePreviewSection({
  title,
  children
}) {

  return (

    <section className="mt-6">

      <h2 className="border-b border-slate-900 pb-1 text-sm font-bold uppercase tracking-wider text-slate-900">

        {title}

      </h2>

      <div className="mt-3">

        {children}

      </div>

    </section>

  )

}


// ============================================
// SKILL PREVIEW ROW
// ============================================

function SkillPreviewRow({
  title,
  skills
}) {

  return (

    <div>

      <span className="font-bold text-slate-800">
        {title}:
      </span>{' '}

      <span className="text-slate-700">
        {skills.join(', ')}
      </span>

    </div>

  )

}


// ============================================
// SKILL SECTION
// ============================================

function SkillSection({
  title,
  category,
  skills,
  inputValue,
  onInputChange,
  onAdd,
  onRemove
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {title}
      </label>


      <div className="flex gap-3">

        <input
          type="text"
          value={inputValue}
          onChange={(e) =>
            onInputChange(
              category,
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (e.key === 'Enter') {

              e.preventDefault()

              onAdd(category)

            }

          }}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="resume-input flex-1"
        />


        <button
          type="button"
          onClick={() =>
            onAdd(category)
          }
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
        >
          Add
        </button>

      </div>


      {skills.length > 0 && (

        <div className="mt-3 flex flex-wrap gap-2">

          {skills.map(
            (skill, index) => (

              <div
                key={index}
                className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400"
              >

                <span>
                  {skill}
                </span>


                <button
                  type="button"
                  onClick={() =>
                    onRemove(
                      category,
                      index
                    )
                  }
                  className="text-blue-400 hover:text-red-400"
                >
                  ×
                </button>

              </div>

            )
          )}

        </div>

      )}

    </div>

  )

}


export default Resume