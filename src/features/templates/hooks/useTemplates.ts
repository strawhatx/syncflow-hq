import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Template, TemplateCategory } from '@/integrations/supabase/types';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplatesAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('template_categories')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        // Fetch templates with their related data
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select(`
            *,
            source_integration:source_integration_id (
              id,
              name,
              icon
            ),
            destination_integration:destination_integration_id (
              id,
              name,
              icon
            ),
            category:category_id (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (templatesError) throw templatesError;
        setTemplates(templatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesAndCategories();
  }, []);

  return {
    templates,
    categories,
    loading,
    error
  };
}; 