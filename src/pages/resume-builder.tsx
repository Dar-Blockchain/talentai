'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import styles from '@/styles/ResumeBuilder.module.css'
import Canvas from '@/components/Canvas'
import Sidebar from '@/components/Sidebar'
import SectionRenderer from '@/components/SectionRenderer'
import {
  SectionType,
  TextSection,
  ExperienceSection,
  SkillsSection,
  LanguagesSection,
  EducationSection,
  HeaderSection,
  ProjectsSection,
  CustomSection
} from '@/models/sectionTypes'

export default function ResumeBuilder() {
  const [sections, setSections] = useState<SectionType[]>([])

  const updateSectionContent = (id: string, newContent: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === id ? { ...s, content: newContent } : s
      )
    )
  }

  const updateSectionPosition = (
    id: string,
    pos: { x: number; y: number; width: number; height: number }
  ) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, ...pos } : s))
    )
  }

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }
  const [activeId, setActiveId] = useState<string | null>(null)

  const duplicateSection = (id: string) => {
    const original = sections.find(s => s.id === id)
    if (!original) return
    const copy = {
      ...original,
      id: uuidv4(),
      x: original.x + 30,
      y: original.y + 30
    }
    setSections([...sections, copy])
  }

  const addSection = (type: string) => {
    const common = {
      id: uuidv4(),
      x: 100,
      y: 100,
      width: 400,
      height: 100,
    }

    let newSection: SectionType

    switch (type) {
      case 'text':
        newSection = {
          ...common,
          type: 'text',
          content: 'Editable text...'
        } as TextSection
        break
      case 'experience':
        newSection = {
          ...common,
          type: 'experience',
          title: 'Job Title',
          company: 'Company Name',
          startDate: 'Jan 2020',
          endDate: 'Dec 2022',
          description: 'Job responsibilities here...'
        } as ExperienceSection
        break
      case 'skills':
        newSection = {
          ...common,
          type: 'skills',
          skills: ['JavaScript', 'React', 'Node.js']
        } as SkillsSection
        break
      case 'languages':
        newSection = {
          ...common,
          type: 'languages',
          languages: [
            { name: 'English', level: 'Fluent' },
            { name: 'French', level: 'Intermediate' }
          ]
        } as LanguagesSection
        break
      case 'education':
        newSection = {
          ...common,
          type: 'education',
          institution: 'University Name',
          degree: 'Degree Title',
          startDate: '2018',
          endDate: '2022',
          description: 'Studied computer science...'
        } as EducationSection
        break
      case 'header':
        newSection = {
          ...common,
          type: 'header',
          name: 'John Doe',
          jobTitle: 'Full-Stack Developer'
        } as HeaderSection
        break
      case 'projects':
        newSection = {
          ...common,
          type: 'projects',
          projects: [
            {
              name: 'Awesome App',
              description: 'A cool project description...'
            }
          ]
        } as ProjectsSection
        break
      case 'custom':
      default:
        newSection = {
          ...common,
          type: 'custom',
          content: 'Write anything here...'
        } as CustomSection
        break
    }

    setSections(prev => [...prev, newSection])
  }

  return (
    <div className={styles.pageWrapper}
    onClick={() => setActiveId(null)}>
      {/* Sidebar on the left */}
      <Sidebar onAdd={addSection} />

      {/* Canvas on the right */}
      <Canvas>
        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map(section => (
              <SectionRenderer
              key={section.id}
              section={section}
              updateContent={updateSectionContent}
              updatePosition={updateSectionPosition}
              onDelete={deleteSection}
              onDuplicate={duplicateSection}
              isActive={activeId === section.id}
              onClick={() => setActiveId(section.id)}
            />
            ))}
          </SortableContext>
        </DndContext>
      </Canvas>
    </div>
  )
}
