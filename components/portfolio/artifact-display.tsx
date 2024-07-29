import { ArtifactWithRelations, ArtifactContent } from "@/app/lib/definitions/definitions";

export const ArtifactDisplay = ({ artifact }: { artifact: ArtifactWithRelations }) => {
  return (
    <div className="artifact">
      {artifact.name && <h3>{artifact.name}</h3>}
      {artifact.description && <p>{artifact.description}</p>}
      {artifact.contents.map((content) => (
        <ContentDisplay key={content.id} content={content} />
      ))}
    </div>
  );
};

export const ContentDisplay = ({ content }: { content: ArtifactContent }) => {
  switch (content.type) {
    case 'text':
    case 'longText':
      return <TextContent content={content} />;
    case 'image':
      return <ImageContent content={content} />;
    case 'file':
      return <FileContent content={content} />;
    case 'link':
      return <LinkContent content={content} />;
    case 'embed':
      return <EmbedContent content={content} />;
    default:
      return null;
  }
};

export const TextContent = ({ content }: { content: ArtifactContent }) => (
  <p>{content.content}</p>
);

export const ImageContent = ({ content }: { content: ArtifactContent }) => (
  <img src={content.content} alt={content.metadata?.originalName || 'Image'} />
);

// Implement other content type components...
// (I just made a few of them up to temporarily get rid of red lines)
export const FileContent = ({ content }: { content: ArtifactContent }) => (
  <p>
    <a href={content.content}></a>
  </p>
);

export const LinkContent = ({ content }: { content: ArtifactContent }) => (
  <p>
    <a href={content.content}></a>
  </p>
);

export const EmbedContent = ({ content }: { content: ArtifactContent }) => (
  <p>
    <a href={content.content}></a>
  </p>
);