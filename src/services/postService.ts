import { postService as listService }    from "@/modules/posts/list/api/postService";
import { postService as detailsService } from "@/modules/posts/details/api/postService";

export const postService = { ...listService, ...detailsService };
