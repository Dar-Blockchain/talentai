# POST /post/save-post
# PUT  /post/updatePost/:id

## Response

```
{
  success:    true
  planUsage:  number | null
  data: {
    _id:                string
    creationType:       "ai" | "manual" | null
    interviewLanguages: string[]
    expirationDate:     string | null
    title:              string
    description:        string
    requirements:       string[]
    responsibilities:   string[]
    location:           string
    workMode:           string
    employmentType:     string
    experienceLevel:    string
    salary: {
      min:      number
      max:      number
      currency: string
    }
    requiredSkills: {
      name:       string
      level:      number
      category:   string
      percentage: number
    }[]
    softSkills: {
      name:       string
      level:      number
      percentage: number
    }[]
  }
}
```
