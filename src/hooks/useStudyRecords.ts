import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { StudyRecord, StudyInput } from "../types/studyRecord";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useStudyRecords = () => {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase.from("study-record").select("*");
    if (error) {
      console.log("Error", error);
    } else {
      setRecords(data as StudyRecord[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const addRecord = async ({ title, time }: StudyInput) => {
    const { error } = await supabase
      .from("study-record")
      .insert([{ title, time }]);
    if (error) {
      console.error("Error", error);
      throw error;
    }
    await fetchData();
  };

  const updateRecord = async (id: string, { title, time }: StudyInput) => {
    const { error } = await supabase
      .from("study-record")
      .update({ title, time })
      .eq("id", id);
    if (error) {
      console.error("Error", error);
      throw error;
    }
    await fetchData();
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Sure?")) {
      return;
    }
    const { error } = await supabase.from("study-record").delete().eq("id", id);
    if (error) {
      console.error("Error", error);
    }
    await fetchData();
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
  };
};
