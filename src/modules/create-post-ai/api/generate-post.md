# POST /post/generate-job-post

## Request

| Field               | Type     | Required |
|---------------------|----------|----------|
| description         | string   | yes      |
| contractType        | string   | no       |
| workMode            | string   | no       |
| language            | string   | no       |
| interviewLanguages  | string[] | no       |

## Response

```
{
  jobDetails: {
    title:           string
    description:     string
    requirements:    string[]
    responsibilities: string[]
    location:        string
    workMode:        string
    employmentType:  string
    experienceLevel: string
    salary: {
      min:      number
      max:      number
      currency: string
    }
  }
  requiredSkills: RequiredSkill[]
  softSkills:     SoftSkill[]

  RequiredSkill {
    name:       string
    level:      number
    category:   string
    percentage: number
  }

  SoftSkill {
    name:       string
    level:      number
    percentage: number
  }
}
```
