import { useState as S, useEffect as E } from 'react';
import { supabase as Q } from '../supabaseClient';

export const useRecipe = (slug0) => {
  const [recipe, setRecipe] = S(null);
  const [loading, setLoading] = S(true);

  E(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: rData, error: rError } = await Q
          .from('recipes')
          .select('*')
          .eq('slug', slug0)
          .single();

        if (rError) throw rError;

        if (rData) {
          const { data: sData } = await Q
            .from('steps')
            .select('*')
            .ilike('recipe_title', `%${rData.title.trim()}%`) 
            .order('step_number', { ascending: true });

          const { data: iData } = await Q
            .from('ingredients')
            .select('*')
            .eq('recipe_id', rData.id); 

          const finalIngredients = (iData && iData.length > 0) ? iData : rData.ingredients;

          setRecipe({ 
            ...rData, 
            steps: sData || [], 
            ingredients: finalIngredients || [] 
          });
        }
      } catch (e) {
        console.error("Error fetching recipe:", e.message);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug0) fetchData();
  }, [slug0]);

  return { recipe, loading };
};