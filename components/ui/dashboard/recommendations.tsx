import React from 'react';

interface RecommendationsProps {
  projectId?: string;
  artifactId?: string;
  tags?: string[];
  recommendations: {
    projects: string[];
    artifacts: string[];
    tags: string[];
  };
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Recommendations</h2>
      {recommendations.projects.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Recommended Projects</h3>
          <ul className="list-disc pl-5">
            {recommendations.projects.map((project, index) => (
              <li key={index}>{project}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendations.artifacts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Recommended Artifacts</h3>
          <ul className="list-disc pl-5">
            {recommendations.artifacts.map((artifact, index) => (
              <li key={index}>{artifact}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendations.tags.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Recommended Tags</h3>
          <div className="flex flex-wrap gap-2">
            {recommendations.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}