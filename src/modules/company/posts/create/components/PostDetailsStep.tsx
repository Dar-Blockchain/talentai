import { useState } from "react";
import PostDescription from "./PostDescription";
import PostPreview from "./PostPreview";

const PostDetailsStep = () => {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <PostDescription onGeneratingChange={setGenerating} />
      <PostPreview generating={generating} />
    </div>
  );
};

export default PostDetailsStep;
