"use client";

import React, { useState, useEffect } from 'react';
import { Template, Topic } from '@/types';
import { TemplateCard } from '@/components/template/template-card';
import { getAllTemplates, searchTemplates } from '@/lib/api/template-service';
import { getAllTopics } from '@/lib/api/topic-service';
import { getLikesByTemplate, checkLike } from '@/lib/api/like-service';
import { getCommentsByTemplate } from '@/lib/api/comment-service';
import { useAuth } from '@/contexts/auth-context';

interface TemplateGalleryProps {
  templates?: Template[];
  loading?: boolean;
  showTopicFilter?: boolean;
  showFeaturedSection?: boolean;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates: initialTemplates,
  loading: initialLoading = false,
  showTopicFilter = true,
  showFeaturedSection = false,
}) => {
  const [loading, setLoading] = useState(initialLoading);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates || []);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, number>>({});
  const [likedTemplatesMap, setLikedTemplatesMap] = useState<Record<string, boolean>>({});
  const { isAuthenticated } = useAuth();

  // Fetch templates if not provided
  useEffect(() => {
    if (initialTemplates) {
      setTemplates(initialTemplates);
      return;
    }

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const fetchedTemplates = await getAllTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [initialTemplates]);

  // Fetch topics for filtering
  useEffect(() => {
    if (!showTopicFilter) return;

    const fetchTopics = async () => {
      try {
        const fetchedTopics = await getAllTopics();
        setTopics(fetchedTopics);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      }
    };

    fetchTopics();
  }, [showTopicFilter]);

  // Load likes and comments counts for each template
  useEffect(() => {
    const fetchLikesAndComments = async () => {
      if (templates.length === 0) return;

      const likesData: Record<string, number> = {};
      const commentsData: Record<string, number> = {};
      const likedData: Record<string, boolean> = {};

      await Promise.all(
        templates.map(async (template) => {
          try {
            // Get likes count
            const likesResponse = await getLikesByTemplate(template.id);
            likesData[template.id] = likesResponse.likesCount;

            // Get comments count
            const comments = await getCommentsByTemplate(template.id);
            commentsData[template.id] = comments.length;

            // Check if current user liked this template (only if authenticated)
            if (isAuthenticated) {
              try {
                const likedResponse = await checkLike(template.id);
                likedData[template.id] = likedResponse.liked;
              } catch (err) {
                console.error(`Error checking like for template ${template.id}:`, err);
                likedData[template.id] = false;
              }
            }
          } catch (err) {
            console.error(`Error fetching data for template ${template.id}:`, err);
            likesData[template.id] = 0;
            commentsData[template.id] = 0;
            likedData[template.id] = false;
          }
        })
      );

      setLikesMap(likesData);
      setCommentsMap(commentsData);
      setLikedTemplatesMap(likedData);
    };

    fetchLikesAndComments();
  }, [templates, isAuthenticated]);

  // Filter templates by topic
  const filteredTemplates = selectedTopic === 'all'
    ? templates
    : templates.filter(template => template.topicId === selectedTopic);

  // Toggle topic filter
  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  return (
    <div className="space-y-8">
      {/* Topic filters */}
      {showTopicFilter && topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-md text-sm ${
              selectedTopic === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => handleTopicChange('all')}
          >
            All Topics
          </button>
          
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`px-4 py-2 rounded-md text-sm ${
                selectedTopic === topic.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => handleTopicChange(topic.id)}
            >
              {topic.name}
            </button>
          ))}
        </div>
      )}

      {/* Templates grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="border rounded-lg p-4 h-[300px] animate-pulse bg-muted"
            />
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              likesCount={likesMap[template.id] || 0}
              commentsCount={commentsMap[template.id] || 0}
              isLiked={likedTemplatesMap[template.id] || false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            {selectedTopic !== 'all' 
              ? "No templates found for this topic." 
              : "There are no templates available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
};