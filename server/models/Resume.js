const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema(
  {
    // ============================================
    // USER
    // ============================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // ============================================
    // PERSONAL INFORMATION
    // ============================================

    personalInfo: {
      fullName: {
        type: String,
        default: ''
      },

      email: {
        type: String,
        default: ''
      },

      phone: {
        type: String,
        default: ''
      },

      location: {
        type: String,
        default: ''
      },

      linkedin: {
        type: String,
        default: ''
      },

      github: {
        type: String,
        default: ''
      },

      portfolio: {
        type: String,
        default: ''
      }
    },

    // ============================================
    // PROFESSIONAL SUMMARY
    // ============================================

    summary: {
      type: String,
      default: ''
    },

    // ============================================
    // EDUCATION
    // ============================================

    education: [
      {
        degree: {
          type: String,
          default: ''
        },

        college: {
          type: String,
          default: ''
        },

        university: {
          type: String,
          default: ''
        },

        startYear: {
          type: String,
          default: ''
        },

        endYear: {
          type: String,
          default: ''
        },

        cgpa: {
          type: Number,
          default: 0
        }
      }
    ],

    // ============================================
    // SKILLS
    // ============================================

    skills: {
      languages: {
        type: [String],
        default: []
      },

      frontend: {
        type: [String],
        default: []
      },

      backend: {
        type: [String],
        default: []
      },

      databases: {
        type: [String],
        default: []
      },

      tools: {
        type: [String],
        default: []
      }
    },

    // ============================================
    // PROJECTS
    // ============================================

    projects: [
      {
        title: {
          type: String,
          default: ''
        },

        technologies: {
          type: [String],
          default: []
        },

        description: {
          type: String,
          default: ''
        },

        github: {
          type: String,
          default: ''
        },

        liveLink: {
          type: String,
          default: ''
        }
      }
    ],

    // ============================================
    // EXPERIENCE
    // ============================================

    experience: [
      {
        company: {
          type: String,
          default: ''
        },

        role: {
          type: String,
          default: ''
        },

        startDate: {
          type: String,
          default: ''
        },

        endDate: {
          type: String,
          default: ''
        },

        description: {
          type: String,
          default: ''
        }
      }
    ],

    // ============================================
    // CERTIFICATIONS
    // ============================================

    certifications: [
      {
        name: {
          type: String,
          default: ''
        },

        organization: {
          type: String,
          default: ''
        },

        year: {
          type: String,
          default: ''
        },

        link: {
          type: String,
          default: ''
        }
      }
    ],

    // ============================================
    // ACHIEVEMENTS
    // ============================================

    achievements: [
      {
        title: {
          type: String,
          default: ''
        },

        description: {
          type: String,
          default: ''
        }
      }
    ]
  },

  {
    timestamps: true
  }
)

module.exports = mongoose.model(
  'Resume',
  resumeSchema
)