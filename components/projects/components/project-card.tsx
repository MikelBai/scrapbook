// import React from 'react';
// import { ProjectWithBlocks } from "@/app/lib/definitions/definitions";
// import { BlockThumbnail } from '@/components/blocks/components/block-thumbnail';

// export const ProjectCard: React.FC<{ project: ProjectWithBlocks }> = ({ project }) => {
//   const mainBlock = project.blocks.find(a => a.contents.some(c => c.type === 'image'));
//   const mainImage = mainBlock?.contents.find(c => c.type === 'image');

//   return (
//     <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
//       {mainImage && (
//         <div className="aspect-w-16 aspect-h-9">
//           <BlockThumbnail block={mainBlock!} size={400} priority={true} />
//         </div>
//       )}
//       <div className="p-4">
//         <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
//         {project.description && <p className="text-sm text-gray-600 mb-2">{project.description}</p>}
//         <div className="flex justify-between items-center">
//           <span className={`text-sm font-medium ${project.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
//             {project.status}
//           </span>
//           <span className="text-sm text-gray-500">{project.blocks.length} blocks</span>
//         </div>
//         {project.tags && project.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-2">
//             {project.tags.map(tag => (
//               <span key={tag.id} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
//                 {tag.name}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };