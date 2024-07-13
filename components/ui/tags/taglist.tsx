import React, { useState, useEffect } from 'react';
import { Tag } from '@/app/lib/definitions';
import { useTagStore } from '@/app/lib/store/tag-store';
import { handleTagUpdate } from '@/app/lib/actions/tag-handlers';

interface TagListProps {
  initialTags?: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  projectId?: string;
  artifactId?: string;
  accountId: string;
}

export function TagList({ initialTags = [], onTagsChange, projectId, artifactId, accountId }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [showAddForm, setShowAddForm] = useState(false);
  const { allTags, fetchAllTags, addTag } = useTagStore();

  useEffect(() => {
    fetchAllTags(accountId);
  }, [accountId, fetchAllTags]);

  const handleAddTag = async (tagName: string) => {
    if (!tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      let newTag: Tag;
      const existingTag = allTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
      
      if (existingTag) {
        newTag = existingTag;
      } else {
        newTag = await addTag(accountId, tagName);
      }

      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      onTagsChange(updatedTags);

      if (projectId) {
        await handleTagUpdate(accountId, projectId, updatedTags.map(t => t.name), true);
      } else if (artifactId) {
        await handleTagUpdate(accountId, artifactId, updatedTags.map(t => t.name), false);
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    onTagsChange(updatedTags);

    if (projectId) {
      await handleTagUpdate(accountId, projectId, updatedTags.map(t => t.name), true);
    } else if (artifactId) {
      await handleTagUpdate(accountId, artifactId, updatedTags.map(t => t.name), false);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map((tag: Tag) => (
        <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center">
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="ml-1 text-xs text-blue-800 hover:text-blue-900"
          >
            ×
          </button>
        </span>
      ))}
      {showAddForm ? (
        <AddTagForm
          existingTags={allTags.filter(tag => !tags.some(t => t.name.toLowerCase() === tag.name.toLowerCase()))}
          onAddTag={handleAddTag}
          onClose={() => setShowAddForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          + Add Tag
        </button>
      )}
    </div>
  );
}

interface AddTagFormProps {
  existingTags: Tag[];
  onAddTag: (tagName: string) => void;
  onClose: () => void;
}

function AddTagForm({ existingTags, onAddTag, onClose }: AddTagFormProps) {
  const [newTag, setNewTag] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);

  useEffect(() => {
    setFilteredTags(
      existingTags.filter(tag => 
        tag.name.toLowerCase().includes(newTag.toLowerCase())
      )
    );
  }, [newTag, existingTags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start">
      <div className="flex items-center">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag"
          className="border rounded px-2 py-1 text-sm"
        />
        <button type="submit" className="ml-1 text-xs bg-blue-500 text-white px-2 py-1 rounded">Add</button>
        <button type="button" onClick={onClose} className="ml-1 text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">Cancel</button>
      </div>
      {filteredTags.length > 0 && (
        <ul className="mt-2 max-h-32 overflow-y-auto">
          {filteredTags.map(tag => (
            <li 
              key={tag.id} 
              className="cursor-pointer hover:bg-gray-100 p-1"
              onClick={() => {
                onAddTag(tag.name);
                onClose();
              }}
            >
              {tag.name}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}