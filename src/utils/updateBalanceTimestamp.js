import { supabase } from "../lib/supabase";

export const updateBalanceTimestamp = async (eventId) => {
  if (!eventId) return;

  const { error } = await supabase
    .from("events")
    .update({
      balance_updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    console.error("Error updating balance timestamp:", error);
  }
};
