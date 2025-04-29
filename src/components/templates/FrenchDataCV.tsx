import React from 'react'
import styles from '@/styles/ResumeBuilder.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faEnvelope, faGlobe, faGraduationCap, faBriefcase, faCode, faLanguage, faAward, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'
import { CSSProperties } from 'react'

interface FrenchDataCVProps {
  data?: any;
  isPreview?: boolean;
}

export default function FrenchDataCV({ data, isPreview = false }: FrenchDataCVProps) {
  // This would normally use data from props, but for now we'll use sample data
  const resumeData = data || {
    contact: {
      name: "Jean Dupont",
      title: "Data Scientist Senior",
      phone: "+33 7 12 34 56 78",
      email: "jean.dupont@email.com",
      linkedin: "linkedin.com/in/jeandupont",
      github: "github.com/jeandupont",
      location: "Paris, France"
    },
    summary: "Data Scientist passionné avec 5+ ans d'expérience dans l'analyse de données et le développement d'algorithmes d'intelligence artificielle. Expertise en machine learning, deep learning et traitement de données massives. Orienté résultats avec un fort esprit d'équipe.",
    formation: [
      {
        degree: "Diplôme d'Ingénieur",
        school: "École Polytechnique",
        specialization: "Spécialité Architecture et IA",
        year: "2019 - 2022",
        achievements: "Major de promotion, projet de fin d'études sur l'optimisation des réseaux de neurones"
      },
      {
        degree: "Master en Data Science",
        school: "ENS Paris-Saclay",
        specialization: "Cloud Computing et Big Data",
        year: "2017 - 2019",
        achievements: "Mention très bien"
      }
    ],
    experience: [
      {
        title: "Data Scientist Senior",
        company: "Davi Systèmes",
        location: "Paris, France",
        period: "Janvier 2020 - Présent",
        description: "Développement et implémentation d'algorithmes d'apprentissage automatique pour l'analyse prédictive des comportements clients. Optimisation des processus data.",
        achievements: [
          "Implémentation d'un système de recommandation qui a augmenté les ventes de 23%",
          "Direction d'une équipe de 5 data scientists juniors",
          "Réduction du temps de traitement des données par 40% via l'optimisation des pipelines"
        ]
      },
      {
        title: "Stagiaire Data Scientist",
        company: "Orange Labs",
        location: "Sophia Antipolis, France",
        period: "Juin 2019 - Décembre 2019",
        description: "Analyse des données clients et développement d'algorithmes de recommandation pour améliorer l'expérience utilisateur.",
        achievements: [
          "Création d'un dashboard de visualisation de données en temps réel",
          "Développement d'un algorithme de prédiction de churn avec 88% de précision"
        ]
      }
    ],
    skills: [
      { name: "Python", level: 95 },
      { name: "TensorFlow", level: 90 },
      { name: "PyTorch", level: 85 },
      { name: "SQL", level: 90 },
      { name: "Hadoop", level: 80 },
      { name: "Spark", level: 85 },
      { name: "AWS", level: 80 },
      { name: "GCP", level: 75 },
      { name: "Docker", level: 85 },
      { name: "Kubernetes", level: 75 },
      { name: "Git", level: 90 },
      { name: "Machine Learning", level: 95 }
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Courant (C1)" },
      { name: "Allemand", level: "Intermédiaire (B1)" }
    ],
    certifications: [
      { name: "Google Professional Data Engineer", year: "2022" },
      { name: "AWS Certified Machine Learning", year: "2021" },
      { name: "Deep Learning Specialization (Coursera)", year: "2020" }
    ]
  };

  // Custom styles for more professional appearance
  const customStyles: Record<string, CSSProperties> = {
    container: {
      fontFamily: "'Calibri', 'Roboto', sans-serif",
      color: '#333',
      lineHeight: '1.5',
      padding: isPreview ? '10px' : '30px',
      maxWidth: '100%',
      height: '100%',
      boxSizing: 'border-box'
    },
    header: {
      borderBottom: '2px solid #5170b7',
      paddingBottom: '15px',
      marginBottom: '20px'
    },
    name: {
      fontSize: isPreview ? '14px' : '26px',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '5px',
      letterSpacing: '0.5px'
    },
    title: {
      fontSize: isPreview ? '12px' : '18px',
      color: '#5170b7',
      marginBottom: '10px',
      fontWeight: '500'
    },
    summary: {
      fontSize: isPreview ? '10px' : '14px',
      lineHeight: '1.6',
      color: '#444',
      marginBottom: '20px',
      padding: '10px 0',
      borderBottom: '1px solid #eaeaea'
    },
    sectionTitle: {
      fontSize: isPreview ? '12px' : '16px',
      fontWeight: 'bold',
      color: '#5170b7',
      textTransform: 'uppercase' as const,
      marginBottom: '12px',
      letterSpacing: '1px',
      display: 'flex',
      alignItems: 'center'
    },
    sectionIcon: {
      marginRight: '8px',
      fontSize: isPreview ? '10px' : '14px',
      color: '#5170b7',
      width: '20px'
    },
    contactList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: isPreview ? '5px' : '10px',
      marginBottom: '15px'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: isPreview ? '9px' : '13px',
      marginRight: '15px',
      color: '#444'
    },
    contactIcon: {
      marginRight: '8px',
      color: '#5170b7',
      fontSize: isPreview ? '8px' : '12px'
    },
    experienceItem: {
      marginBottom: isPreview ? '10px' : '20px',
      paddingBottom: isPreview ? '5px' : '15px',
      borderBottom: '1px solid #f0f0f0'
    },
    jobTitle: {
      fontSize: isPreview ? '10px' : '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '3px'
    },
    company: {
      fontSize: isPreview ? '9px' : '14px',
      color: '#5170b7',
      fontWeight: '500',
      marginBottom: '3px'
    },
    period: {
      fontSize: isPreview ? '8px' : '12px',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: '8px'
    },
    description: {
      fontSize: isPreview ? '8px' : '13px',
      color: '#444',
      marginBottom: '8px',
      lineHeight: '1.5'
    },
    achievementsList: {
      marginLeft: isPreview ? '8px' : '15px',
      marginTop: '5px'
    },
    achievement: {
      fontSize: isPreview ? '8px' : '13px',
      color: '#444',
      marginBottom: '3px'
    },
    skillsContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      marginBottom: '20px'
    },
    skillItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      fontSize: isPreview ? '9px' : '13px',
      marginBottom: '3px'
    },
    skillName: {
      marginBottom: '2px'
    },
    skillBar: {
      height: isPreview ? '3px' : '4px',
      background: '#eaeaea',
      borderRadius: '2px',
      position: 'relative'
    },
    skillLevel: {
      height: '100%',
      backgroundColor: '#5170b7',
      borderRadius: '2px'
    },
    languageItem: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: isPreview ? '9px' : '13px',
      marginBottom: '5px'
    },
    certificationItem: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: isPreview ? '9px' : '13px',
      marginBottom: '5px'
    }
  };

  return (
    <div style={customStyles.container}>
      {/* Header Section */}
      <div style={customStyles.header}>
        <div style={customStyles.name}>{resumeData.contact.name}</div>
        <div style={customStyles.title}>{resumeData.contact.title}</div>
        
        <div style={customStyles.contactList}>
          <div style={customStyles.contactItem}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={customStyles.contactIcon} />
            {resumeData.contact.location}
          </div>
          <div style={customStyles.contactItem}>
            <FontAwesomeIcon icon={faPhone} style={customStyles.contactIcon} />
            {resumeData.contact.phone}
          </div>
          <div style={customStyles.contactItem}>
            <FontAwesomeIcon icon={faEnvelope} style={customStyles.contactIcon} />
            {resumeData.contact.email}
          </div>
          <div style={customStyles.contactItem}>
            <FontAwesomeIcon icon={faLinkedin} style={customStyles.contactIcon} />
            {resumeData.contact.linkedin}
          </div>
          <div style={customStyles.contactItem}>
            <FontAwesomeIcon icon={faGithub} style={customStyles.contactIcon} />
            {resumeData.contact.github}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div style={customStyles.summary}>
        {resumeData.summary}
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Left Column */}
        <div style={{ flex: '6' }}>
          {/* Experience Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={customStyles.sectionTitle}>
              <FontAwesomeIcon icon={faBriefcase} style={customStyles.sectionIcon} />
              Expériences Professionnelles
            </div>
            
            {resumeData.experience.map((exp: any, index: number) => (
              <div key={index} style={customStyles.experienceItem}>
                <div style={customStyles.jobTitle}>{exp.title}</div>
                <div style={customStyles.company}>{exp.company} • {exp.location}</div>
                <div style={customStyles.period}>{exp.period}</div>
                <div style={customStyles.description}>{exp.description}</div>
                
                {exp.achievements && (
                  <ul style={customStyles.achievementsList}>
                    {exp.achievements.map((achievement: string, i: number) => (
                      <li key={i} style={customStyles.achievement}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={customStyles.sectionTitle}>
              <FontAwesomeIcon icon={faGraduationCap} style={customStyles.sectionIcon} />
              Formation
            </div>
            
            {resumeData.formation.map((edu: any, index: number) => (
              <div key={index} style={customStyles.experienceItem}>
                <div style={customStyles.jobTitle}>{edu.degree}</div>
                <div style={customStyles.company}>{edu.school} • {edu.specialization}</div>
                <div style={customStyles.period}>{edu.year}</div>
                {edu.achievements && (
                  <div style={customStyles.description}>{edu.achievements}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: '4' }}>
          {/* Skills Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={customStyles.sectionTitle}>
              <FontAwesomeIcon icon={faCode} style={customStyles.sectionIcon} />
              Compétences Techniques
            </div>
            
            <div style={customStyles.skillsContainer}>
              {resumeData.skills.map((skill: any, index: number) => (
                <div key={index} style={customStyles.skillItem}>
                  <div style={customStyles.skillName}>{skill.name}</div>
                  <div style={customStyles.skillBar}>
                    <div style={{...customStyles.skillLevel, width: `${skill.level}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={customStyles.sectionTitle}>
              <FontAwesomeIcon icon={faLanguage} style={customStyles.sectionIcon} />
              Langues
            </div>
            
            {resumeData.languages.map((lang: any, index: number) => (
              <div key={index} style={customStyles.languageItem}>
                <div>{lang.name}</div>
                <div>{lang.level}</div>
              </div>
            ))}
          </div>

          {/* Certifications Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={customStyles.sectionTitle}>
              <FontAwesomeIcon icon={faAward} style={customStyles.sectionIcon} />
              Certifications
            </div>
            
            {resumeData.certifications.map((cert: any, index: number) => (
              <div key={index} style={customStyles.certificationItem}>
                <div>{cert.name}</div>
                <div>{cert.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 