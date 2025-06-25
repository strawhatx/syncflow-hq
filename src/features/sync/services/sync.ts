import { supabase } from "@/integrations/supabase/client";
import { Sync } from "@/types/sync";

export const saveStepData = async (syncId: string, step: string, data: Sync) => {
    console.log(`Saving step data for sync ${syncId} step ${step} with data ${JSON.stringify(data)}`);

    const { data: sync, error } = await supabase
        .from('syncs')
        .update({
            [step]: data,
        })
        .eq('id', syncId)
        .select()
        .single();

    if (error) {
        console.error(`Error saving step data for sync ${syncId} step ${step}: ${error.message}`);
    }
};