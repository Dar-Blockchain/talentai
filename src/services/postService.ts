import { postService as listService }    from "@/modules/company/posts/list/api/postService";
import { postService as detailsService } from "@/modules/company/posts/details/api/postService";

export const postService = { ...listService, ...detailsService };
