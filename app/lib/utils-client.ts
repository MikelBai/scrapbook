import { Artifact } from './definitions';

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
export const getArtifactThumbnail = (artifact: Artifact) => {
  console.log('Artifact:', JSON.stringify(artifact, null, 2));

  if (!artifact) {
    console.log('Artifact is undefined');
    return '/placeholder-default.png';
  }

  if (!artifact.contents || artifact.contents.length === 0) {
    console.log('Artifact contents are undefined or empty');
    return '/placeholder-default.png';
  }

  switch (artifact.type) {
    case 'image':
      return artifact.contents[0].content || '/placeholder-default.png';
    case 'text':
      return '/placeholder-text.png';
    case 'file':
      return '/placeholder-file.png';
    default:
      return '/placeholder-default.png';
  }
};