export const createPostKeys = {
  all: ["create-post"] as const,
  generate: () => [...createPostKeys.all, "generate"] as const,
  save: () => [...createPostKeys.all, "save"] as const,
};
