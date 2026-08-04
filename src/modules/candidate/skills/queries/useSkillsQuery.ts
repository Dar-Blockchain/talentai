import { useQuery } from '@tanstack/react-query';
import { fetchMySkills } from '../api/skills.api';
import type { SkillsParams } from '../types/skill.types';

export const skillsKeys = {
  all:  ()                 => ['skills']               as const,
  mine: (p: SkillsParams) => ['skills', 'mine', p]    as const,
};

export function useMySkillsQuery(params: SkillsParams = {}) {
  return useQuery({
    queryKey: skillsKeys.mine(params),
    queryFn:  () => fetchMySkills(params),
    staleTime: 60_000,
  });
}
